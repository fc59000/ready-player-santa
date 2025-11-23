"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type GameRoom = {
  id: string;
  status: string;
  current_round_id: string | null;
};

type GameRound = {
  id: string;
  gift_id: string | null;
  question_id: string;
  status: string;
  winner_id: string | null;
};

type Participant = {
  id: string;
  player_id: string;
  has_won_gift: boolean;
  profiles: {
    pseudo: string;
  };
};

type Gift = {
  id: string;
  title: string;
  user_id : string;
};

type Question = {
  id: string;
  question: string;
  answers: string[];
  time_limit: number;
};

export default function AdminGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<string>("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: adminData } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!adminData) {
      alert("Accès refusé. Seuls les admins peuvent accéder à cette page.");
      router.push("/dashboard");
      return;
    }

    setIsAdmin(true);
    await loadData();
    subscribeToUpdates();
    setLoading(false);
  }

  async function loadData() {
    // Charger la room active
    const { data: roomData } = await supabase
      .from("game_rooms")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setCurrentRoom(roomData);

    if (roomData) {
      // Charger les participants
      const { data: participantsData } = await supabase
        .from("game_participants")
        .select("*, profiles(pseudo)")
        .eq("room_id", roomData.id);

      setParticipants(participantsData || []);

      // Charger le round en cours si existe
      if (roomData.current_round_id) {
        const { data: roundData } = await supabase
          .from("game_rounds")
          .select("*")
          .eq("id", roomData.current_round_id)
          .single();

        setCurrentRound(roundData);
      }
    }

    // Charger tous les cadeaux
    const { data: giftsData } = await supabase
      .from("gifts")
      .select("id, title, user_id ")
      .is("winner_player_id", null);

    setGifts(giftsData || []);

    // Charger toutes les questions
    const { data: questionsData } = await supabase
      .from("game_questions")
      .select("*");

    setQuestions(questionsData || []);
  }

  function subscribeToUpdates() {
    const channel = supabase
      .channel("admin_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_participants" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rooms" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rounds" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function createRoom() {
    const { data, error } = await supabase
      .from("game_rooms")
      .insert({ status: "lobby" })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Erreur lors de la création de la room");
      return;
    }

    setCurrentRoom(data);
    alert("Room créée ! Les joueurs peuvent maintenant rejoindre.");
  }

  async function startRound() {
    if (!currentRoom || !selectedGiftId || !selectedQuestionId) {
      alert("Sélectionne un cadeau et une question d'abord !");
      return;
    }

    // Créer le round
    const { data: newRound, error } = await supabase
      .from("game_rounds")
      .insert({
        room_id: currentRoom.id,
        gift_id: selectedGiftId,
        question_id: selectedQuestionId,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Erreur lors du démarrage du round");
      return;
    }

    // Mettre à jour la room
    await supabase
      .from("game_rooms")
      .update({
        status: "playing",
        current_round_id: newRound.id,
      })
      .eq("id", currentRoom.id);

    setCurrentRound(newRound);
    alert("Mini-jeu lancé ! Les joueurs peuvent répondre.");
  }

  async function endRound() {
    if (!currentRound) return;

    // Récupérer toutes les réponses
    const { data: answers } = await supabase
      .from("game_answers")
      .select("*, profiles(pseudo)")
      .eq("round_id", currentRound.id)
      .order("answered_at", { ascending: true });

    if (!answers || answers.length === 0) {
      alert("Aucune réponse reçue !");
      return;
    }

    // Récupérer la question pour connaître la bonne réponse
    const { data: question } = await supabase
      .from("game_questions")
      .select("correct_answer_index")
      .eq("id", currentRound.question_id)
      .single();

    // Filtrer les bonnes réponses
    const correctAnswers = answers.filter(
      (a) => a.answer_index === question?.correct_answer_index
    );

    if (correctAnswers.length === 0) {
      alert("Personne n'a trouvé la bonne réponse !");
      await supabase
        .from("game_rounds")
        .update({ status: "finished", ended_at: new Date().toISOString() })
        .eq("id", currentRound.id);
      
      await supabase
        .from("game_rooms")
        .update({ status: "results" })
        .eq("id", currentRoom!.id);
      return;
    }

    // Le gagnant est le plus rapide parmi les bonnes réponses
    const winner = correctAnswers[0];

    // Mettre à jour le round
    await supabase
      .from("game_rounds")
      .update({
        status: "finished",
        winner_id: winner.player_id,
        ended_at: new Date().toISOString(),
      })
      .eq("id", currentRound.id);

    // Marquer le cadeau comme gagné
    await supabase
      .from("gifts")
      .update({ winner_player_id: winner.player_id })
      .eq("id", currentRound.gift_id);

    // Marquer le participant comme ayant gagné
    await supabase
      .from("game_participants")
      .update({ has_won_gift: true })
      .eq("room_id", currentRoom!.id)
      .eq("player_id", winner.player_id);

    // Mettre la room en mode résultats
    await supabase
      .from("game_rooms")
      .update({ status: "results" })
      .eq("id", currentRoom!.id);

    alert(`Gagnant : ${(winner.profiles as any).pseudo} !`);
  }

  async function resetToLobby() {
    if (!currentRoom) return;

    await supabase
      .from("game_rooms")
      .update({ status: "lobby", current_round_id: null })
      .eq("id", currentRoom.id);

    setCurrentRound(null);
    setSelectedGiftId("");
    setSelectedQuestionId("");
    
    await loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Vérification des permissions...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎮 Admin — Pilotage de l'arène</h1>

        {/* Création de room */}
        {!currentRoom && (
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Aucune room active</h2>
            <button
              onClick={createRoom}
              className="px-6 py-3 bg-green-600 rounded hover:bg-green-700"
            >
              🚀 Créer une nouvelle room
            </button>
          </div>
        )}

        {/* Room active */}
        {currentRoom && (
          <>
            {/* Participants */}
            <div className="bg-zinc-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">
                Joueurs connectés ({participants.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 rounded ${
                      p.has_won_gift ? "bg-green-900" : "bg-zinc-700"
                    }`}
                  >
                    <p className="font-semibold">{(p.profiles as any)?.pseudo || "Joueur"}</p>
                    {p.has_won_gift && (
                      <p className="text-xs text-green-400">✅ A gagné</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contrôles */}
            {currentRoom.status === "lobby" && (
              <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Lancer un mini-jeu</h2>

                <div className="mb-4">
                  <label className="block text-sm mb-2">Cadeau en jeu :</label>
                  <select
                    value={selectedGiftId}
                    onChange={(e) => setSelectedGiftId(e.target.value)}
                    className="w-full p-2 bg-zinc-700 rounded"
                  >
                    <option value="">-- Sélectionner un cadeau --</option>
                    {gifts.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-2">Question :</label>
                  <select
                    value={selectedQuestionId}
                    onChange={(e) => setSelectedQuestionId(e.target.value)}
                    className="w-full p-2 bg-zinc-700 rounded"
                  >
                    <option value="">-- Sélectionner une question --</option>
                    {questions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.question}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={startRound}
                  disabled={!selectedGiftId || !selectedQuestionId}
                  className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-zinc-600"
                >
                  ▶️ Lancer le mini-jeu
                </button>
              </div>
            )}

            {currentRoom.status === "playing" && (
              <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Mini-jeu en cours...
                </h2>
                <p className="mb-4">Les joueurs sont en train de répondre.</p>
                <button
                  onClick={endRound}
                  className="px-6 py-3 bg-red-600 rounded hover:bg-red-700"
                >
                  ⏹️ Terminer et afficher les résultats
                </button>
              </div>
            )}

            {currentRoom.status === "results" && (
              <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Résultats affichés</h2>
                <button
                  onClick={resetToLobby}
                  className="px-6 py-3 bg-green-600 rounded hover:bg-green-700"
                >
                  ➡️ Passer au mini-jeu suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
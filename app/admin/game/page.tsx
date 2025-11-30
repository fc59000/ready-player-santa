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
  user_id: string;
  winner_player_id: string | null;
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
  const [availableGifts, setAvailableGifts] = useState<Gift[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
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

      // 🆕 Charger UNIQUEMENT les cadeaux disponibles (sans gagnant)
      const { data: giftsData } = await supabase
        .from("gifts")
        .select("id, title, user_id, winner_player_id")
        .is("winner_player_id", null);

      setAvailableGifts(giftsData || []);

      // 🆕 Charger UNIQUEMENT les questions non utilisées dans cette room
      const { data: usedQuestionsData } = await supabase
        .from("room_used_questions")
        .select("question_id")
        .eq("room_id", roomData.id);

      const usedQuestionIds = (usedQuestionsData || []).map((q) => q.question_id);

      const { data: allQuestionsData } = await supabase
        .from("game_questions")
        .select("*");

      // Filtrer les questions non utilisées
      const availableQuestionsFiltered = (allQuestionsData || []).filter(
        (q) => !usedQuestionIds.includes(q.id)
      );

      setAvailableQuestions(availableQuestionsFiltered);

      console.log(`📦 Cadeaux disponibles: ${giftsData?.length || 0}`);
      console.log(`❓ Questions disponibles: ${availableQuestionsFiltered.length}`);
    }
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

    // 🆕 Vérifier cas spécial : 1 joueur actif + 1 cadeau
    const activePlayers = participants.filter((p) => !p.has_won_gift);
    
    if (activePlayers.length === 1 && availableGifts.length === 1) {
      const lastPlayer = activePlayers[0];
      const lastGift = availableGifts[0];

      // Attribution automatique
      await supabase
        .from("gifts")
        .update({ winner_player_id: lastPlayer.player_id })
        .eq("id", lastGift.id);

      await supabase
        .from("game_participants")
        .update({ has_won_gift: true })
        .eq("room_id", currentRoom.id)
        .eq("player_id", lastPlayer.player_id);

      alert(`🎉 Attribution automatique ! ${(lastPlayer.profiles as any).pseudo} reçoit le dernier cadeau : ${lastGift.title}`);
      
      await loadData();
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

    // 🆕 Marquer la question comme utilisée
    await supabase
      .from("room_used_questions")
      .insert({
        room_id: currentRoom.id,
        question_id: selectedQuestionId,
      });

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
      alert("Personne n'a trouvé la bonne réponse ! Relance avec une autre question pour ce cadeau.");
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

  // 🆕 Calculer les joueurs actifs (qui n'ont pas encore gagné)
  const activePlayers = participants.filter((p) => !p.has_won_gift);

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
            {/* 🆕 Stats globales */}
            <div className="bg-zinc-800 rounded-lg p-6 mb-6 border-2 border-cyan-500/30">
              <h2 className="text-2xl font-semibold mb-4">📊 État de la partie</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900 p-4 rounded text-center">
                  <p className="text-3xl font-bold text-cyan-400">{activePlayers.length}</p>
                  <p className="text-sm text-zinc-400">Joueurs actifs</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded text-center">
                  <p className="text-3xl font-bold text-green-400">{availableGifts.length}</p>
                  <p className="text-sm text-zinc-400">Cadeaux restants</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded text-center">
                  <p className="text-3xl font-bold text-purple-400">{availableQuestions.length}</p>
                  <p className="text-sm text-zinc-400">Questions disponibles</p>
                </div>
              </div>
            </div>

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

                {/* 🆕 Alerte si plus de cadeaux ou joueurs */}
                {availableGifts.length === 0 && (
                  <div className="bg-red-900/30 border border-red-500 rounded p-4 mb-4">
                    <p className="text-red-300">🎁 Plus de cadeaux disponibles ! Tous les cadeaux ont été gagnés.</p>
                  </div>
                )}

                {activePlayers.length === 0 && (
                  <div className="bg-red-900/30 border border-red-500 rounded p-4 mb-4">
                    <p className="text-red-300">👥 Plus de joueurs actifs ! Tous ont gagné.</p>
                  </div>
                )}

                {availableQuestions.length === 0 && (
                  <div className="bg-orange-900/30 border border-orange-500 rounded p-4 mb-4">
                    <p className="text-orange-300">❓ Plus de questions disponibles ! Toutes ont été utilisées.</p>
                  </div>
                )}

                {/* 🆕 Message cas spécial */}
                {activePlayers.length === 1 && availableGifts.length === 1 && (
                  <div className="bg-cyan-900/30 border border-cyan-500 rounded p-4 mb-4">
                    <p className="text-cyan-300">🎯 Attribution automatique ! En lançant, le dernier joueur recevra le dernier cadeau.</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm mb-2">Cadeau en jeu :</label>
                  <select
                    value={selectedGiftId}
                    onChange={(e) => setSelectedGiftId(e.target.value)}
                    className="w-full p-2 bg-zinc-700 rounded"
                    disabled={availableGifts.length === 0}
                  >
                    <option value="">-- Sélectionner un cadeau --</option>
                    {availableGifts.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">
                    {availableGifts.length} cadeau(x) disponible(s)
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-2">Question :</label>
                  <select
                    value={selectedQuestionId}
                    onChange={(e) => setSelectedQuestionId(e.target.value)}
                    className="w-full p-2 bg-zinc-700 rounded"
                    disabled={availableQuestions.length === 0}
                  >
                    <option value="">-- Sélectionner une question --</option>
                    {availableQuestions.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.question}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">
                    {availableQuestions.length} question(s) disponible(s)
                  </p>
                </div>

                <button
                  onClick={startRound}
                  disabled={
                    !selectedGiftId ||
                    !selectedQuestionId ||
                    activePlayers.length === 0 ||
                    availableGifts.length === 0
                  }
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
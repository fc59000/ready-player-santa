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
  question_id: string;
  status: string;
  winner_id: string | null;
};

type Question = {
  id: string;
  question: string;
  answers: string[];
  time_limit: number;
};

export default function ArenaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    // Récupérer le pseudo
    const { data: profileData } = await supabase
      .from("profiles")
      .select("pseudo")
      .eq("id", user.id)
      .single();

    setPseudo(profileData?.pseudo || "Joueur");

    await loadRoom(user.id);
    subscribeToUpdates();
    setLoading(false);
  }

  async function loadRoom(playerUserId?: string) {
    const activeUserId = playerUserId || userId;
    
    console.log("🔍 [ARENA] Chargement de la room...");
    console.log("🔍 [ARENA] userId:", activeUserId);

    if (!activeUserId) {
      console.log("❌ [ARENA] Pas de userId, on arrête");
      return;
    }

    // Charger la room active
    const { data: roomData, error: roomError } = await supabase
      .from("game_rooms")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("🔍 [ARENA] Room récupérée:", roomData);
    console.log("🔍 [ARENA] Erreur room:", roomError);

    setCurrentRoom(roomData);

    if (!roomData) {
      console.log("❌ [ARENA] Aucune room trouvée");
      return;
    }

    // Vérifier si déjà participant
    const { data: participantData, error: participantError } = await supabase
      .from("game_participants")
      .select("*")
      .eq("room_id", roomData.id)
      .eq("player_id", activeUserId)
      .single();

    console.log("🔍 [ARENA] Participant trouvé:", participantData);
    console.log("🔍 [ARENA] Erreur participant:", participantError);

    setHasJoined(!!participantData);

    // Charger le round en cours si existe
    if (roomData.current_round_id) {
      console.log("🔍 [ARENA] Round en cours détecté:", roomData.current_round_id);

      const { data: roundData } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("id", roomData.current_round_id)
        .single();

      console.log("🔍 [ARENA] Round récupéré:", roundData);
      setCurrentRound(roundData);

      if (roundData && roundData.status === "active") {
        // Charger la question
        const { data: questionData } = await supabase
          .from("game_questions")
          .select("*")
          .eq("id", roundData.question_id)
          .single();

        console.log("🔍 [ARENA] Question récupérée:", questionData);
        setQuestion(questionData);

        // Vérifier si déjà répondu
        const { data: answerData } = await supabase
          .from("game_answers")
          .select("*")
          .eq("round_id", roundData.id)
          .eq("player_id", activeUserId)
          .single();

        console.log("🔍 [ARENA] Réponse existante:", answerData);
        setHasAnswered(!!answerData);
      }

      // Vérifier si winner
      if (roundData && roundData.winner_id === activeUserId) {
        console.log("🎉 [ARENA] Tu es le gagnant!");
        setIsWinner(true);
      }
    }

    console.log("✅ [ARENA] Chargement terminé");
  }

  function subscribeToUpdates() {
    const channel = supabase
      .channel("arena_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rooms" },
        () => loadRoom()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rounds" },
        () => loadRoom()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function joinArena() {
    if (!currentRoom || !userId) return;

    const { error } = await supabase.from("game_participants").insert({
      room_id: currentRoom.id,
      player_id: userId,
    });

    if (error) {
      console.error(error);
      alert("Erreur lors de la connexion à l'arène");
      return;
    }

    setHasJoined(true);
  }

  async function submitAnswer(answerIndex: number) {
    if (!currentRound || !userId || hasAnswered) return;

    setSelectedAnswer(answerIndex);

    const { error } = await supabase.from("game_answers").insert({
      round_id: currentRound.id,
      player_id: userId,
      answer_index: answerIndex,
    });

    if (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de la réponse");
      return;
    }

    setHasAnswered(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        Chargement...
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">⚔️ L'Arène</h1>
          <p className="text-zinc-400">
            Aucune partie en cours pour le moment.
          </p>
          <p className="text-sm text-zinc-500 mt-2">
            Attends que l'organisateur lance une partie.
          </p>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">⚔️ L'Arène</h1>
          <p className="text-xl mb-2">Prêt à jouer, {pseudo} ?</p>
          <p className="text-zinc-400 mb-6">
            Une partie est ouverte. Rejoins l'arène pour participer aux
            mini-jeux !
          </p>
          <button
            onClick={joinArena}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700"
          >
            🎮 Rejoindre l'arène
          </button>
        </div>
      </div>
    );
  }

  // En attente du début
  if (currentRoom.status === "lobby") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">🎮 En attente...</h1>
          <p className="text-zinc-400">
            Tu es connecté à l'arène, {pseudo}.
          </p>
          <p className="text-sm text-zinc-500 mt-2">
            Le jeu va bientôt commencer !
          </p>
          <div className="mt-6">
            <div className="animate-pulse text-4xl">⏳</div>
          </div>
        </div>
      </div>
    );
  }

  // Mini-jeu en cours
  if (currentRoom.status === "playing" && question && !hasAnswered) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <div className="max-w-2xl mx-auto py-10">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {question.question}
          </h1>

          <div className="grid grid-cols-1 gap-4">
            {question.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                className={`p-6 rounded-lg text-xl font-semibold transition ${
                  selectedAnswer === index
                    ? "bg-blue-600"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {answer}
              </button>
            ))}
          </div>

          <p className="text-center text-zinc-500 mt-6 text-sm">
            ⏱️ Réponds le plus vite possible !
          </p>
        </div>
      </div>
    );
  }

  // Réponse envoyée
  if (currentRoom.status === "playing" && hasAnswered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">✅ Réponse envoyée !</h1>
          <p className="text-zinc-400">Attends les résultats...</p>
          <div className="mt-6">
            <div className="animate-pulse text-4xl">⏳</div>
          </div>
        </div>
      </div>
    );
  }

  // Résultats
  if (currentRoom.status === "results") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
        <div className="text-center">
          {isWinner ? (
            <>
              <h1 className="text-5xl font-bold mb-4">🎉 Tu as gagné !</h1>
              <p className="text-2xl text-green-400">
                Félicitations {pseudo} !
              </p>
              <p className="text-zinc-400 mt-4">
                Tu as remporté un cadeau mystère 🎁
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4">Pas cette fois...</h1>
              <p className="text-zinc-400">
                Continue à jouer pour gagner un cadeau !
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
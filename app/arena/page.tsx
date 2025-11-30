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
    let channel: any;

    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", user.id)
        .single();

      setPseudo(profileData?.pseudo || "Joueur");

      await loadRoom(user.id);

      // Souscription Realtime
      channel = supabase
        .channel("arena_updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_rooms" },
          () => {
            console.log("🔄 Update game_rooms détecté");
            loadRoom(user.id);
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_rounds" },
          () => {
            console.log("🔄 Update game_rounds détecté");
            loadRoom(user.id);
          }
        )
        .subscribe((status) => {
          console.log("📡 Subscription status:", status);
        });

      setLoading(false);
    }

    init();

    // Cleanup function
    return () => {
      if (channel) {
        console.log("🧹 Cleanup: removing channel");
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  async function loadRoom(playerUserId?: string) {
    const activeUserId = playerUserId || userId;

    if (!activeUserId) return;

    const { data: roomData } = await supabase
      .from("game_rooms")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setCurrentRoom(roomData);

    if (!roomData) return;

    const { data: participantData } = await supabase
      .from("game_participants")
      .select("*")
      .eq("room_id", roomData.id)
      .eq("player_id", activeUserId)
      .single();

    setHasJoined(!!participantData);

    if (roomData.current_round_id) {
      const { data: roundData } = await supabase
        .from("game_rounds")
        .select("*")
        .eq("id", roomData.current_round_id)
        .single();

      setCurrentRound(roundData);

      if (roundData && roundData.status === "active") {
        const { data: questionData } = await supabase
          .from("game_questions")
          .select("*")
          .eq("id", roundData.question_id)
          .single();

        setQuestion(questionData);

        const { data: answerData } = await supabase
          .from("game_answers")
          .select("*")
          .eq("round_id", roundData.id)
          .eq("player_id", activeUserId)
          .single();

        setHasAnswered(!!answerData);
      }

      if (roundData && roundData.winner_id === activeUserId) {
        setIsWinner(true);
      }
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-zinc-900 to-purple-900">
        <div className="text-white text-2xl animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-zinc-900 to-purple-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6 animate-bounce">⚔️</div>
          <h1 className="text-4xl font-bold text-white mb-4">L'Arène</h1>
          <p className="text-xl text-zinc-300 mb-2">
            Aucune partie en cours pour le moment.
          </p>
          <p className="text-sm text-zinc-400">
            Attends que l'organisateur lance une partie.
          </p>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-zinc-900 to-purple-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">⚔️</div>
          <h1 className="text-5xl font-bold text-white mb-4">L'Arène</h1>
          <p className="text-2xl text-white mb-3">Prêt à jouer, {pseudo} ?</p>
          <p className="text-lg text-zinc-300 mb-8">
            Une partie est ouverte. Rejoins l'arène pour participer aux
            mini-jeux !
          </p>
          <button
            onClick={joinArena}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-2xl font-bold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-2xl"
          >
            🎮 Rejoindre l'arène
          </button>
        </div>
      </div>
    );
  }

  if (currentRoom.status === "lobby") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-zinc-900 to-purple-900 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎮 En attente...
          </h1>
          <p className="text-xl text-zinc-300 mb-2">
            Tu es connecté à l'arène, {pseudo}.
          </p>
          <p className="text-base text-zinc-400 mb-6">
            Le jeu va bientôt commencer !
          </p>
          <div className="text-6xl animate-pulse">⏳</div>
        </div>
      </div>
    );
  }

  if (currentRoom.status === "playing" && question && !hasAnswered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-zinc-900 to-orange-900 p-4">
        <div className="max-w-2xl mx-auto py-10">
          <h1 className="text-3xl font-bold mb-8 text-center text-white">
            {question.question}
          </h1>

          <div className="grid grid-cols-1 gap-4">
            {question.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                className={`p-6 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 ${
                  selectedAnswer === index
                    ? "bg-blue-600 text-white shadow-2xl scale-105"
                    : "bg-zinc-800 text-white hover:bg-zinc-700 shadow-lg"
                }`}
              >
                {answer}
              </button>
            ))}
          </div>

          <p className="text-center text-zinc-300 mt-8 text-lg">
            ⏱️ Réponds le plus vite possible !
          </p>
        </div>
      </div>
    );
  }

  if (currentRoom.status === "playing" && hasAnswered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-zinc-900 to-purple-900 p-4">
        <div className="text-center">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Réponse envoyée !
          </h1>
          <p className="text-xl text-zinc-300">Attends les résultats...</p>
          <div className="mt-8">
            <div className="animate-pulse text-6xl">⏳</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoom.status === "results") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-zinc-900 to-emerald-900 p-4">
        <div className="text-center">
          {isWinner ? (
            <>
              <div className="text-9xl mb-6 animate-bounce">🎉</div>
              <h1 className="text-6xl font-bold text-white mb-4">
                Tu as gagné !
              </h1>
              <p className="text-3xl text-green-300 mb-4">
                Félicitations {pseudo} !
              </p>
              <p className="text-xl text-zinc-300">
                Tu as remporté un cadeau mystère 🎁
              </p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">😔</div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Pas cette fois...
              </h1>
              <p className="text-xl text-zinc-300">
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
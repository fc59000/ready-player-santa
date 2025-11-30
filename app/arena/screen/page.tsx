"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  gift_id: string | null;
  started_at: string | null;
};

type Participant = {
  id: string;
  player_id: string;
  has_won_gift: boolean;
  profiles: {
    pseudo: string;
    avatar_id: string | null;
  };
};

type Question = {
  id: string;
  question: string;
  answers: string[];
  time_limit: number;
  correct_answer_index: number;
};

type Answer = {
  player_id: string;
  answer_index: number;
  answered_at: string;
  profiles: {
    pseudo: string;
  };
};

export default function ArenaScreenPage() {
  const [loading, setLoading] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [winnerPseudo, setWinnerPseudo] = useState<string>("");
  const hasAutoEndedRef = useRef(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    await loadRoom();
    subscribeToUpdates();
    setLoading(false);
  }

  async function loadRoom() {
    // Charger la room active
    const { data: roomData } = await supabase
      .from("game_rooms")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setCurrentRoom(roomData);

    if (!roomData) return;

    // Charger les participants
    const { data: participantsData } = await supabase
      .from("game_participants")
      .select("*, profiles(pseudo, avatar_id)")
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

      if (roundData && roundData.status === "active") {
        // Charger la question
        const { data: questionData } = await supabase
          .from("game_questions")
          .select("*")
          .eq("id", roundData.question_id)
          .single();

        setQuestion(questionData);

        // Calculer le temps restant basé sur started_at
        if (questionData && roundData.started_at) {
          const startTime = new Date(roundData.started_at).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, questionData.time_limit - elapsed);
          
          setTimeLeft(remaining);
          
          // Reset le flag auto-end si nouveau round
          hasAutoEndedRef.current = false;
          
          console.log(`⏱️ Timer: ${remaining}s restantes (${elapsed}s écoulées sur ${questionData.time_limit}s)`);
        }

        // Charger les réponses
        const { data: answersData } = await supabase
          .from("game_answers")
          .select("*, profiles(pseudo)")
          .eq("round_id", roundData.id)
          .order("answered_at", { ascending: true });

        setAnswers(answersData || []);
      }

      // Si résultats, charger le gagnant
      if (roundData && roundData.status === "finished" && roundData.winner_id) {
        const { data: winnerData } = await supabase
          .from("profiles")
          .select("pseudo")
          .eq("id", roundData.winner_id)
          .single();

        setWinnerPseudo(winnerData?.pseudo || "");
      }
    }
  }

  function subscribeToUpdates() {
    const channel = supabase
      .channel("screen_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rooms" },
        () => {
          loadRoom();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_rounds" },
        () => {
          loadRoom();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_participants" },
        () => {
          loadRoom();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_answers" },
        () => {
          loadRoom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Timer pour le compte à rebours
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 🆕 AUTO-END : Quand le timer atteint 0, terminer automatiquement le round
  useEffect(() => {
    async function autoEndRound() {
      // IMPORTANT: timeLeft doit être exactement 0, pas null
      if (timeLeft !== 0) return;
      if (!currentRound || !question || !currentRoom) return;
      if (currentRound.status !== "active") return;
      
      // Éviter de terminer plusieurs fois le même round
      if (hasAutoEndedRef.current) return;
      hasAutoEndedRef.current = true;

      console.log("⏰ Timer terminé ! Auto-end du round...");

      // Récupérer toutes les réponses
      const { data: allAnswers } = await supabase
        .from("game_answers")
        .select("*, profiles(pseudo)")
        .eq("round_id", currentRound.id)
        .order("answered_at", { ascending: true });

      if (!allAnswers || allAnswers.length === 0) {
        console.log("❌ Aucune réponse reçue");
        
        // Marquer le round comme terminé sans gagnant
        await supabase
          .from("game_rounds")
          .update({ status: "finished", ended_at: new Date().toISOString() })
          .eq("id", currentRound.id);

        await supabase
          .from("game_rooms")
          .update({ status: "results" })
          .eq("id", currentRoom.id);

        return;
      }

      // Filtrer les bonnes réponses
      const correctAnswers = allAnswers.filter(
        (a) => a.answer_index === question.correct_answer_index
      );

      if (correctAnswers.length === 0) {
        console.log("❌ Personne n'a trouvé la bonne réponse");
        
        await supabase
          .from("game_rounds")
          .update({ status: "finished", ended_at: new Date().toISOString() })
          .eq("id", currentRound.id);

        await supabase
          .from("game_rooms")
          .update({ status: "results" })
          .eq("id", currentRoom.id);

        return;
      }

      // Le gagnant est le plus rapide parmi les bonnes réponses
      const winner = correctAnswers[0];
      console.log("🏆 Gagnant:", (winner.profiles as any).pseudo);

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
      if (currentRound.gift_id) {
        await supabase
          .from("gifts")
          .update({ winner_player_id: winner.player_id })
          .eq("id", currentRound.gift_id);
      }

      // Marquer le participant comme ayant gagné
      await supabase
        .from("game_participants")
        .update({ has_won_gift: true })
        .eq("room_id", currentRoom.id)
        .eq("player_id", winner.player_id);

      // Mettre la room en mode résultats
      await supabase
        .from("game_rooms")
        .update({ status: "results" })
        .eq("id", currentRoom.id);

      console.log("✅ Round terminé automatiquement !");
    }

    autoEndRound();
  }, [timeLeft, currentRound, question, currentRoom]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white text-3xl">
        Chargement...
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">🎄 Ready Player Santa</h1>
          <p className="text-3xl text-zinc-400">En attente de la partie...</p>
        </div>
      </div>
    );
  }

  // Lobby — En attente des joueurs
  if (currentRoom.status === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-zinc-900 to-purple-900 text-white p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-7xl font-bold text-center mb-16 animate-pulse">
            🎮 L'ARÈNE
          </h1>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold mb-4">
              Joueurs connectés ({participants.length})
            </h2>
            <p className="text-2xl text-zinc-400">
              En attente du lancement...
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`p-6 rounded-xl text-center transition ${
                  p.has_won_gift
                    ? "bg-green-800 border-4 border-green-400"
                    : "bg-zinc-800 border-2 border-zinc-600"
                }`}
              >
                <div className="text-5xl mb-3">
                  {p.has_won_gift ? "🏆" : "🎮"}
                </div>
                <p className="text-2xl font-bold">
                  {(p.profiles as any)?.pseudo}
                </p>
                {p.has_won_gift && (
                  <p className="text-sm text-green-400 mt-2">A gagné !</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mini-jeu en cours
  if (currentRoom.status === "playing" && question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-zinc-900 to-orange-900 text-white p-10">
        <div className="max-w-7xl mx-auto">
          {/* Timer */}
          <div className="text-center mb-8">
            <div className="text-8xl font-bold animate-pulse">
              {timeLeft !== null && timeLeft > 0 ? timeLeft : "⏰"}
            </div>
          </div>

          {/* Question */}
          <div className="bg-zinc-800 rounded-3xl p-12 mb-8 shadow-2xl">
            <h2 className="text-5xl font-bold text-center mb-8">
              {question.question}
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {question.answers.map((answer, index) => (
                <div
                  key={index}
                  className="bg-zinc-700 p-8 rounded-xl text-center"
                >
                  <p className="text-3xl font-semibold">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Compteur de réponses */}
          <div className="text-center">
            <p className="text-3xl text-zinc-400">
              {answers.length} réponse{answers.length > 1 ? "s" : ""} reçue
              {answers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Résultats
  if (currentRoom.status === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-zinc-900 to-emerald-900 text-white p-10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-8xl font-bold mb-12 animate-bounce">
            🎉 RÉSULTATS
          </h1>

          {winnerPseudo ? (
            <>
              <div className="text-9xl mb-8">🏆</div>
              <h2 className="text-7xl font-bold mb-4">Félicitations !</h2>
              <p className="text-6xl text-green-400 font-bold">
                {winnerPseudo}
              </p>
              <p className="text-3xl text-zinc-400 mt-8">
                a remporté le cadeau ! 🎁
              </p>
            </>
          ) : (
            <>
              <div className="text-9xl mb-8">❌</div>
              <h2 className="text-5xl font-bold mb-4">
                Personne n'a trouvé la bonne réponse
              </h2>
              <p className="text-3xl text-zinc-400 mt-8">
                On passe au prochain cadeau !
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
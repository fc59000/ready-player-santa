/** READY PLAYER SANTA™ – ARENA BIG SCREEN **/
"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Particles from "@/components/Particles";

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
    let cleanup: (() => void) | undefined;

    async function init() {
      await loadRoom();
      cleanup = subscribeToUpdates();
      setLoading(false);
    }

    init();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  async function loadRoom() {
    const { data: roomData } = await supabase
      .from("game_rooms")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setCurrentRoom(roomData);

    if (!roomData) return;

    const { data: participantsData } = await supabase
      .from("game_participants")
      .select("*, profiles(pseudo, avatar_id)")
      .eq("room_id", roomData.id);

    setParticipants(participantsData || []);

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

        if (questionData && roundData.started_at) {
          const startTime = new Date(roundData.started_at).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, questionData.time_limit - elapsed);

          setTimeLeft(remaining);
          hasAutoEndedRef.current = false;
        }

        const { data: answersData } = await supabase
          .from("game_answers")
          .select("*, profiles(pseudo)")
          .eq("round_id", roundData.id)
          .order("answered_at", { ascending: true });

        setAnswers(answersData || []);
      }

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

  // Timer
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

  // Auto-end round
  useEffect(() => {
    async function autoEndRound() {
      if (timeLeft !== 0) return;
      if (!currentRound || !question || !currentRoom) return;
      if (currentRound.status !== "active") return;
      if (hasAutoEndedRef.current) return;

      hasAutoEndedRef.current = true;

      const { data: allAnswers } = await supabase
        .from("game_answers")
        .select("*, profiles(pseudo)")
        .eq("round_id", currentRound.id)
        .order("answered_at", { ascending: true });

      if (!allAnswers || allAnswers.length === 0) {
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

      const correctAnswers = allAnswers.filter(
        (a) => a.answer_index === question.correct_answer_index
      );

      if (correctAnswers.length === 0) {
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

      const winner = correctAnswers[0];

      await supabase
        .from("game_rounds")
        .update({
          status: "finished",
          winner_id: winner.player_id,
          ended_at: new Date().toISOString(),
        })
        .eq("id", currentRound.id);

      if (currentRound.gift_id) {
        await supabase
          .from("gifts")
          .update({ winner_player_id: winner.player_id })
          .eq("id", currentRound.gift_id);
      }

      await supabase
        .from("game_participants")
        .update({ has_won_gift: true })
        .eq("room_id", currentRoom.id)
        .eq("player_id", winner.player_id);

      await supabase
        .from("game_rooms")
        .update({ status: "results" })
        .eq("id", currentRoom.id);
    }

    autoEndRound();
  }, [timeLeft, currentRound, question, currentRoom]);

  const screenWrapperStyle = {
    minHeight: "100vh",
    padding: "40px var(--spacing-lg)",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    position: "relative" as const,
    zIndex: 1,
  };

  const innerShellStyle = {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const headerBarStyle = {
    marginBottom: "var(--spacing-xl)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--spacing-lg)",
  };

  const smallHudLabel = {
    fontFamily: "var(--mono)",
    fontSize: ".78rem",
    letterSpacing: ".18em",
    color: "var(--muted)",
    textTransform: "uppercase" as const,
  };

  // Rendus

  if (loading) {
    return (
      <>
        <Particles />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[var(--bg-dark)] to-[var(--bg-deep)]">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">⚔️</div>
            <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
              INITIALISATION DE L&apos;ARÈNE
            </div>
            <div style={smallHudLabel}>Connexion au jeu en cours...</div>
            <div className="mt-8 flex justify-center">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-[var(--primary)] rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!currentRoom) {
    return (
      <>
        <Particles />
        <div style={screenWrapperStyle}>
          <div style={innerShellStyle}>
            <div
              className="cyberpunk-panel fade-in-up"
              style={{ animationDelay: ".2s", textAlign: "center", padding: "var(--spacing-xl)" }}
            >
              <div className="hud-title" style={{ marginBottom: "var(--spacing-md)" }}>
                READY PLAYER SANTA™ // L&apos;ARÈNE
              </div>
              <div style={smallHudLabel}>En attente du lancement de la partie</div>

              <div style={{ marginTop: "var(--spacing-xl)" }}>
                <div style={{ fontSize: "4rem", marginBottom: "var(--spacing-md)" }}>🎄</div>
                <p
                  style={{
                    fontSize: "1.6rem",
                    color: "var(--text)",
                    marginBottom: "var(--spacing-sm)",
                  }}
                >
                  Aucun jeu n&apos;est en cours pour le moment.
                </p>
                <p style={{ fontSize: "1rem", color: "var(--muted)" }}>
                  Laisse cet écran affiché : il se mettra à jour automatiquement dès que la partie
                  commencera. ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Lobby
  if (currentRoom.status === "lobby") {
    return (
      <>
        <Particles />
        <div style={screenWrapperStyle}>
          <div style={innerShellStyle}>
            <div className="fade-in-up" style={{ ...headerBarStyle, animationDelay: ".1s" }}>
              <div>
                <div className="hud-title" style={{ marginBottom: "6px" }}>
                  L&apos;ARÈNE // SALLE D&apos;ATTENTE
                </div>
                <div style={smallHudLabel}>Les joueurs se connectent...</div>
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".9rem",
                  color: "var(--primary)",
                  textAlign: "right" as const,
                }}
              >
                Joueurs connectés :{" "}
                <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>{participants.length}</span>
              </div>
            </div>

            <div
              className="cyberpunk-panel fade-in-up"
              style={{ animationDelay: ".2s", padding: "var(--spacing-xl)" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "var(--spacing-lg)",
                }}
              >
                {participants.map((p, index) => (
                  <div
                    key={p.id}
                    className="fade-in-up"
                    style={{
                      animationDelay: `${0.25 + index * 0.03}s`,
                      padding: "var(--spacing-md)",
                      borderRadius: "18px",
                      background: p.has_won_gift
                        ? "linear-gradient(135deg, rgba(34,197,94,.18), rgba(21,128,61,.85))"
                        : "rgba(15,23,42,.9)",
                      border: p.has_won_gift
                        ? "2px solid rgba(74,222,128,.9)"
                        : "1px solid rgba(148,163,184,.4)",
                      boxShadow: p.has_won_gift
                        ? "0 0 30px rgba(74,222,128,.45)"
                        : "0 0 18px rgba(15,23,42,.8)",
                      textAlign: "center" as const,
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                      {p.has_won_gift ? "🏆" : "🎮"}
                    </div>
                    <div
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: "4px",
                      }}
                    >
                      {(p.profiles as any)?.pseudo}
                    </div>
                    {p.has_won_gift && (
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: ".75rem",
                          color: "#bbf7d0",
                          letterSpacing: ".12em",
                          textTransform: "uppercase",
                        }}
                      >
                        A déjà gagné un cadeau
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Playing
  if (currentRoom.status === "playing" && question) {
    const totalAnswers = answers.length;

    return (
      <>
        <Particles />
        <div style={screenWrapperStyle}>
          <div style={innerShellStyle}>
            <div className="fade-in-up" style={{ ...headerBarStyle, animationDelay: ".1s" }}>
              <div>
                <div className="hud-title" style={{ marginBottom: "6px" }}>
                  L&apos;ARÈNE // QUESTION EN COURS
                </div>
                <div style={smallHudLabel}>Les joueurs répondent en temps réel</div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "999px",
                    border: "3px solid rgba(125,211,252,.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 35px rgba(56,189,248,.5)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                  }}
                >
                  {timeLeft !== null && timeLeft > 0 ? timeLeft : "0"}
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <div style={smallHudLabel}>Temps restant</div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: ".9rem",
                      color: "var(--muted)",
                    }}
                  >
                    Répondre le plus vite possible !
                  </div>
                </div>
              </div>
            </div>

            <div
              className="cyberpunk-panel fade-in-up"
              style={{ animationDelay: ".2s", padding: "var(--spacing-xl)" }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  textAlign: "center" as const,
                  marginBottom: "var(--spacing-xl)",
                  textShadow: "0 0 22px rgba(148,163,184,.4)",
                }}
              >
                {question.question}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "var(--spacing-lg)",
                }}
              >
                {question.answers.map((answer, index) => (
                  <div
                    key={index}
                    className="fade-in-up"
                    style={{
                      animationDelay: `${0.3 + index * 0.05}s`,
                      padding: "var(--spacing-lg)",
                      borderRadius: "18px",
                      background: "rgba(15,23,42,.95)",
                      border: "1px solid rgba(148,163,184,.5)",
                      boxShadow: "0 0 26px rgba(15,23,42,.9)",
                      textAlign: "center" as const,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: "6px",
                      }}
                    >
                      {answer}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "var(--spacing-xl)",
                  textAlign: "center" as const,
                  fontFamily: "var(--mono)",
                  fontSize: ".95rem",
                  color: "var(--muted)",
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}
              >
                Réponses reçues :{" "}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {totalAnswers}
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Results
  if (currentRoom.status === "results") {
    return (
      <>
        <Particles />
        <div style={screenWrapperStyle}>
          <div style={innerShellStyle}>
            <div className="fade-in-up" style={{ ...headerBarStyle, animationDelay: ".1s" }}>
              <div>
                <div className="hud-title" style={{ marginBottom: "6px" }}>
                  L&apos;ARÈNE // RÉSULTATS
                </div>
                <div style={smallHudLabel}>Détermination du vainqueur</div>
              </div>
            </div>

            <div
              className="cyberpunk-panel fade-in-up"
              style={{
                animationDelay: ".2s",
                padding: "var(--spacing-xxl)",
                textAlign: "center",
              }}
            >
              {winnerPseudo ? (
                <>
                  <div style={{ fontSize: "5rem", marginBottom: "var(--spacing-md)" }}>🏆</div>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "var(--spacing-sm)",
                      textShadow: "0 0 26px rgba(74,222,128,.6)",
                    }}
                  >
                    Félicitations !
                  </div>
                  <div
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 700,
                      color: "var(--success)",
                      marginBottom: "var(--spacing-md)",
                    }}
                  >
                    {winnerPseudo}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: ".95rem",
                      color: "var(--muted)",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                    }}
                  >
                    remporte le cadeau 🎁
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "5rem", marginBottom: "var(--spacing-md)" }}>❌</div>
                  <div
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    Personne n&apos;a trouvé la bonne réponse...
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: ".95rem",
                      color: "var(--muted)",
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                    }}
                  >
                    On passe au prochain cadeau !
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}

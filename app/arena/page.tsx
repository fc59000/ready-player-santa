/** READY PLAYER SANTA™ – ARENA PLAYER **/
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
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

      channel = supabase
        .channel("arena_updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_rooms" },
          () => {
            loadRoom(user.id);
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_rounds" },
          () => {
            loadRoom(user.id);
          }
        )
        .subscribe();

      setLoading(false);
    }

    init();

    return () => {
      if (channel) {
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

  // ========== RENDUS ==========

  if (loading) {
    return (
      <>
        <Particles />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[var(--bg-dark)] to-[var(--bg-deep)]">
          <div className="text-center">
            <div className="text-5xl mb-6 animate-pulse">⚔️</div>
            <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
              CONNEXION À L&apos;ARÈNE
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".85rem",
                color: "var(--muted)",
                letterSpacing: ".15em",
                textTransform: "uppercase",
              }}
            >
              Initialisation du module de jeu...
            </div>
          </div>
        </div>
      </>
    );
  }

  const wrapperStyle = {
    minHeight: "100vh",
    padding: "32px var(--spacing-lg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "480px",
  };

  if (!currentRoom) {
    return (
      <>
        <Particles />
        <div style={wrapperStyle}>
          <div className="cyberpunk-panel fade-in-up" style={{ ...cardStyle, animationDelay: ".1s" }}>
            <div className="hud-title" style={{ marginBottom: "var(--spacing-md)", textAlign: "center" }}>
              L&apos;ARÈNE N&apos;EST PAS OUVERTE
            </div>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--muted)",
                textAlign: "center",
              }}
            >
              Aucune partie n&apos;est en cours pour le moment.
              <br />
              Attends que l&apos;organisateur lance une session.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!hasJoined) {
    return (
      <>
        <Particles />
        <div style={wrapperStyle}>
          <div className="cyberpunk-panel fade-in-up" style={{ ...cardStyle, animationDelay: ".1s" }}>
            <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "var(--spacing-sm)" }}>⚔️</div>
              <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
                L&apos;ARÈNE
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".8rem",
                  color: "var(--muted)",
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                }}
              >
                Prêt à jouer, {pseudo} ?
              </div>
            </div>

            <p
              style={{
                fontSize: ".95rem",
                color: "var(--muted)",
                textAlign: "center",
                marginBottom: "var(--spacing-lg)",
              }}
            >
              Une partie est ouverte. Rejoins l&apos;arène pour participer aux mini-jeux et tenter de
              gagner des cadeaux.
            </p>

            <button
              onClick={joinArena}
              className="cyberpunk-btn"
              style={{
                width: "100%",
                fontSize: "1rem",
                padding: "var(--spacing-md)",
              }}
            >
              🎮 Rejoindre l&apos;arène
            </button>
          </div>
        </div>
      </>
    );
  }

  if (currentRoom.status === "lobby") {
    return (
      <>
        <Particles />
        <div style={wrapperStyle}>
          <div className="cyberpunk-panel fade-in-up" style={{ ...cardStyle, animationDelay: ".1s" }}>
            <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--spacing-sm)" }}>⏳</div>
              <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
                EN ATTENTE DU DÉPART
              </div>
              <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>
                Tu es connecté à l&apos;arène, {pseudo}. Le jeu va bientôt commencer...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentRoom.status === "playing" && question && !hasAnswered) {
    return (
      <>
        <Particles />
        <div style={wrapperStyle}>
          <div className="cyberpunk-panel fade-in-up" style={{ ...cardStyle, animationDelay: ".1s" }}>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--text)",
                textAlign: "center",
                marginBottom: "var(--spacing-lg)",
              }}
            >
              {question.question}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              {question.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => submitAnswer(index)}
                  className="cyberpunk-btn"
                  style={{
                    padding: "var(--spacing-md)",
                    fontSize: ".95rem",
                    transform:
                      selectedAnswer === index ? "scale(1.02)" : "scale(1)",
                    boxShadow:
                      selectedAnswer === index
                        ? "0 0 30px rgba(125,211,252,.5)"
                        : "none",
                  }}
                >
                  {answer}
                </button>
              ))}
            </div>

            <p
              style={{
                marginTop: "var(--spacing-lg)",
                textAlign: "center",
                fontFamily: "var(--mono)",
                fontSize: ".85rem",
                color: "var(--muted)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
              }}
            >
              ⏱️ Réponds le plus vite possible !
            </p>
          </div>
        </div>
      </>
    );
  }

  if (currentRoom.status === "playing" && hasAnswered) {
    return (
      <>
        <Particles />
        <div style={wrapperStyle}>
          <div className="cyberpunk-panel fade-in-up" style={{ ...cardStyle, animationDelay: ".1s" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "var(--spacing-sm)" }}>✅</div>
              <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
                RÉPONSE ENVOYÉE
              </div>
              <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>
                Patiente quelques instants, les résultats vont apparaître sur l&apos;écran principal.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentRoom.status === "results") {
    return (
      <>
        <Particles />
        <div style={wrapperStyle}>
          <div className="cyberpunk-panel fade-in-up" style={{ ...cardStyle, animationDelay: ".1s" }}>
            <div style={{ textAlign: "center" }}>
              {isWinner ? (
                <>
                  <div style={{ fontSize: "3.5rem", marginBottom: "var(--spacing-sm)" }}>🎉</div>
                  <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
                    TU AS GAGNÉ !
                  </div>
                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "var(--success)",
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    Félicitations {pseudo} 🎁
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>
                    Tu as remporté un cadeau mystère. Garde cet écran visible pour la remise !
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "3.5rem", marginBottom: "var(--spacing-sm)" }}>😔</div>
                  <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
                    PAS CETTE FOIS...
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>
                    Continue à jouer aux prochaines manches pour tenter ta chance !
                  </p>
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

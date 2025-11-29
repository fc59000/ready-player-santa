"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import CountdownTimer from "@/components/CountdownTimer";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [shellVisible, setShellVisible] = useState(false);
  const [titleText, setTitleText] = useState("");

  // Loading screen
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        const increment = Math.floor(Math.random() * 12) + 4;
        const newValue = Math.min(prev + increment, 100);
        return newValue;
      });
    }, 160);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loadProgress >= 100) {
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          setShellVisible(true);
          setTimeout(() => {
            typeTitle();
          }, 400);
        }, 650);
      }, 400);
    }
  }, [loadProgress]);

  // Typing effect
  function typeTitle() {
    const titleEl = document.getElementById("main-title");
    if (!titleEl) return;
    
    const originalText = "READY PLAYER SANTA™";
    titleEl.textContent = "";
    titleEl.style.opacity = "1";
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < originalText.length) {
        titleEl.textContent += originalText.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  }

  return (
    <>
      <Particles />

      {/* Loading Screen */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at top, var(--bg-dark) 0%, var(--bg-deep) 70%)",
            opacity: loadProgress >= 100 ? 0 : 1,
            transition: "opacity 0.6s ease-out",
            animation: "softGlitch 4s infinite ease-in-out alternate",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "460px",
              padding: "var(--spacing-xl) var(--spacing-lg)",
              borderRadius: "20px",
              border: "1px solid rgba(148, 163, 184, 0.5)",
              background:
                "radial-gradient(circle at top, var(--primary-glow), transparent 65%), radial-gradient(circle at bottom, var(--panel-overlay), rgba(2, 6, 23, 0.98))",
              boxShadow:
                "0 0 40px rgba(15, 23, 42, 0.95), 0 0 60px rgba(56, 189, 248, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="hud-title" style={{ marginBottom: "var(--spacing-md)" }}>
              INITIALISATION EN COURS
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.8rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--primary)",
                marginBottom: "var(--spacing-lg)",
                textShadow: "0 0 20px var(--primary-glow)",
              }}
            >
              READY PLAYER SANTA™ // PROTOCOLE DRCI
            </div>
            <div style={{ fontSize: "1rem", lineHeight: "1.5", marginBottom: "var(--spacing-lg)" }}>
              Chargement du <span style={{ color: "var(--primary)", fontWeight: 600 }}>noyau SantaOS</span>…
              <br />
              Activation du module d'accueil.
            </div>

            <div style={{ marginTop: "var(--spacing-md)", textAlign: "left", fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--muted-dark)", maxWidth: "320px", margin: "var(--spacing-md) auto 0" }}>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.3s forwards" }}>
                › Initialisation protocole...
              </div>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.6s forwards" }}>
                › Connexion serveur SANTA...
              </div>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.9s forwards" }}>
                › Chargement interface HUD...
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "8px",
                background: "rgba(15, 23, 42, 0.9)",
                borderRadius: "999px",
                overflow: "hidden",
                marginTop: "var(--spacing-lg)",
                marginBottom: "var(--spacing-sm)",
                boxShadow: "0 0 0 1px rgba(148, 163, 184, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  width: `${loadProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--primary), #38bdf8, var(--success))",
                  borderRadius: "inherit",
                  boxShadow: "0 0 20px rgba(56, 189, 248, 0.9)",
                  transition: "width 0.15s linear",
                }}
              />
            </div>

            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.82rem",
                color: "var(--muted)",
                letterSpacing: "0.1em",
              }}
            >
              {loadProgress}%
            </div>

            <div
              style={{
                marginTop: "var(--spacing-md)",
                fontSize: "0.8rem",
                color: "var(--muted-dark)",
                fontStyle: "italic",
                lineHeight: "1.4",
              }}
            >
              Conseil : gardez votre cadeau en tête. Santa analyse déjà vos envies.
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          maxWidth: "860px",
          margin: "60px auto",
          padding: "0 var(--spacing-lg)",
          opacity: shellVisible ? 1 : 0,
          transform: shellVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Panel Principal */}
        <div className="cyberpunk-panel" style={{ marginBottom: "var(--spacing-lg)" }}>
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div className="hud-title fade-in-up" style={{ animationDelay: "0.4s", marginBottom: "var(--spacing-sm)" }}>
              PROTOCOLE SANTA // DRCI
            </div>

            <h1
              id="main-title"
              className="main-title fade-in-up"
              style={{
                animationDelay: "0.5s",
                marginBottom: "var(--spacing-xs)",
                opacity: 0,
              }}
            >
              READY PLAYER SANTA™
            </h1>

            <div className="sub fade-in-up" style={{ animationDelay: "0.6s", color: "var(--muted)", marginBottom: "var(--spacing-xl)", fontSize: "0.92rem", letterSpacing: "0.05em" }}>
              SYSTÈME INITIALISÉ – ACCÈS AUTORISÉ
            </div>

            <div className="fade-in-up" style={{ animationDelay: "0.8s", fontSize: "0.98rem", lineHeight: "1.7", whiteSpace: "pre-wrap", marginBottom: "44px", color: "var(--text)" }}>
              {`Bienvenue dans le protocole S.A.N.T.A.

Les festivités approchent.
Les systèmes s'éveillent.
Deux modules sont actuellement disponibles.

Je vous accompagne.
– Santa`}
            </div>

            {/* Boutons Mission */}
            <div className="fade-in-up" style={{ animationDelay: "1s", display: "flex", flexDirection: "column", gap: "16px", marginTop: "var(--spacing-sm)", overflow: "visible" }}>
              <button
                onClick={() => router.push("/mission1")}
                className="cyberpunk-btn"
                style={{ width: "100%" }}
              >
                MISSION 1 – ACTIVATION
              </button>
              <button
                onClick={() => router.push("/briefing")}
                className="cyberpunk-btn"
                style={{ width: "100%", position: "relative" }}
              >
                BRIEFING – COMPRENDRE LE JEU
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: "0.6rem",
                    padding: "3px 7px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    animation: "badgePulse 2s ease-in-out infinite",
                    boxShadow: "0 0 16px rgba(249, 115, 115, 0.7)",
                    zIndex: 10,
                  }}
                >
                  NEW
                </span>
              </button>
            </div>

            <div className="footer fade-in-up" style={{ animationDelay: "1.2s", marginTop: "28px", fontFamily: "var(--mono)", fontSize: "0.75rem", letterSpacing: "0.22em", color: "var(--muted-dark)" }}>
              <span style={{ color: "var(--primary)", display: "block", marginBottom: "6px" }}>
                READY PLAYER SANTA™
              </span>
              NO THEME · ONLY PLAY
            </div>
          </div>
        </div>

        {/* Auth Panel */}
        <div className="fade-in-up" style={{ animationDelay: "0.4s", marginBottom: "var(--spacing-lg)" }}>
          <div
            style={{
              padding: "var(--spacing-xl) var(--spacing-lg)",
              borderRadius: "18px",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              background:
                "radial-gradient(circle at center, rgba(125, 211, 252, 0.05), transparent 70%), rgba(15, 23, 42, 0.7)",
              boxShadow: "0 0 30px rgba(15, 23, 42, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text)",
                  marginBottom: "var(--spacing-lg)",
                  lineHeight: "1.5",
                }}
              >
                PRÊT À PARTICIPER AU READY PLAYER SANTA™ ?
              </div>
              <div style={{ display: "flex", gap: "var(--spacing-md)", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.8rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    color: "var(--primary)",
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(125, 211, 252, 0.3)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>▸</span>
                  SE CONNECTER
                </button>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.8rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    color: "var(--muted)",
                    background: "transparent",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>+</span>
                  CRÉER UN COMPTE
                </button>
              </div>
              <div
                style={{
                  marginTop: "var(--spacing-md)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  color: "var(--muted-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "var(--accent)", fontSize: "0.9rem" }}>⏸</span>
                AUTHENTIFICATION DÉSACTIVÉE – PROCHAINEMENT
              </div>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CountdownTimer />
        </div>
      </div>
    </>
  );
}
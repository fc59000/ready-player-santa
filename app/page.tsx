/** READY PLAYER SANTA™ – PAGE ACCUEIL ULTIMATE AAA **/
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

  // Typing title
  function typeTitle() {
    const el = document.getElementById("main-title");
    if (!el) return;
    const text = "READY PLAYER SANTA™";
    el.textContent = "";
    let i = 0;

    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 55);
  }

  /** Simulated Loading **/
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress((prev) => Math.min(prev + Math.floor(Math.random() * 10) + 6, 100));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loadProgress >= 100) {
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          setShellVisible(true);
          setTimeout(typeTitle, 350);
        }, 600);
      }, 350);
    }
  }, [loadProgress]);

  return (
    <>
      <Particles />

      {/* ====================== LOADING SCREEN ====================== */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at top, var(--bg-dark) 0%, var(--bg-deep) 70%)",
            opacity: loadProgress >= 100 ? 0 : 1,
            transition: "opacity .6s ease-out",
            animation: "softGlitch 4s infinite ease-in-out alternate",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "480px",
              padding: "var(--spacing-xl) var(--spacing-lg)",
              borderRadius: "24px",
              border: "1px solid rgba(148,163,184,.5)",
              background:
                "radial-gradient(circle at 20% 0%, var(--primary-glow) 0%, transparent 70%), rgba(2,6,23,0.92)",
              boxShadow:
                "0 0 50px rgba(15,23,42,0.9), 0 0 70px rgba(56,189,248,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
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
                fontSize: ".82rem",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--primary)",
                marginBottom: "var(--spacing-lg)",
                textShadow: "0 0 18px var(--primary-glow)",
              }}
            >
              READY PLAYER SANTA™ // PROTOCOLE DRCI
            </div>

            <div style={{ fontSize: "1rem", lineHeight: "1.5", marginBottom: "var(--spacing-lg)" }}>
              Chargement du <span style={{ color: "var(--primary)", fontWeight: 600 }}>noyau SantaOS</span>…  
              <br />
              Activation du module d'accueil.
            </div>

            <div
              style={{
                marginTop: "var(--spacing-md)",
                textAlign: "left",
                fontFamily: "var(--mono)",
                fontSize: ".72rem",
                color: "var(--muted-dark)",
                maxWidth: "320px",
                margin: "var(--spacing-md) auto 0",
              }}
            >
              <div style={{ marginBottom: 6, opacity: 0, animation: "bootLine .4s ease-out .3s forwards" }}>
                › Initialisation protocole…
              </div>
              <div style={{ marginBottom: 6, opacity: 0, animation: "bootLine .4s ease-out .6s forwards" }}>
                › Connexion serveur SANTA…
              </div>
              <div style={{ marginBottom: 6, opacity: 0, animation: "bootLine .4s ease-out .9s forwards" }}>
                › Chargement interface HUD…
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "8px",
                background: "rgba(15,23,42,0.9)",
                borderRadius: "999px",
                overflow: "hidden",
                margin: "var(--spacing-lg) auto var(--spacing-sm)",
                boxShadow: "0 0 0 1px rgba(148,163,184,.4), inset 0 2px 4px rgba(0,0,0,.5)",
              }}
            >
              <div
                style={{
                  width: `${loadProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--primary), #38bdf8, var(--success))",
                  borderRadius: "inherit",
                  boxShadow: "0 0 20px rgba(56,189,248,0.9)",
                  transition: "width .15s linear",
                }}
              />
            </div>

            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".82rem",
                color: "var(--muted)",
                letterSpacing: ".12em",
              }}
            >
              {loadProgress}%
            </div>

            <div
              style={{
                marginTop: "var(--spacing-md)",
                fontSize: ".8rem",
                color: "var(--muted-dark)",
                fontStyle: "italic",
              }}
            >
              Conseil : gardez votre cadeau en tête. Santa analyse déjà vos envies.
            </div>
          </div>
        </div>
      )}

      {/* ====================== MAIN CONTENT ====================== */}
      <div
        style={{
          maxWidth: "880px",
          margin: "70px auto 90px",
          padding: "0 var(--spacing-lg)",
          opacity: shellVisible ? 1 : 0,
          transform: shellVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity .7s ease-out, transform .7s ease-out",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="cyberpunk-panel" style={{ marginBottom: "var(--spacing-xl)" }}>
          <div style={{ textAlign: "center" }}>
            <div className="hud-title fade-in-up" style={{ animationDelay: ".4s" }}>
              PROTOCOLE SANTA // DRCI
            </div>

            <h1
              id="main-title"
              className="main-title fade-in-up"
              style={{
                animationDelay: ".5s",
                opacity: 0,
                marginBottom: 6,
              }}
            >
              READY PLAYER SANTA™
            </h1>

            <div className="sub fade-in-up" style={{ animationDelay: ".6s", marginBottom: "40px" }}>
              SYSTÈME INITIALISÉ – ACCÈS AUTORISÉ
            </div>

            <div
              className="fade-in-up"
              style={{
                animationDelay: ".8s",
                fontSize: "1rem",
                lineHeight: "1.75",
                whiteSpace: "pre-wrap",
                marginBottom: "48px",
              }}
            >
              {`Bienvenue dans le protocole S.A.N.T.A.

Les festivités approchent.
Les systèmes s'éveillent.
Deux modules sont actuellement disponibles.

Je vous accompagne.
– Santa`}
            </div>

            <div
              className="fade-in-up"
              style={{
                animationDelay: "1s",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <button onClick={() => router.push("/mission1")} className="cyberpunk-btn">
                MISSION 1 – ACTIVATION
              </button>

              <button onClick={() => router.push("/briefing")} className="cyberpunk-btn" style={{ position: "relative" }}>
                BRIEFING – COMPRENDRE LE JEU
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    right: "-12px",
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: ".6rem",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    animation: "badgePulse 2s ease-in-out infinite",
                    boxShadow: "0 0 16px rgba(249, 115, 115, .6)",
                  }}
                >
                  NEW
                </span>
              </button>
            </div>

            <div
              className="footer fade-in-up"
              style={{
                animationDelay: "1.2s",
                marginTop: "34px",
                fontFamily: "var(--mono)",
                letterSpacing: ".22em",
                color: "var(--muted-dark)",
              }}
            >
              <span style={{ color: "var(--primary)", display: "block", marginBottom: 6 }}>
                READY PLAYER SANTA™
              </span>
              NO THEME · ONLY PLAY
            </div>
          </div>
        </div>

        {/* ========== AUTH PANEL (ACTIVÉ) ========== */}
        <div className="fade-in-up" style={{ animationDelay: ".4s", marginBottom: "var(--spacing-xl)" }}>
          <div
            style={{
              padding: "var(--spacing-xl) var(--spacing-lg)",
              borderRadius: "18px",
              border: "1px solid rgba(148,163,184,.4)",
              background:
                "radial-gradient(circle at 50% 0%, rgba(125,211,252,.07), transparent 65%), rgba(15,23,42,.74)",
              boxShadow: "0 0 30px rgba(15,23,42,.8), inset 0 1px 0 rgba(255,255,255,.05)",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: ".85rem", letterSpacing: ".18em", marginBottom: "var(--spacing-lg)" }}>
              PRÊT À PARTICIPER AU READY PLAYER SANTA™ ?
            </div>

            <div style={{ display: "flex", gap: "var(--spacing-md)", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/login")}
                className="cyberpunk-btn"
                style={{
                  padding: "14px 28px",
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
                  fontSize: ".8rem",
                  letterSpacing: ".18em",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  color: "var(--muted)",
                  background: "transparent",
                  border: "1px solid rgba(148,163,184,.3)",
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
                fontSize: ".75rem",
                color: "var(--success)",
                textShadow: "0 0 12px rgba(34,197,94,.4)",
              }}
            >
              🎄 INSCRIPTIONS OUVERTES !
            </div>
          </div>
        </div>

        <div className="fade-in-up" style={{ animationDelay: ".2s" }}>
          <CountdownTimer />
        </div>
      </div>
    </>
  );
}
/** READY PLAYER SANTA™ – PAGE ACCUEIL ULTRA-PREMIUM **/
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
  const [titleClicks, setTitleClicks] = useState(0);
  const [showSnowBurst, setShowSnowBurst] = useState(false);

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

  // Easter egg: Triple click on title
  function handleTitleClick() {
    setTitleClicks((prev) => prev + 1);
    
    if (titleClicks === 2) {
      // 3ème clic = Snow burst!
      setShowSnowBurst(true);
      setTimeout(() => setShowSnowBurst(false), 2000);
      setTitleClicks(0);
    }
    
    // Reset counter après 1 seconde
    setTimeout(() => setTitleClicks(0), 1000);
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

      {/* Snow Burst Easter Egg */}
      {showSnowBurst && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            animation: "snowBurst 2s ease-out forwards",
          }}
        >
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "10px",
                height: "10px",
                background: "white",
                borderRadius: "50%",
                animation: `snowParticle${i % 8} 2s ease-out forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

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
            <div style={{ 
              fontFamily: "var(--mono)", 
              fontSize: "0.75rem", 
              letterSpacing: "0.25em", 
              textTransform: "uppercase", 
              color: "var(--primary)", 
              fontWeight: 700,
              marginBottom: "var(--spacing-md)" 
            }}>
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
            <div style={{ 
              fontFamily: "var(--mono)", 
              fontSize: "0.75rem", 
              letterSpacing: "0.25em", 
              textTransform: "uppercase", 
              color: "var(--primary)", 
              fontWeight: 700,
              opacity: 0,
              animation: "fadeInUp 0.6s ease-out 0.4s forwards"
            }}>
              PROTOCOLE SANTA // DRCI
            </div>

            <h1
              id="main-title"
              onClick={handleTitleClick}
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                background: "linear-gradient(135deg, var(--primary), #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 60px rgba(125,211,252,0.4)",
                animation: "fadeInUp 0.6s ease-out 0.5s backwards, titleGlow 3s ease-in-out infinite",
                marginBottom: 6,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              READY PLAYER SANTA™
            </h1>

            <div style={{
              fontFamily: "var(--mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              color: "var(--muted)",
              textTransform: "uppercase",
              marginBottom: "40px",
              opacity: 0,
              animation: "fadeInUp 0.6s ease-out 0.6s forwards"
            }}>
              SYSTÈME INITIALISÉ – ACCÈS AUTORISÉ
            </div>

            <div
              style={{
                animationDelay: ".8s",
                fontSize: "1rem",
                lineHeight: "1.75",
                whiteSpace: "pre-wrap",
                marginBottom: "48px",
                opacity: 0,
                animation: "fadeInUp 0.6s ease-out 0.8s forwards"
              }}
            >
              {`Bienvenue dans le protocole S.A.N.T.A.

Les festivités approchent.
Les systèmes s'éveillent.
Trois modules sont actuellement disponibles.

Je vous accompagne.
– Santa`}
            </div>

            <div
              style={{
                animationDelay: "1s",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                opacity: 0,
                animation: "fadeInUp 0.6s ease-out 1s forwards"
              }}
            >
              <button 
                onClick={() => router.push("/mission1")} 
                className="cyberpunk-btn"
                style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(125,211,252,.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(125,211,252,.25)";
                }}
              >
                MISSION 1 – ACTIVATION
              </button>

              <button 
                onClick={() => router.push("/briefing")} 
                className="cyberpunk-btn"
                style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(125,211,252,.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(125,211,252,.25)";
                }}
              >
                BRIEFING – COMPRENDRE LE JEU
              </button>

              <button 
                onClick={() => router.push("/rules")} 
                className="cyberpunk-btn" 
                style={{ 
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(125,211,252,.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(125,211,252,.25)";
                }}
              >
                RÈGLES DU JEU
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
                    animation: "badgePulse 2s ease-in-out infinite, breathe 3s ease-in-out infinite",
                    boxShadow: "0 0 16px rgba(249, 115, 115, .6)",
                  }}
                >
                  NEW
                </span>
              </button>
            </div>

            <div
              style={{
                animationDelay: "1.2s",
                marginTop: "34px",
                fontFamily: "var(--mono)",
                letterSpacing: ".22em",
                color: "var(--muted-dark)",
                opacity: 0,
                animation: "fadeInUp 0.6s ease-out 1.2s forwards"
              }}
            >
              <span style={{ color: "var(--primary)", display: "block", marginBottom: 6 }}>
                READY PLAYER SANTA™
              </span>
              NO THEME · ONLY PLAY
            </div>
          </div>
        </div>

        {/* ========== AUTH PANEL (DÉSACTIVÉ) ========== */}
        <div style={{ opacity: 0, animation: "fadeInUp 0.6s ease-out 0.4s forwards", marginBottom: "var(--spacing-xl)" }}>
          <div
            style={{
              padding: "var(--spacing-xl) var(--spacing-lg)",
              borderRadius: "18px",
              border: "1px solid rgba(148,163,184,.2)",
              background: "rgba(15,23,42,.4)",
              boxShadow: "0 0 20px rgba(15,23,42,.6), inset 0 1px 0 rgba(255,255,255,.02)",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: ".85rem", letterSpacing: ".18em", marginBottom: "var(--spacing-lg)", color: "var(--muted)" }}>
              ACCÈS JOUEUR
            </div>

            <div style={{ display: "flex", gap: "var(--spacing-md)", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                disabled
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".8rem",
                  letterSpacing: ".18em",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  color: "var(--muted-dark)",
                  background: "rgba(63,63,70,.3)",
                  border: "2px solid rgba(82,82,91,.3)",
                  cursor: "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  opacity: 0.5,
                }}
              >
                <span>▸</span>
                SE CONNECTER
              </button>
              
              <button
                disabled
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".8rem",
                  letterSpacing: ".18em",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  color: "var(--muted-dark)",
                  background: "transparent",
                  border: "1px solid rgba(82,82,91,.3)",
                  cursor: "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  opacity: 0.5,
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
                color: "var(--primary)",
                textShadow: "0 0 12px rgba(125,211,252,.3)",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              🔒 OUVERTURE DÉBUT DE SEMAINE PROCHAINE
            </div>
          </div>
        </div>

        <div style={{ opacity: 0, animation: "fadeInUp 0.6s ease-out 0.2s forwards" }}>
          <CountdownTimer />
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes snowBurst {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        ${[...Array(8)].map((_, i) => `
          @keyframes snowParticle${i} {
            0% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(
                ${(Math.random() - 0.5) * 800}px,
                ${(Math.random() - 0.5) * 800}px
              ) scale(0);
            }
          }
        `).join('')}
      `}</style>
    </>
  );
}
/** READY PLAYER SANTA™ – BRIEFING AAA HARMONIZED **/
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

export default function BriefingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [shellVisible, setShellVisible] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [showContinue, setShowContinue] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fullStory = `> S.A.N.T.A PROTOCOL v1.1
> Domaine : DRCI_GHICL
> Statut : ACTIVÉ

DRCI,

C'est encore moi… Santa.

Laissez-moi vous révéler un secret.
Le protocole que vous avez reçu
est inspiré d'un film de Steven Spielberg :
Ready Player One.

Dans ce film, chacun entre dans un monde numérique
où l'on choisit un avatar
et où les joueurs accomplissent de petites quêtes
pour avancer et s'amuser.

C'est exactement ce que je vous prépare.
Vous aurez un avatar.
Vous découvrirez quelques mini-défis.
Rien de difficile : quelques clics, quelques choix.
Juste assez de jeu pour vous faire sourire.

Et pourquoi tout cela ?
Pour distribuer les cadeaux autrement.
Pas au hasard.
Pas en piochant un nom.

Cette année, ce seront vos actions qui décideront.
Vous jouerez pour échanger les cadeaux.
Pour tenter d'en décrocher un qui vous plaît vraiment.
Ou pour défendre celui que vous convoitez.

Pas d'inquiétude :
c'est accessible,
léger,
et parfaitement guidé.

Votre seule mission actuelle :
trouver un cadeau qui mérite d'être désiré.

Le reste, je m'en occupe.

— Santa
READY PLAYER SANTA™`;

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
            startTyping();
          }, 400);
        }, 650);
      }, 400);
    }
  }, [loadProgress]);

  // Typing effect
  function startTyping() {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullStory.length) {
        setStoryText(fullStory.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => setShowContinue(true), 500);
      }
    }, 20);
    typingIntervalRef.current = interval;
  }

  // Skip typing
  function skipTyping() {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setStoryText(fullStory);
    setIsTyping(false);
    setShowContinue(true);
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
            pointerEvents: loadProgress >= 100 ? "none" : "auto",
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
                fontSize: "0.8rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--primary)",
                marginBottom: "var(--spacing-lg)",
                textShadow: "0 0 20px var(--primary-glow)",
              }}
            >
              BRIEFING // COMPRENDRE LE JEU
            </div>

            <div style={{ marginTop: "var(--spacing-md)", textAlign: "left", fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--muted-dark)", maxWidth: "320px", margin: "var(--spacing-md) auto 0" }}>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.3s forwards" }}>
                › Initialisation protocole...
              </div>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.6s forwards" }}>
                › Connexion serveur SANTA...
              </div>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.9s forwards" }}>
                › Chargement briefing...
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          maxWidth: "900px",
          margin: "60px auto 80px",
          padding: "0 var(--spacing-lg)",
          opacity: shellVisible ? 1 : 0,
          transform: shellVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="cyberpunk-panel">
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Header */}
            <div style={{ opacity: 0, animation: "fadeInUp 0.6s ease-out 0.2s forwards", marginBottom: "var(--spacing-md)" }}>
              <div style={{ 
                fontFamily: "var(--mono)", 
                fontSize: "0.75rem", 
                letterSpacing: "0.25em", 
                textTransform: "uppercase", 
                color: "var(--primary)", 
                fontWeight: 700,
                marginBottom: "var(--spacing-xs)" 
              }}>
                📡 TRANSMISSION SÉCURISÉE - SANTA
              </div>
              <h1 style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                background: "linear-gradient(135deg, var(--primary), #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 60px rgba(125,211,252,0.4)",
                marginBottom: "var(--spacing-xs)"
              }}>
                READY PLAYER SANTA™
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                Briefing · Comprendre le jeu
              </p>
            </div>

            <div
              style={{
                opacity: 0,
                animation: "fadeInUp 0.6s ease-out 0.4s forwards",
                height: "1px",
                background: "linear-gradient(to right, transparent, var(--primary), transparent)",
                marginBottom: "var(--spacing-lg)",
              }}
            />

            {/* Story */}
            <div
              style={{
                opacity: 0,
                animation: "fadeInUp 0.6s ease-out 0.6s forwards",
                fontFamily: "var(--mono)",
                fontSize: "0.9rem",
                color: "var(--text)",
                whiteSpace: "pre-wrap",
                lineHeight: "1.7",
                marginBottom: "var(--spacing-lg)",
              }}
            >
              {storyText}
              {isTyping && (
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "1rem",
                    background: "var(--primary)",
                    marginLeft: "4px",
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                />
              )}
            </div>

            {/* Skip Button */}
            {isTyping && (
              <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)", animation: "fadeInUp 0.6s ease-out" }}>
                <button
                  onClick={skipTyping}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.15em",
                    padding: "10px 24px",
                    borderRadius: "8px",
                    background: "rgba(148,163,184,.08)",
                    border: "1px solid rgba(148,163,184,.25)",
                    color: "var(--muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(148,163,184,.15)";
                    e.currentTarget.style.borderColor = "var(--muted)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(148,163,184,.08)";
                    e.currentTarget.style.borderColor = "rgba(148,163,184,.25)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  ⏭️ SKIP
                </button>
              </div>
            )}

            {/* Info Box */}
            {showContinue && (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(125, 211, 252, 0.3)",
                  borderRadius: "12px",
                  padding: "var(--spacing-lg)",
                  marginTop: "var(--spacing-lg)",
                  animation: "fadeInUp 0.6s ease-out",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                    fontStyle: "italic",
                  }}
                >
                  Le jeu qui transforme le Secret Santa… pour que chaque cadeau devienne une quête.
                </p>
              </div>
            )}

            {/* Bouton retour */}
            {showContinue && (
              <div style={{ textAlign: "center", marginTop: "var(--spacing-xl)" }}>
                <button
                  onClick={() => router.push("/")}
                  className="cyberpunk-btn"
                  style={{ 
                    animation: "fadeInUp 0.6s ease-out 0.3s backwards",
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
                  ← RETOUR À L'ACCUEIL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
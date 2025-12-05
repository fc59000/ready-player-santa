/** READY PLAYER SANTA™ – RULES AAA HARMONIZED **/
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

export default function RulesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [shellVisible, setShellVisible] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [showContinue, setShowContinue] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fullStory = `🎄✨ MESSAGE OFFICIEL DE SANTA

READY PLAYER SANTA™ — BRIEFING DES JOUEURS

Ho ho ho… Braves aventuriers du Grand Nord lillois, 
l'heure est venue d'embrasser votre destinée. 

Le Secret Santa, vous le connaissiez… 
Mais cette année, vous entrez dans l'Arène du 
Ready Player Santa™, où ruse, créativité et esprit 
festif décideront de votre fortune.

Accrochez vos ceintures de traîneau. 
Voici vos consignes.


🎮 PHASE 1 — LA PRÉPARATION
(Lancement de la plateforme : semaine prochaine)


🧝‍♂️ 1. Choisis ton Avatar

Chaque joueur incarnera une identité unique, 
un personnage exclusif du Multivers de Noël.

⚠️ Premier arrivé, premier servi.

Quand l'atelier ouvre… l'elfe le plus rapide 
rafle le costume le plus légendaire.

Le Battle commence avant même que vous 
n'entriez dans l'Arène. 😈


🎁 2. Dépose ton Cadeau (~10€)

Mais attention… dans Ready Player Santa™, 
on ne dévoile jamais un cadeau.

On le fait deviner.
On le fait désirer.
On laisse la magie faire le travail.

❌ "Mug licorne"
✅ "Le récipient sacré d'une créature mythique 
    aux pouvoirs caféinés…"

Ton cadeau doit intriguer, séduire, 
semer un trouble délicieux.

Fais rêver ton futur destinataire.


📜 3. Parcours le Catalogue des Merveilles 
    & crée ta Liste au Père Noël

Toute l'inspiration du Multivers s'y trouve.

Like les cadeaux qui t'appellent, 
ceux qui t'amusent, 
ceux que tu rêves de défendre en combat.

Chaque like est une clé.
Chaque clé ouvre une porte dans l'Arène.


⚔️ PHASE 2 — L'ARÈNE
Mercredi 11 décembre — 11h30

Le grand moment.
Les cadeaux sont révélés.
Les joueurs entrent en scène.


🪄 Comment ça marche ?

→ Tu participes uniquement aux battles 
  des cadeaux que tu as likés.

→ Chaque cadeau convoque un mini-jeu.

→ Le joueur qui triomphe remporte 
  le précieux artefact.

→ La stratégie devient reine : 
  choisir un cadeau, c'est choisir un combat.


Plus tu likes = plus tu joues.
Plus tu es stratégique = plus tu remportes 
ce que ton cœur désire vraiment.


✨ EN RÉSUMÉ

🎨 La créativité sera récompensée.
🎭 Le mystère sera roi.
🎮 Le jeu décidera du reste.


Prépare-toi, aventurier.
Le Multivers de Noël t'attend.


– Santa, Gardien du Ready Player Santa™`;

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
    }, 15);
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
              RÈGLES DU JEU // BRIEFING OFFICIEL
            </div>

            <div style={{ marginTop: "var(--spacing-md)", textAlign: "left", fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--muted-dark)", maxWidth: "320px", margin: "var(--spacing-md) auto 0" }}>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.3s forwards" }}>
                › Initialisation protocole...
              </div>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.6s forwards" }}>
                › Connexion serveur SANTA...
              </div>
              <div style={{ marginBottom: "6px", opacity: 0, animation: "bootLine 0.4s ease-out 0.9s forwards" }}>
                › Chargement règles...
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
                Règles du jeu · Briefing officiel
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
                    fontFamily: "var(--mono)",
                    fontSize: "0.85rem",
                    color: "var(--primary)",
                    fontWeight: 600,
                    marginBottom: "var(--spacing-sm)",
                  }}
                >
                  🎮 OUVERTURE DE LA PLATEFORME
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--muted)",
                  }}
                >
                  La plateforme ouvrira début de semaine prochaine.
                  <br />
                  Prépare ton cadeau. Affûte ta stratégie.
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
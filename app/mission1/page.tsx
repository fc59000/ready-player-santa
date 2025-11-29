"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

export default function Mission1Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [shellVisible, setShellVisible] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [showMission, setShowMission] = useState(false);

  const fullStory = `> S.A.N.T.A PROTOCOL v1.0
> Domaine : DRCI_GHICL
> Statut : ACTIVÉ

DRCI,

l'heure approche.

Vous avez joué au Secret Santa.
Jusqu'à aujourd'hui.

Cette année, quelque chose de plus vaste s'est mis en marche.
Un protocole que je n'active que rarement.
Un mode… réservé aux équipes prêtes à relever un défi.

Je suis Santa.
Et je vous le confirme : tout ne se déroulera pas comme d'habitude.

Le 11.12.25, un dispositif inédit décidera du destin de vos cadeaux.
Un jeu. Une mécanique. Une série d'épreuves.
Rien d'excessif. Rien de difficile.
Mais suffisamment surprenant pour rendre l'expérience… inoubliable.`;

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

  // Typing effect pour le story
function startTyping() {
  let index = 0;
  const interval = setInterval(() => {
    if (index <= fullStory.length) {
      setStoryText(fullStory.substring(0, index));
      index++;
    } else {
      clearInterval(interval);
      setTimeout(() => setShowMission(true), 500);
    }
  }, 20);
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
              MISSION 1 // PROTOCOLE D'ACTIVATION
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
        <div className="cyberpunk-panel">
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Header */}
            <div className="fade-in-up" style={{ animationDelay: "0.2s", marginBottom: "var(--spacing-md)" }}>
              <div className="hud-title" style={{ marginBottom: "var(--spacing-xs)" }}>
                📡 TRANSMISSION SÉCURISÉE - SANTA
              </div>
              <h1 className="main-title" style={{ marginBottom: "var(--spacing-xs)" }}>
                READY PLAYER SANTA™
              </h1>
              <p className="text-sm text-zinc-400">
                Mission 1 · Protocole d'activation
              </p>
            </div>

            <div
              className="fade-in-up"
              style={{
                animationDelay: "0.4s",
                height: "1px",
                background: "linear-gradient(to right, transparent, var(--primary), transparent)",
                marginBottom: "var(--spacing-lg)",
              }}
            />

            {/* Story */}
            <div
              className="fade-in-up"
              style={{
                animationDelay: "0.6s",
                fontFamily: "var(--mono)",
                fontSize: "0.9rem",
                color: "var(--text)",
                whiteSpace: "pre-wrap",
                lineHeight: "1.7",
                marginBottom: "var(--spacing-lg)",
              }}
            >
              {storyText}
              {storyText.length < fullStory.length && (
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

            {/* Mission panel */}
            {showMission && (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(125, 211, 252, 0.3)",
                  borderRadius: "12px",
                  padding: "var(--spacing-lg)",
                  marginTop: "var(--spacing-lg)",
                  animation: "fadeInUp 0.6s ease-out",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.85rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    fontWeight: "bold",
                    marginBottom: "var(--spacing-md)",
                  }}
                >
                  MISSION 1 – PARAMÈTRES
                </h3>
                <p className="text-sm text-zinc-300" style={{ marginBottom: "var(--spacing-md)" }}>
                  Votre première mission est simple, et pourtant déterminante :
                </p>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-xs)", fontSize: "0.9rem", color: "var(--text)" }}>
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    <span>
                      Trouvez un cadeau d'environ{" "}
                      <span style={{ color: "var(--primary)", fontWeight: 600 }}>10 €</span>
                    </span>
                  </li>
                  <li style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-xs)", fontSize: "0.9rem", color: "var(--text)" }}>
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    <span>Aucun thème imposé</span>
                  </li>
                  <li style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-xs)", fontSize: "0.9rem", color: "var(--text)" }}>
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    <span>
                      Choisissez un objet qui{" "}
                      <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                        mérite d'être désiré
                      </span>
                    </span>
                  </li>
                  <li style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-xs)", fontSize: "0.9rem", color: "var(--text)" }}>
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    <span>
                      Un cadeau pour lequel quelqu'un aurait envie de jouer… et peut-être de se battre un peu
                    </span>
                  </li>
                </ul>

                <p
                  style={{
                    marginTop: "var(--spacing-lg)",
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  Le jeu qui transforme le Secret Santa… pour que chaque cadeau devienne une quête.
                </p>
              </div>
            )}

            {/* Bouton retour */}
            <div className="text-center" style={{ marginTop: "var(--spacing-xl)" }}>
              <button
                onClick={() => router.push("/")}
                className="cyberpunk-btn"
              >
                ← RETOUR À L'ACCUEIL
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
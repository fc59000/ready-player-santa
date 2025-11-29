"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

export default function BriefingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [shellVisible, setShellVisible] = useState(false);

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
        }, 650);
      }, 400);
    }
  }, [loadProgress]);

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
          maxWidth: "900px",
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
            <div className="fade-in-up" style={{ animationDelay: "0.2s", marginBottom: "var(--spacing-lg)", textAlign: "center" }}>
              <div className="hud-title" style={{ marginBottom: "var(--spacing-xs)" }}>
                📋 DOCUMENTATION SYSTÈME
              </div>
              <h1 className="main-title" style={{ marginBottom: "var(--spacing-xs)" }}>
                BRIEFING
              </h1>
              <p className="text-sm text-zinc-400">
                Comprendre le jeu · Mode d'emploi complet
              </p>
            </div>

            <div
              className="fade-in-up"
              style={{
                animationDelay: "0.4s",
                height: "1px",
                background: "linear-gradient(to right, transparent, var(--primary), transparent)",
                marginBottom: "var(--spacing-xl)",
              }}
            />

            {/* Content Sections */}
            <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "var(--text)" }}>
              
              {/* Section 1 */}
              <div className="fade-in-up" style={{ animationDelay: "0.6s", marginBottom: "var(--spacing-xl)" }}>
                <h2
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "1.1rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    marginBottom: "var(--spacing-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>🎯</span>
                  LE CONCEPT
                </h2>
                <p style={{ marginBottom: "var(--spacing-sm)" }}>
                  Ready Player Santa™ transforme le Secret Santa traditionnel en une expérience gamifiée unique. 
                  Chaque participant apporte un cadeau d'environ 10€, mais personne ne sait à l'avance qui recevra quoi.
                </p>
                <p>
                  Le jour J, une série de mini-jeux déterminera qui remportera chaque cadeau. 
                  Plus vous êtes engagé, plus vous avez de chances de repartir avec le cadeau de vos rêves !
                </p>
              </div>

              {/* Section 2 */}
              <div className="fade-in-up" style={{ animationDelay: "0.8s", marginBottom: "var(--spacing-xl)" }}>
                <h2
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "1.1rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    marginBottom: "var(--spacing-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>📝</span>
                  VOS MISSIONS
                </h2>
                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "var(--spacing-md)", borderRadius: "12px", border: "1px solid rgba(125, 211, 252, 0.2)" }}>
                  <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <li style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "bold", fontFamily: "var(--mono)", minWidth: "24px" }}>1.</span>
                      <div>
                        <strong style={{ color: "var(--primary)" }}>Créer votre profil</strong> et choisir votre avatar unique
                      </div>
                    </li>
                    <li style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "bold", fontFamily: "var(--mono)", minWidth: "24px" }}>2.</span>
                      <div>
                        <strong style={{ color: "var(--primary)" }}>Uploader votre cadeau</strong> avec photo et description (10€ environ)
                      </div>
                    </li>
                    <li style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "bold", fontFamily: "var(--mono)", minWidth: "24px" }}>3.</span>
                      <div>
                        <strong style={{ color: "var(--primary)" }}>Explorer la wishlist</strong> et liker les cadeaux qui vous tentent
                      </div>
                    </li>
                    <li style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "bold", fontFamily: "var(--mono)", minWidth: "24px" }}>4.</span>
                      <div>
                        <strong style={{ color: "var(--primary)" }}>Participer aux batailles</strong> le 11 décembre pour gagner vos cadeaux préférés
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Section 3 */}
              <div className="fade-in-up" style={{ animationDelay: "1s", marginBottom: "var(--spacing-xl)" }}>
                <h2
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "1.1rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    marginBottom: "var(--spacing-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>⚔️</span>
                  LE JOUR J (11 DÉCEMBRE)
                </h2>
                <p style={{ marginBottom: "var(--spacing-sm)" }}>
                  À 11h30 précises, l'Arène s'ouvrira. Pour chaque cadeau en jeu, les personnes qui l'ont liké 
                  s'affronteront dans un mini-jeu rapide et amusant.
                </p>
                <p style={{ marginBottom: "var(--spacing-sm)" }}>
                  <strong style={{ color: "var(--primary)" }}>Exemples de mini-jeux :</strong> quiz de culture générale, 
                  memory, réflexes, défis créatifs... Rien de trop difficile, juste assez fun pour pimenter l'expérience !
                </p>
                <p>
                  Le gagnant de chaque battle remporte le cadeau correspondant. Simple, efficace, excitant.
                </p>
              </div>

              {/* Section 4 */}
              <div className="fade-in-up" style={{ animationDelay: "1.2s", marginBottom: "var(--spacing-xl)" }}>
                <h2
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "1.1rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    marginBottom: "var(--spacing-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>💡</span>
                  STRATÉGIES GAGNANTES
                </h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-sm)" }}>
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    <span>
                      <strong style={{ color: "var(--primary)" }}>Likez intelligemment :</strong> plus vous likez de cadeaux, 
                      plus vous participez de batailles, mais attention à ne pas vous disperser !
                    </span>
                  </li>
                  <li style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-sm)" }}>
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    <span>
                      <strong style={{ color: "var(--primary)" }}>Choisissez un cadeau désirable :</strong> un bon cadeau 
                      sera plus liké, donc plus de compétition... mais aussi plus d'honneur à le gagner !
                    </span>
                  </li>
                  <li style={{ display: "flex", gap: "var(--spacing-xs)", marginBottom: "var(--spacing-sm)" }}>
                    <span style={{ color: "var(--accent)" }}>▸</span>
                    <span>
                      <strong style={{ color: "var(--primary)" }}>Préparez-vous mentalement :</strong> le jour J, 
                      restez zen et confiant. Les mini-jeux sont conçus pour être accessibles à tous.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Final Note */}
              <div
                className="fade-in-up"
                style={{
                  animationDelay: "1.4s",
                  background: "rgba(125, 211, 252, 0.08)",
                  border: "1px solid rgba(125, 211, 252, 0.3)",
                  borderRadius: "12px",
                  padding: "var(--spacing-lg)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--text)" }}>
                  "Le but n'est pas seulement de gagner un cadeau...<br />
                  C'est de vivre une expérience collective mémorable."
                </p>
                <p style={{ marginTop: "var(--spacing-sm)", fontSize: "0.85rem", color: "var(--muted)" }}>
                  – Santa, protocole S.A.N.T.A v1.0
                </p>
              </div>
            </div>

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
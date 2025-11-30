"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

export default function BriefingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [shellVisible, setShellVisible] = useState(false);
  const [story, setStory] = useState("");
  const [finished, setFinished] = useState(false);

  // --- Texte complet du briefing ---
  const fullStory = [
    "> S.A.N.T.A PROTOCOL v1.1",
    "> Domaine : DRCI_GHICL",
    "> Statut : ACTIVÉ",
    "",
    "DRCI,",
    "",
    "C'est encore moi… Santa.",
    "",
    "Laissez-moi vous révéler un secret.",
    "Le protocole que vous avez reçu",
    "est inspiré d'un film de Steven Spielberg :",
    "Ready Player One.",
    "",
    "Dans ce film, chacun entre dans un monde numérique",
    "où l'on choisit un avatar",
    "et où les joueurs accomplissent de petites quêtes",
    "pour avancer et s'amuser.",
    "",
    "C'est exactement ce que je vous prépare.",
    "Vous aurez un avatar.",
    "Vous découvrirez quelques mini-défis.",
    "Rien de difficile : quelques clics, quelques choix.",
    "Juste assez de jeu pour vous faire sourire.",
    "",
    "Et pourquoi tout cela ?",
    "Pour distribuer les cadeaux autrement.",
    "Pas au hasard.",
    "Pas en piochant un nom.",
    "",
    "Cette année, ce seront vos actions qui décideront.",
    "Vous jouerez pour échanger les cadeaux.",
    "Pour tenter d'en décrocher un qui vous plaît vraiment.",
    "Ou pour défendre celui que vous convoitez.",
    "",
    "Pas d'inquiétude :",
    "c'est accessible,",
    "léger,",
    "et parfaitement guidé.",
    "",
    "Votre seule mission actuelle :",
    "trouver un cadeau qui mérite d'être désiré.",
    "",
    "Le reste, je m'en occupe.",
    "",
    "— Santa",
    "READY PLAYER SANTA™"
  ].join("\n");

  // --- Loading Screen progression ---
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
          setTimeout(() => startTyping(), 400);
        }, 650);
      }, 400);
    }
  }, [loadProgress]);

  // --- Typewriter ---
  function startTyping() {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullStory.length) {
        setStory(fullStory.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
        setFinished(true);
      }
    }, 20);
  }

  function skipAll() {
    setStory(fullStory);
    setFinished(true);
  }

  return (
    <>
      <Particles />

      {/* █████ LOADING SCREEN █████ */}
      {loading && (
        <div className="loading-screen">
          <div className="loading-inner">
            <div className="loading-title">INITIALISATION EN COURS</div>
            <div className="loading-logo">READY PLAYER SANTA™ // PROTOCOLE DRCI</div>

            <div className="loading-main">
              Chargement du <span>protocole Santa</span>…<br />
              Mise en ligne du Briefing.
            </div>

            <div className="boot-sequence">
              <div className="boot-line">› Déchiffrement données...</div>
              <div className="boot-line">› Vérification sécurité...</div>
              <div className="boot-line">› Module briefing prêt...</div>
            </div>

            <div className="loading-bar">
              <div className="loading-bar-fill" style={{ width: `${loadProgress}%` }} />
            </div>

            <div className="loading-percent">{loadProgress}%</div>

            <div className="loading-hint">Conseil : gardez simplement votre cadeau en tête.</div>
          </div>
        </div>
      )}

      {/* █████ MAIN CONTENT █████ */}
      <main className={`shell ${shellVisible ? "visible" : ""}`}>
        <section className="panel">
          <div className="panel-inner">
            {/* Header */}
            <header className="hud-header">
              <div className="hud-pill">
                <span className="hud-dot" />
                <span>TRANSMISSION SÉCURISÉE – SANTA</span>
              </div>
              <div>DRCI · GHICL · 11.12.25</div>
            </header>

            <div className="title">
              <div className="title-main">READY PLAYER SANTA™</div>
                          </div>

            <div className="separator" />

            {/* STORY TEXT */}
            <div className="story">
              <span>{story}</span>
              {!finished && <span className="cursor" />}
            </div>

            {/* AFTER-STORY */}
            {finished && (
              <>
                <div className="tagline">
                  Le jeu qui transforme le Secret Santa…  
                  pour que chaque cadeau devienne une quête.
                </div>

                <div className="footer">
                  <div className="footer-main">READY PLAYER SANTA™</div>
                  <div className="footer-sub">NO THEME · ONLY PLAY</div>
                </div>
              </>
            )}

            {/* CONTROLS */}
            <div className="controls">
              <button
                className="btn-skip nav-link"
                onClick={() => router.push("/")}
              >
                ⟵ PROTOCOLE S.A.N.T.A
              </button>

              {!finished && (
                <button className="btn-skip" onClick={skipAll}>
                  ⏩ AFFICHER TOUT
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* █████ STYLES (global) █████ */}
      <style jsx global>{`
        /* --- TOUT ton CSS PREMIUM ici --- */
        
        body {
          font-family: var(--sans);
          background: radial-gradient(circle at top, var(--bg-mid) 0%, var(--bg-dark) 55%, var(--bg-deep) 100%);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
        }

        :root {
          --bg-deep: #000000;
          --bg-dark: #020617;
          --bg-mid: #0f172a;
          --panel-overlay: rgba(15,23,42,0.97);
          --primary: #7dd3fc;
          --primary-glow: rgba(125,211,252,0.4);
          --accent: #f97373;
          --success: #22c55e;
          --text: #e5f3ff;
          --muted: #94a3b8;
          --muted-dark: #64748b;
          --mono: "JetBrains Mono", Menlo, monospace;
        }

        /* --- Scanlines --- */
        body::before {
          content:"";
          position:fixed;
          inset:0;
          pointer-events:none;
          background:repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.02) 0,
            rgba(255,255,255,0.02) 1px,
            transparent 2px,
            transparent 4px
          );
          opacity:.7;
        }

        /* --- Neige HUD --- */
        body::after {
          content:"";
          position:fixed;
          top:-150%;
          left:-150%;
          width:400%;
          height:400%;
          pointer-events:none;
          background-image:
            radial-gradient(circle, rgba(148,163,184,0.35) 0, transparent 50%),
            radial-gradient(circle, rgba(148,163,184,0.25) 0, transparent 50%),
            radial-gradient(circle, rgba(148,163,184,0.2) 0, transparent 50%);
          background-size:180px 180px, 280px 280px, 360px 360px;
          opacity:.14;
          animation:snowDrift 24s linear infinite;
        }

        @keyframes snowDrift {
          0% { transform: translate3d(0,-100px,0); }
          100% { transform: translate3d(-50px,100px,0); }
        }

        /* --- Loading screen --- */
        .loading-screen {
          position:fixed;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          background:radial-gradient(circle at top,var(--bg-dark) 0%,var(--bg-deep) 70%);
          z-index:100;
        }

        .loading-inner {
          text-align:center;
          padding:32px 24px;
          max-width:460px;
          border-radius:20px;
          border:1px solid rgba(148,163,184,0.5);
          background:
            radial-gradient(circle at top, var(--primary-glow), transparent 65%),
            radial-gradient(circle at bottom, var(--panel-overlay), rgba(2,6,23,0.98));
        }

        .loading-title {
          font-family:var(--mono);
          font-size:.85rem;
          letter-spacing:.25em;
          color:var(--muted);
          margin-bottom:12px;
        }

        .loading-logo {
          font-family:var(--mono);
          font-size:.8rem;
          letter-spacing:.22em;
          color:var(--primary);
          text-shadow:0 0 20px var(--primary-glow);
          margin-bottom:24px;
        }

        .boot-line {
          opacity:0;
          animation:bootLine 0.4s ease-out forwards;
        }
        .boot-line:nth-child(1){animation-delay:.3s;}
        .boot-line:nth-child(2){animation-delay:.6s;}
        .boot-line:nth-child(3){animation-delay:.9s;}

        @keyframes bootLine {
          from {opacity:0; transform:translateX(-10px);}
          to {opacity:1; transform:translateX(0);}
        }

        .loading-bar {
          width:100%;
          height:8px;
          background:rgba(15,23,42,0.9);
          border-radius:999px;
          overflow:hidden;
          margin:16px 0;
        }

        .loading-bar-fill {
          height:100%;
          background:linear-gradient(90deg,var(--primary),#38bdf8,var(--success));
          box-shadow:0 0 20px rgba(56,189,248,0.9);
          transition:width .15s linear;
        }

        /* --- Shell visible --- */
        .shell {
          opacity:0;
          transform:translateY(20px);
          transition:.7s ease-out;
          max-width:920px;
          margin:72px auto;
          padding:0 24px 72px;
        }
        .shell.visible {
          opacity:1;
          transform:translateY(0);
        }

        /* --- Panel --- */
        .panel {
          border-radius:20px;
          border:1px solid rgba(148,163,184,0.5);
          background:
            radial-gradient(circle at top left, rgba(125,211,252,0.08), transparent 65%),
            linear-gradient(145deg, var(--panel-overlay), rgba(15,23,42,1));
          position:relative;
          overflow:hidden;
        }

        .panel-inner {
          position:relative;
          padding:28px 26px 26px;
        }

        .hud-header {
          display:flex;
          justify-content:space-between;
          font-family:var(--mono);
          font-size:.72rem;
          letter-spacing:.18em;
          color:var(--muted);
          margin-bottom:8px;
        }

        .hud-pill {
          padding:5px 10px;
          border-radius:999px;
          border:1px solid rgba(148,163,184,0.6);
          background:rgba(15,23,42,0.86);
          display:flex;
          align-items:center;
          gap:7px;
        }

        .hud-dot {
          width:7px;
          height:7px;
          border-radius:50%;
          background:radial-gradient(circle,var(--success),#15803d);
          animation:pulse 2.5s infinite ease-in-out;
        }

        @keyframes pulse {
          50% { transform:scale(1.1); }
        }

        .title-main {
          font-family:var(--mono);
          font-size:.92rem;
          text-transform:uppercase;
          letter-spacing:.32em;
          color:var(--primary);
          text-align:center;
          margin-top:12px;
        }

        .story {
          font-family:var(--mono);
          font-size:.92rem;
          line-height:1.75;
          white-space:pre-wrap;
          min-height:320px;
          margin-bottom:24px;
        }

        .cursor {
          display:inline-block;
          width:8px;
          height:16px;
          background:var(--primary);
          animation:cursorBlink 1s steps(2) infinite;
        }

        @keyframes cursorBlink {
          0%,50% { opacity:1; }
          51%,100% { opacity:0; }
        }

        .btn-skip {
          font-family:var(--mono);
          font-size:.76rem;
          padding:7px 15px;
          text-transform:uppercase;
          border-radius:999px;
          border:1px solid rgba(148,163,184,0.6);
          background:transparent;
          color:var(--muted);
          cursor:pointer;
          transition:.2s;
        }

        .btn-skip:hover {
          color:var(--primary);
          border-color:var(--primary);
          box-shadow:0 0 16px rgba(56,189,248,0.55);
        }

        .controls {
          margin-top:24px;
          display:flex;
          justify-content:flex-end;
          gap:12px;
        }

      `}</style>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";

type Mission1ModalProps = {
  onClose: () => void;
};

export default function Mission1Modal({ onClose }: Mission1ModalProps) {
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

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullStory.length) {
        setStoryText((prev) => prev + fullStory[index]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowMission(true), 500);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] border border-zinc-700/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 50px rgba(15, 23, 42, 1), 0 28px 90px rgba(0, 0, 0, 0.95)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-2xl transition-colors"
          style={{ fontFamily: "var(--mono)" }}
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="hud-title mb-2">
            📡 TRANSMISSION SÉCURISÉE - SANTA
          </div>
          <h2 className="main-title" style={{ marginBottom: "8px" }}>
            READY PLAYER SANTA™
          </h2>
          <p className="text-sm text-zinc-400">
            Mission 1 · Protocole d'activation
          </p>
        </div>

        <div
          className="h-px mb-6"
          style={{
            background: "linear-gradient(to right, transparent, var(--primary), transparent)",
          }}
        ></div>

        {/* Story */}
        <div
          className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed mb-6"
          style={{ fontFamily: "var(--mono)" }}
        >
          {storyText}
          <span
            className="inline-block w-2 h-4 ml-1"
            style={{
              background: "var(--primary)",
              animation: "pulse 1s ease-in-out infinite",
            }}
          ></span>
        </div>

        {/* Mission panel */}
        {showMission && (
          <div
            className="bg-zinc-900/50 border border-[#7dd3fc]/30 rounded-xl p-6 mt-6"
            style={{
              animation: "fadeInUp 0.6s ease-out",
            }}
          >
            <h3
              className="text-sm font-bold mb-3 uppercase tracking-wider"
              style={{
                color: "var(--primary)",
                fontFamily: "var(--mono)",
              }}
            >
              Mission 1 – Paramètres
            </h3>
            <p className="text-sm text-zinc-300 mb-4">
              Votre première mission est simple, et pourtant déterminante :
            </p>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-[#f97373]">▸</span>
                <span>
                  Trouvez un cadeau d'environ{" "}
                  <span style={{ color: "var(--primary)", fontWeight: 600 }}>10 €</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f97373]">▸</span>
                <span>Aucun thème imposé</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f97373]">▸</span>
                <span>
                  Choisissez un objet qui{" "}
                  <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                    mérite d'être désiré
                  </span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f97373]">▸</span>
                <span>
                  Un cadeau pour lequel quelqu'un aurait envie de jouer… et peut-être de se battre
                  un peu
                </span>
              </li>
            </ul>

            <p className="text-sm text-zinc-400 italic text-center mt-6">
              Le jeu qui transforme le Secret Santa… pour que chaque cadeau devienne une quête.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
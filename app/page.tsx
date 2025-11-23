"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [showMission1, setShowMission1] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Compte à rebours
  useEffect(() => {
    const targetDate = new Date("2025-12-11T11:30:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-white">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-8 animate-pulse">🎄</div>
          <h1 className="text-5xl font-bold text-[#7dd3fc] mb-4 tracking-wide">
            READY PLAYER SANTA™
          </h1>
          <p className="text-xl text-zinc-400 mb-12">
            Le Secret Santa version jeu vidéo
          </p>

          {/* Compte à rebours */}
          <div className="bg-[#0f172a] border border-zinc-700/50 rounded-2xl p-8 mb-12">
            <p className="text-sm text-zinc-400 mb-4 uppercase tracking-wider">
              Lancement dans :
            </p>
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-zinc-900 border border-[#7dd3fc]/30 rounded-xl p-4">
                <div className="text-4xl font-bold text-[#7dd3fc]">
                  {timeLeft.days}
                </div>
                <div className="text-xs text-zinc-500 mt-1">JOURS</div>
              </div>
              <div className="bg-zinc-900 border border-[#7dd3fc]/30 rounded-xl p-4">
                <div className="text-4xl font-bold text-[#7dd3fc]">
                  {timeLeft.hours}
                </div>
                <div className="text-xs text-zinc-500 mt-1">HEURES</div>
              </div>
              <div className="bg-zinc-900 border border-[#7dd3fc]/30 rounded-xl p-4">
                <div className="text-4xl font-bold text-[#7dd3fc]">
                  {timeLeft.minutes}
                </div>
                <div className="text-xs text-zinc-500 mt-1">MINUTES</div>
              </div>
              <div className="bg-zinc-900 border border-[#7dd3fc]/30 rounded-xl p-4">
                <div className="text-4xl font-bold text-[#7dd3fc]">
                  {timeLeft.seconds}
                </div>
                <div className="text-xs text-zinc-500 mt-1">SECONDES</div>
              </div>
            </div>
          </div>

          {/* Bienvenue */}
          <div className="bg-[#0f172a] border border-zinc-700/50 rounded-2xl p-8 mb-12 text-left">
            <h2 className="text-2xl font-bold text-white mb-4">
              Bienvenue, équipe DRCI 👋
            </h2>
            <p className="text-base text-zinc-300 leading-relaxed mb-4">
              Cette année, le Secret Santa prend une nouvelle dimension. Santa a
              préparé quelque chose de spécial pour vous.
            </p>
            <p className="text-base text-zinc-300 leading-relaxed">
              Consultez les messages ci-dessous pour découvrir ce qui vous attend
              le <span className="text-[#7dd3fc] font-semibold">11 décembre 2025</span>.
            </p>
          </div>

          {/* Missions */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-6">
              📬 Messages de Santa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Mission 1 */}
              <button
                onClick={() => setShowMission1(true)}
                className="bg-[#0f172a] border-2 border-[#7dd3fc]/30 rounded-xl p-6 hover:border-[#7dd3fc] hover:shadow-lg hover:shadow-[#7dd3fc]/20 transition-all"
              >
                <div className="text-3xl mb-2">📜</div>
                <div className="text-lg font-bold text-white">Mission 1</div>
                <div className="text-sm text-zinc-400 mt-1">Disponible</div>
              </button>

              {/* Mission 2 - À venir */}
              <button
                disabled
                className="bg-zinc-900/50 border-2 border-zinc-800 rounded-xl p-6 cursor-not-allowed opacity-50"
              >
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-lg font-bold text-zinc-500">Mission 2</div>
                <div className="text-sm text-zinc-600 mt-1">À venir</div>
              </button>

              {/* Mission 3 - À venir */}
              <button
                disabled
                className="bg-zinc-900/50 border-2 border-zinc-800 rounded-xl p-6 cursor-not-allowed opacity-50"
              >
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-lg font-bold text-zinc-500">Mission 3</div>
                <div className="text-sm text-zinc-600 mt-1">À venir</div>
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#0f172a] border border-zinc-700/50 rounded-2xl p-8">
            <p className="text-base text-zinc-400 mb-6">
              Prêt à participer au Ready Player Santa™ ?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-[#0f172a] border-2 border-[#7dd3fc]/30 text-white rounded-xl font-bold hover:border-[#7dd3fc] hover:shadow-lg hover:shadow-[#7dd3fc]/20 transition-all"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Mission 1 */}
      {showMission1 && (
        <Mission1Modal onClose={() => setShowMission1(false)} />
      )}
    </>
  );
}

// Composant Modal Mission 1
function Mission1Modal({ onClose }: { onClose: () => void }) {
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
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="text-xs text-[#7dd3fc] mb-2 uppercase tracking-wider">
            📡 Transmission sécurisée - Santa
          </div>
          <h2 className="text-3xl font-bold text-[#7dd3fc]">
            READY PLAYER SANTA™
          </h2>
          <p className="text-sm text-zinc-400">
            Mission 1 · Protocole d'activation
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent mb-6"></div>

        {/* Story */}
        <div className="font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed mb-6">
          {storyText}
          <span className="inline-block w-2 h-4 bg-[#7dd3fc] animate-pulse ml-1"></span>
        </div>

        {/* Mission panel */}
        {showMission && (
          <div className="bg-zinc-900/50 border border-[#7dd3fc]/30 rounded-xl p-6 mt-6">
            <h3 className="text-sm text-[#7dd3fc] font-bold mb-3 uppercase tracking-wider">
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
                  <span className="text-[#7dd3fc] font-semibold">10 €</span>
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
                  <span className="text-[#7dd3fc] font-semibold">
                    mérite d'être désiré
                  </span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#f97373]">▸</span>
                <span>
                  Un cadeau pour lequel quelqu'un aurait envie de jouer… et
                  peut-être de se battre un peu
                </span>
              </li>
            </ul>

            <p className="text-sm text-zinc-400 italic text-center mt-6">
              Le jeu qui transforme le Secret Santa… pour que chaque cadeau
              devienne une quête.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
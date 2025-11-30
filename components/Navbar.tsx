"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Charger l'utilisateur
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // Listener auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 🔒 Déconnexion
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Aucun affichage si pas connecté
  if (!user) return null;

  return (
    <>
      <nav className="rps-nav">
        <div className="rps-nav-inner">

          {/* LOGO */}
          <Link href="/dashboard" className="rps-logo">
            <span className="rps-logo-dot" />
            READY PLAYER SANTA™
          </Link>

          {/* LINKS */}
          <div className="rps-links">
            <Link href="/dashboard" className="rps-link">📊 Dashboard</Link>
            <Link href="/avatars" className="rps-link">🧬 Avatars</Link>
            <Link href="/gift" className="rps-link">🎁 Cadeau</Link>
          </div>

          {/* LOGOUT */}
          <button className="rps-logout" onClick={handleLogout}>
            ⏻ Déconnexion
          </button>
        </div>
      </nav>

      {/* === STYLES === */}
      <style jsx>{`
        .rps-nav {
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 80;
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(14px) brightness(1.1);
          border-bottom: 1px solid rgba(125, 211, 252, 0.15);
          box-shadow:
            0 0 30px rgba(56, 189, 248, 0.08),
            inset 0 -1px 0 rgba(148, 163, 184, 0.15);
        }

        /* SCANLINES GLOBALES */
        .rps-nav::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.015) 0,
            rgba(255,255,255,0.015) 1px,
            transparent 3px,
            transparent 4px
          );
          opacity: 0.25;
          mix-blend-mode: soft-light;
        }

        .rps-nav-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 12px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* ===== LOGO ===== */
        .rps-logo {
          color: var(--primary);
          font-family: var(--mono);
          font-size: 0.82rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: 0.25s ease-out;
        }

        .rps-logo-dot {
          width: 9px;
          height: 9px;
          background: radial-gradient(circle, var(--primary), #38bdf8);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(125, 211, 252, 0.9);
          animation: pulseLogo 2.8s infinite ease-in-out;
        }

        @keyframes pulseLogo {
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 14px rgba(125, 211, 252, 1);
          }
        }

        .rps-logo:hover {
          color: #b9ecff;
          text-shadow: 0 0 12px rgba(125, 211, 252, 0.45);
        }

        /* ===== LINKS ===== */
        .rps-links {
          display: flex;
          gap: 24px;
        }

        .rps-link {
          font-family: var(--mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          color: var(--muted);
          transition: 0.2s ease-out;
        }

        .rps-link:hover {
          color: var(--primary);
          text-shadow: 0 0 8px rgba(125, 211, 252, 0.45);
        }

        /* ===== LOGOUT ===== */
        .rps-logout {
          font-family: var(--mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          padding: 7px 16px;
          letter-spacing: 0.12em;
          color: #ffbaba;
          border: 1px solid rgba(255, 90, 90, 0.4);
          background: rgba(75, 0, 0, 0.35);
          border-radius: 10px;
          transition: 0.25s ease-out;
          box-shadow: inset 0 0 10px rgba(255, 90, 90, 0.15);
        }

        .rps-logout:hover {
          border-color: rgba(255, 140, 140, 0.7);
          color: white;
          background: rgba(255, 35, 35, 0.45);
          box-shadow:
            0 0 14px rgba(255, 90, 90, 0.4),
            inset 0 0 14px rgba(255, 90, 90, 0.7);
          transform: translateY(-1px);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
          .rps-links {
            gap: 12px;
          }
          .rps-link {
            font-size: 0.72rem;
          }
          .rps-logo {
            font-size: 0.72rem;
            letter-spacing: 0.18em;
          }
        }
      `}</style>
    </>
  );
}

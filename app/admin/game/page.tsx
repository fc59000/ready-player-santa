"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "💠" },
    { href: "/avatars", label: "Avatars", icon: "🧬" },
    { href: "/gift", label: "Cadeau", icon: "🎁" },
    { href: "/wishlist", label: "Wishlist", icon: "🎅" },
    { href: "/arena", label: "Arène", icon: "⚔️" },
  ];

  return (
    <>
      <nav className="santa-nav">
        <div className="santa-inner">

          {/* LEFT — LOGO SYSTEM */}
          <Link href="/dashboard" className="santa-logo">
            <span className="pulse-dot" />
            SANTA OS //
            <span className="sub"> READY PLAYER SANTA™</span>
          </Link>

          {/* CENTER LINKS */}
          <div className="santa-links">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  href={l.href}
                  key={l.href}
                  className={`santa-item ${active ? "active" : ""}`}
                >
                  <span className="icon">{l.icon}</span>
                  {l.label}

                  {/* ACTIVE HIGHLIGHT */}
                  {active && <span className="active-glow"></span>}
                </Link>
              );
            })}
          </div>

          {/* RIGHT — STATUS & LOGOUT */}
          <div className="santa-right">
            <div className="status-indicator">
              <span className="status-dot" /> CONNECTÉ
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              ⏻ Quitter
            </button>
          </div>
        </div>
      </nav>

      {/* === STYLES === */}
      <style jsx>{`
        /* ROOT NAV */
        .santa-nav {
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 200;
          padding-top: 4px;
          background: rgba(3, 7, 18, 0.85);
          backdrop-filter: blur(18px) saturate(1.45);
          border-bottom: 1px solid rgba(125, 211, 252, 0.22);
          box-shadow:
            0 0 35px rgba(56, 189, 248, 0.18),
            inset 0 -1px 0 rgba(148, 163, 184, 0.25);
        }

        /* Scanlines */
        .santa-nav::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.02) 0,
            rgba(255,255,255,0.02) 1px,
            transparent 3px,
            transparent 4px
          );
          mix-blend-mode: overlay;
          pointer-events: none;
          opacity: 0.2;
        }

        .santa-inner {
          max-width: 1380px;
          margin: 0 auto;
          padding: 12px 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ======================
            LOGO
        ====================== */
        .santa-logo {
          font-family: var(--mono);
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--primary);
          letter-spacing: 0.18em;
          font-size: 0.82rem;
          text-transform: uppercase;
          position: relative;
          transition: .25s ease-out;
        }

        .santa-logo:hover {
          text-shadow: 0 0 14px rgba(125, 211, 252, 0.6);
          transform: translateY(-1px);
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--primary), #3ccdfc);
          box-shadow: 0 0 15px rgba(125, 211, 252, 1);
          animation: pulseDot 2.4s infinite ease-in-out;
        }

        @keyframes pulseDot {
          50% {
            transform: scale(1.25);
            box-shadow: 0 0 22px rgba(125, 211, 252, 1);
          }
        }

        .santa-logo .sub {
          color: var(--muted);
          letter-spacing: .12em;
          margin-left: 4px;
        }

        /* ======================
            LINKS
        ====================== */
        .santa-links {
          display: flex;
          gap: 28px;
          position: relative;
        }

        .santa-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          padding: 6px 14px;
          border-radius: 10px;
          color: var(--muted);
          transition: all .25s ease-out;
        }

        .santa-item:hover {
          color: var(--primary);
          text-shadow: 0 0 12px rgba(125,211,252,.5);
          transform: translateY(-1px);
        }

        /* ICON */
        .icon {
          font-size: 1rem;
        }

        /* ACTIVE LINK */
        .santa-item.active {
          color: var(--primary);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.35);
          box-shadow:
            0 0 18px rgba(56, 189, 248, .35),
            inset 0 0 22px rgba(56, 189, 248, .25);
          text-shadow: 0 0 18px rgba(125, 211, 252, .8);
        }

        /* Active glow line under the link */
        .active-glow {
          position: absolute;
          left: 50%;
          bottom: -6px;
          transform: translateX(-50%);
          width: 50%;
          height: 3px;
          background: linear-gradient(90deg,
            transparent,
            var(--primary),
            transparent
          );
          box-shadow: 0 0 16px rgba(125, 211, 252, 0.7);
          animation: glowLine 1.6s infinite ease-in-out;
        }

        @keyframes glowLine {
          50% {
            width: 85%;
            box-shadow: 0 0 26px rgba(125, 211, 252, 1);
          }
        }

        /* ======================
            RIGHT PANEL
        ====================== */
        .santa-right {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .status-indicator {
          font-family: var(--mono);
          font-size: .75rem;
          letter-spacing: .14em;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--success);
          text-transform: uppercase;
        }

        .status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--success), #4ade80);
          box-shadow: 0 0 10px rgba(74, 222, 128, .8);
          animation: statusPulse 2s infinite ease-in-out;
        }

        @keyframes statusPulse {
          50% {
            transform: scale(1.3);
          }
        }

        /* LOGOUT BUTTON */
        .logout-btn {
          font-family: var(--mono);
          text-transform: uppercase;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          color: #ffbaba;
          background: rgba(75, 0, 0, 0.35);
          border: 1px solid rgba(255, 90, 90, 0.45);
          transition: .25s ease-in-out;
        }

        .logout-btn:hover {
          background: rgba(255, 40, 40, 0.45);
          border-color: rgba(255,120,120,.7);
          color: white;
          transform: translateY(-2px);
          box-shadow:
            0 0 18px rgba(255, 50, 50, .5),
            inset 0 0 16px rgba(255, 80, 80, .6);
        }

        /* RESPONSIVE */
        @media(max-width: 760px) {
          .santa-links {
            gap: 16px;
          }
          .santa-item {
            font-size: .7rem;
            padding: 6px 10px;
          }
          .santa-logo {
            font-size: .7rem;
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isArenaLive, setIsArenaLive] = useState(false);

  // 👉 Cacher la Navbar sur l’écran grand public
  if (pathname.startsWith("/arena/screen")) return null;

  useEffect(() => {
    // LOAD USER
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    // INITIAL ARENA STATUS
    supabase
      .from("game_rooms")
      .select("status")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]?.status === "playing") setIsArenaLive(true);
      });

    // LIVE ARENA STATUS LISTENER
    const channel = supabase
  .channel("arena-navbar-status")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "game_rooms" },
    (payload) => {
      if (payload.new && typeof payload.new === "object" && "status" in payload.new) {
        setIsArenaLive(payload.new.status === "playing");
      }
    }
  )
  .subscribe();


    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "💠" },
    { href: "/avatars", label: "Avatars", icon: "🧬" },
    { href: "/gift", label: "Cadeau", icon: "🎁" },
    { href: "/wishlist", label: "Wishlist", icon: "🎅" },
    { href: "/arena", label: "Arène", icon: isArenaLive ? "🔴" : "⚔️" },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <>
      <nav className="hyper-nav">
        <div className="energy-rail" />

        <div className="hyper-inner">
          {/* LEFT : Logo + Links */}
          <div className="hyper-left">
            <Link href="/dashboard" className="hyper-logo">
              <span className="logo-core" />
              <div className="logo-texts">
                <span className="text">SANTA OS</span>
                <span className="sub">READY PLAYER SANTA™</span>
              </div>
            </Link>

            <div className="hyper-links">
              {links.map((l) => {
                const active = pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`hyper-item ${active ? "active" : ""}`}
                  >
                    <span className="ico">{l.icon}</span>
                    <span>{l.label}</span>
                    {active && <span className="cyber-underline" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT : Status + Logout */}
          <div className="hyper-right">
            <div className="user-status">
              <span className="status-pulse" />
              CONNECTÉ
            </div>

            <button className="hyper-logout" onClick={handleLogout}>
              ⏻ QUITTER
            </button>
          </div>
        </div>
      </nav>

      {/* STYLES */}
      <style jsx>{`
        :root {
          --cyan: #7dd3fc;
          --cyan-glow: rgba(125, 211, 252, 0.85);
          --bg-dark: rgba(3, 7, 18, 0.78);
        }

        .hyper-nav {
          width: 100%;
          position: sticky;
          top: 0;
          z-index: 200;
          background: var(--bg-dark);
          backdrop-filter: blur(22px) saturate(1.6);
          border-bottom: 1px solid rgba(125, 211, 252, 0.25);
          box-shadow:
            0 0 28px rgba(15, 23, 42, 0.8),
            0 0 16px rgba(56, 189, 248, 0.18);
        }

        .energy-rail {
          position: absolute;
          top: 0;
          left: -40%;
          width: 180%;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--cyan),
            white,
            var(--cyan),
            transparent
          );
          animation: railMove 3s linear infinite;
          opacity: 0.55;
          pointer-events: none;
        }

        @keyframes railMove {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .hyper-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 12px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hyper-left {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        /* LOGO */
        .hyper-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--cyan);
          font-family: var(--mono);
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .logo-core {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--cyan), #e0f2fe);
          box-shadow: 0 0 18px var(--cyan-glow);
          animation: pulseCore 2.2s infinite ease-in-out;
        }

        @keyframes pulseCore {
          50% {
            transform: scale(1.25);
            box-shadow: 0 0 26px var(--cyan-glow);
          }
        }

        .logo-texts {
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
        }

        .sub {
          font-size: 0.65rem;
          color: var(--muted);
        }

        /* LINKS */
        .hyper-links {
          display: flex;
          gap: 22px;
        }

        .hyper-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-family: var(--mono);
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          color: var(--muted);
          transition: 0.2s;
          border-radius: 10px;
        }

        .hyper-item:hover {
          color: var(--cyan);
          text-shadow: 0 0 12px var(--cyan-glow);
          transform: translateY(-1px);
        }

        .hyper-item.active {
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(125, 211, 252, 0.5);
          color: var(--cyan);
          box-shadow:
            0 0 16px rgba(56, 189, 248, 0.35),
            inset 0 0 12px rgba(56, 189, 248, 0.25);
        }

        .cyber-underline {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 3px;
          background: var(--cyan);
          border-radius: 999px;
          box-shadow: 0 0 16px var(--cyan-glow);
          animation: cyberPulse 1.3s infinite ease-in-out;
        }

        @keyframes cyberPulse {
          50% {
            width: 90%;
          }
        }

        /* RIGHT SIDE */
        .hyper-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--mono);
          color: var(--success);
          font-size: 0.75rem;
        }

        .status-pulse {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle, #22c55e, #4ade80);
          animation: statusPulse 2s infinite ease-in-out;
        }

        @keyframes statusPulse {
          50% {
            transform: scale(1.3);
          }
        }

        .hyper-logout {
          font-family: var(--mono);
          padding: 7px 16px;
          background: rgba(127, 29, 29, 0.45);
          border: 1px solid rgba(248, 113, 113, 0.5);
          color: #fed7d7;
          border-radius: 10px;
          letter-spacing: 0.12em;
          transition: 0.2s;
        }

        .hyper-logout:hover {
          background: rgba(239, 68, 68, 0.8);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .hyper-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}

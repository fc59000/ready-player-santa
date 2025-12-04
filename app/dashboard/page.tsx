/** READY PLAYER SANTA™ – DASHBOARD AAA ULTIMATE **/
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

type Profile = {
  id: string;
  pseudo: string;
  avatar_id: string | null;
};

type Avatar = {
  id: string;
  name: string;
  image_url: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [shellVisible, setShellVisible] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !profileData) {
        router.push("/onboarding");
        return;
      }

      setProfile(profileData);

      if (profileData.avatar_id) {
        const { data: avatarData } = await supabase
          .from("avatars")
          .select("*")
          .eq("id", profileData.avatar_id)
          .single();

        setAvatar(avatarData);
      }

      // Vérifier si admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (adminData) {
        setIsAdmin(true);
      }

      setLoading(false);
      setTimeout(() => setShellVisible(true), 300);
    }

    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <>
        <Particles />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[var(--bg-dark)] to-[var(--bg-deep)]">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">🎮</div>
            <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
              CHARGEMENT DU DASHBOARD
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".85rem",
                color: "var(--muted)",
                letterSpacing: ".15em",
              }}
            >
              Accès aux modules en cours...
            </div>
            <div className="mt-8 flex justify-center">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-[var(--primary)] rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Particles />
      
      <div
        style={{
          maxWidth: "1100px",
          margin: "60px auto 80px",
          padding: "0 var(--spacing-lg)",
          opacity: shellVisible ? 1 : 0,
          transform: shellVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity .7s ease-out, transform .7s ease-out",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ========== HEADER PANEL ========== */}
        <div className="cyberpunk-panel fade-in-up" style={{ animationDelay: ".2s", marginBottom: "var(--spacing-xl)" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
            <div className="hud-title" style={{ marginBottom: "8px" }}>
              TABLEAU DE BORD // SANTA OS
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".78rem",
                letterSpacing: ".18em",
                color: "var(--muted)",
                textTransform: "uppercase",
              }}
            >
              Module opérateur activé
            </div>
          </div>

          {/* Profile Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-lg)",
              padding: "var(--spacing-lg)",
              background: "rgba(15,23,42,.6)",
              borderRadius: "16px",
              border: "1px solid rgba(125,211,252,.2)",
            }}
          >
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              {avatar && avatar.image_url && !imageError ? (
                <img
                  src={avatar.image_url}
                  className="fade-in-up"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "16px",
                    objectFit: "cover",
                    border: "2px solid var(--primary)",
                    boxShadow: "0 0 30px rgba(125,211,252,.4)",
                    animationDelay: ".3s",
                  }}
                  alt="avatar"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="fade-in-up"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "16px",
                    background: "rgba(30,41,59,.9)",
                    border: "2px solid rgba(148,163,184,.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    animationDelay: ".3s",
                  }}
                >
                  ❔
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="fade-in-up" style={{ flex: 1, animationDelay: ".4s" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".7rem",
                  letterSpacing: ".2em",
                  color: "var(--primary)",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                Joueur connecté
              </div>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "8px",
                  textShadow: "0 0 20px rgba(125,211,252,.3)",
                }}
              >
                {profile?.pseudo}
              </h2>
              {avatar ? (
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: ".82rem",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "var(--success)" }}>●</span>
                  Avatar : {avatar.name}
                </div>
              ) : (
                <button
                  onClick={() => router.push("/avatars")}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: ".82rem",
                    color: "var(--primary)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  → Choisir un avatar
                </button>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="fade-in-up"
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".75rem",
                letterSpacing: ".12em",
                padding: "10px 20px",
                borderRadius: "10px",
                background: "rgba(239,68,68,.15)",
                border: "1px solid rgba(239,68,68,.3)",
                color: "var(--accent)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                animationDelay: ".5s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,.25)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,.15)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,.3)";
              }}
            >
              DÉCONNEXION
            </button>
          </div>
        </div>

        {/* ========== BOUTON ADMIN ========== */}
        {isAdmin && (
          <div className="fade-in-up" style={{ animationDelay: ".3s", marginBottom: "var(--spacing-xl)" }}>
            <button
              onClick={() => router.push("/admin/game")}
              style={{
                width: "100%",
                padding: "var(--spacing-xl)",
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(147,51,234,.2), rgba(236,72,153,.2))",
                border: "2px solid rgba(168,85,247,.5)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(168,85,247,.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "12px" }}>👑</div>
              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "6px",
                  textShadow: "0 0 20px rgba(168,85,247,.6)",
                }}
              >
                MODE ADMINISTRATEUR
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".85rem",
                  color: "rgba(216,180,254,.8)",
                  letterSpacing: ".12em",
                }}
              >
                Pilotage de l'arène • Gestion des mini-jeux
              </div>
            </button>
          </div>
        )}

        {/* ========== MODULES GRID ========== */}
        <div
          className="fade-in-up"
          style={{
            animationDelay: ".4s",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--spacing-lg)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          {[
            { icon: "🧙‍♂️", title: "Avatar", desc: "Choisir / modifier", route: "/avatars", color: "var(--primary)" },
            { icon: "🎁", title: "Mon cadeau", desc: "Ajouter / modifier", route: "/gift", color: "var(--primary)" },
            { icon: "🎅", title: "Liste au Père Noël", desc: "Liker les cadeaux", route: "/wishlist", color: "var(--success)" },
            { icon: "⚔️", title: "L'Arène", desc: "Battle (11 déc.)", route: "/arena", color: "var(--accent)" },
          ].map((module, i) => (
            <button
              key={module.title}
              onClick={() => router.push(module.route)}
              className="cyberpunk-btn"
              style={{
                padding: "var(--spacing-xl) var(--spacing-lg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "12px",
                height: "100%",
                animationDelay: `${0.5 + i * 0.1}s`,
              }}
            >
              <div style={{ fontSize: "3rem" }}>{module.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: "4px",
                  }}
                >
                  {module.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    letterSpacing: ".08em",
                  }}
                >
                  {module.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ========== INFO BOX ========== */}
        <div
          className="fade-in-up"
          style={{
            animationDelay: ".9s",
            padding: "var(--spacing-lg)",
            borderRadius: "16px",
            background: "rgba(15,23,42,.4)",
            border: "1px solid rgba(148,163,184,.2)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: ".85rem",
              color: "var(--muted)",
              letterSpacing: ".1em",
            }}
          >
            Prépare-toi pour le{" "}
            <span
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                textShadow: "0 0 12px rgba(125,211,252,.4)",
              }}
            >
              11 décembre 2025 • 11h30
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
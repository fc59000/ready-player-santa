/** READY PLAYER SANTA™ – AVATARS PAGE AAA ULTIMATE **/
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

type Avatar = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  taken_by_user_id: string | null;
};

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [shellVisible, setShellVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadAvatars() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("avatars")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setError("Impossible de charger les avatars.");
      } else {
        setAvatars(data ?? []);
      }

      setLoading(false);
      setTimeout(() => setShellVisible(true), 300);
    }

    loadAvatars();
  }, [router]);

  async function chooseAvatar(avatarId: string) {
    if (!userId) return;

    setError("");
    setSaving(avatarId);

    const { data, error: updateAvatarError } = await supabase
      .from("avatars")
      .update({ taken_by_user_id: userId })
      .eq("id", avatarId)
      .is("taken_by_user_id", null)
      .select()
      .single();

    if (updateAvatarError || !data) {
      setError("Tu as déjà choisi un avatar ! Impossible de le changer.");
      setSaving(null);
      return;
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ avatar_id: avatarId })
      .eq("id", userId);

    if (updateProfileError) {
      console.error(updateProfileError);
      setError("Erreur lors de la mise à jour du profil.");
      setSaving(null);
      return;
    }

    const { data: refreshed } = await supabase
      .from("avatars")
      .select("*")
      .order("name", { ascending: true });

    setAvatars(refreshed ?? []);
    setSaving(null);

    router.push("/dashboard");
  }

  function handleImageError(avatarId: string) {
    setImageErrors((prev) => new Set(prev).add(avatarId));
  }

  if (loading) {
    return (
      <>
        <Particles />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[var(--bg-dark)] to-[var(--bg-deep)]">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">🧙‍♂️</div>
            <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
              CHARGEMENT DES AVATARS
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".85rem",
                color: "var(--muted)",
                letterSpacing: ".15em",
              }}
            >
              Initialisation module personnages...
            </div>
            <div className="mt-8 flex justify-center">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-[var(--primary)] rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const availableCount = avatars.filter((a) => !a.taken_by_user_id).length;

  return (
    <>
      <Particles />

      <div
        style={{
          maxWidth: "1400px",
          margin: "60px auto 80px",
          padding: "0 var(--spacing-lg)",
          opacity: shellVisible ? 1 : 0,
          transform: shellVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity .7s ease-out, transform .7s ease-out",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ========== HEADER ========== */}
        <div className="fade-in-up" style={{ animationDelay: ".2s", textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <div className="hud-title" style={{ marginBottom: "12px" }}>
            MODULE AVATARS // SANTA OS
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "16px",
              textShadow: "0 0 30px rgba(125,211,252,.3)",
            }}
          >
            Choisir ton avatar 🎮
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--muted)",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Chaque avatar est unique. Une fois choisi, il ne sera plus disponible pour les autres joueurs.
          </p>
        </div>

        {/* ========== ERROR MESSAGE ========== */}
        {error && (
          <div
            className="fade-in-up"
            style={{
              animationDelay: ".3s",
              padding: "var(--spacing-md)",
              borderRadius: "14px",
              background: "rgba(239,68,68,.15)",
              border: "1px solid rgba(239,68,68,.4)",
              color: "rgba(252,165,165,.9)",
              marginBottom: "var(--spacing-xl)",
              maxWidth: "700px",
              margin: "0 auto var(--spacing-xl)",
              textAlign: "center",
              fontFamily: "var(--mono)",
              fontSize: ".85rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ========== EMPTY STATE ========== */}
        {avatars.length === 0 && (
          <div className="fade-in-up" style={{ animationDelay: ".4s", textAlign: "center", padding: "var(--spacing-xxl) 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "var(--spacing-lg)" }}>🤷</div>
            <p style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
              Aucun avatar disponible pour le moment.
            </p>
          </div>
        )}

        {/* ========== ALL TAKEN WARNING ========== */}
        {avatars.length > 0 && avatars.every((a) => a.taken_by_user_id && a.taken_by_user_id !== userId) && (
          <div
            className="fade-in-up"
            style={{
              animationDelay: ".4s",
              padding: "var(--spacing-md)",
              borderRadius: "14px",
              background: "rgba(251,146,60,.15)",
              border: "1px solid rgba(251,146,60,.4)",
              color: "rgba(253,186,116,.9)",
              marginBottom: "var(--spacing-xl)",
              maxWidth: "700px",
              margin: "0 auto var(--spacing-xl)",
              textAlign: "center",
              fontFamily: "var(--mono)",
              fontSize: ".85rem",
            }}
          >
            ⚠️ Tous les avatars sont déjà pris. Contacte l'organisateur.
          </div>
        )}

        {/* ========== STATS BAR ========== */}
        <div
          className="fade-in-up"
          style={{
            animationDelay: ".4s",
            padding: "var(--spacing-md)",
            borderRadius: "14px",
            background: "rgba(15,23,42,.6)",
            border: "1px solid rgba(125,211,252,.2)",
            marginBottom: "var(--spacing-xl)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: ".85rem",
              letterSpacing: ".12em",
              color: "var(--muted)",
            }}
          >
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>{availableCount}</span> avatar(s) disponible(s) sur{" "}
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{avatars.length}</span>
          </div>
        </div>

        {/* ========== AVATARS GRID ========== */}
        <div
          className="fade-in-up"
          style={{
            animationDelay: ".5s",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "var(--spacing-lg)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          {avatars.map((avatar, i) => {
            const isTaken = !!avatar.taken_by_user_id;
            const isMine = avatar.taken_by_user_id === userId;
            const hasImageError = imageErrors.has(avatar.id);
            const isLoading = saving === avatar.id;

            return (
              <div
                key={avatar.id}
                className="fade-in-up"
                style={{
                  animationDelay: `${0.6 + i * 0.02}s`,
                  opacity: isTaken && !isMine ? 0.4 : 1,
                }}
              >
                <div
                  onClick={() => {
                    if (!isTaken || isMine) {
                      chooseAvatar(avatar.id);
                    }
                  }}
                  style={{
                    background: "rgba(15,23,42,.8)",
                    borderRadius: "16px",
                    border: isMine
                      ? "2px solid var(--success)"
                      : isTaken
                      ? "2px solid rgba(63,63,70,.5)"
                      : "2px solid rgba(125,211,252,.2)",
                    overflow: "hidden",
                    cursor: isTaken && !isMine ? "not-allowed" : "pointer",
                    transition: "all var(--transition-fast)",
                    boxShadow: isMine ? "0 0 30px rgba(34,197,94,.3)" : "none",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isTaken || isMine) {
                      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                      e.currentTarget.style.borderColor = isMine ? "var(--success)" : "var(--primary)";
                      e.currentTarget.style.boxShadow = isMine
                        ? "0 12px 40px rgba(34,197,94,.4)"
                        : "0 12px 40px rgba(125,211,252,.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.borderColor = isMine
                      ? "var(--success)"
                      : isTaken
                      ? "rgba(63,63,70,.5)"
                      : "rgba(125,211,252,.2)";
                    e.currentTarget.style.boxShadow = isMine ? "0 0 30px rgba(34,197,94,.3)" : "none";
                  }}
                >
                  {/* Avatar Image */}
                  <div style={{ position: "relative", aspectRatio: "832/1248", background: "rgba(9,9,11,.9)" }}>
                    {avatar.image_url && !hasImageError ? (
                      <>
                        <img
                          src={avatar.image_url}
                          alt={avatar.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={() => handleImageError(avatar.id)}
                        />

                        {/* Overlay Loading */}
                        {isLoading && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,.8)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div className="w-10 h-10 border-4 border-zinc-700 border-t-[var(--primary)] rounded-full animate-spin"></div>
                          </div>
                        )}

                        {/* Overlay Pris */}
                        {isTaken && !isMine && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,.75)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div style={{ fontSize: "2.5rem" }}>🔒</div>
                            <div
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: ".75rem",
                                color: "var(--muted)",
                                fontWeight: 600,
                                letterSpacing: ".1em",
                              }}
                            >
                              DÉJÀ PRIS
                            </div>
                          </div>
                        )}

                        {/* Badge Ton Avatar */}
                        {isMine && (
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              background: "var(--success)",
                              color: "#fff",
                              fontSize: ".7rem",
                              fontWeight: 700,
                              padding: "6px 12px",
                              borderRadius: "20px",
                              boxShadow: "0 4px 12px rgba(34,197,94,.4)",
                              letterSpacing: ".08em",
                            }}
                          >
                            ✅ TON AVATAR
                          </div>
                        )}

                        {/* Hover Overlay Disponible */}
                        {!isTaken && !isLoading && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(to top, rgba(0,0,0,.9), transparent 50%)",
                              opacity: 0,
                              transition: "opacity var(--transition-fast)",
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "center",
                              paddingBottom: "var(--spacing-lg)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                          >
                            <div
                              style={{
                                background: "var(--primary)",
                                color: "var(--bg-deep)",
                                fontSize: ".85rem",
                                fontWeight: 700,
                                padding: "10px 20px",
                                borderRadius: "12px",
                                letterSpacing: ".08em",
                              }}
                            >
                              CHOISIR
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "4rem",
                        }}
                      >
                        ❔
                      </div>
                    )}
                  </div>

                  {/* Avatar Info */}
                  <div style={{ padding: "var(--spacing-md)" }}>
                    <h3
                      style={{
                        fontSize: ".95rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: "6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {avatar.name}
                    </h3>
                    {avatar.description && (
                      <p
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: ".72rem",
                          color: "var(--muted)",
                          lineHeight: "1.4",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {avatar.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========== BACK BUTTON ========== */}
        <div className="fade-in-up" style={{ animationDelay: ".7s", textAlign: "center" }}>
          <button onClick={() => router.push("/dashboard")} className="cyberpunk-btn">
            ← RETOUR AU DASHBOARD
          </button>
        </div>
      </div>
    </>
  );
}
/** READY PLAYER SANTA™ – WISHLIST PAGE AAA ULTIMATE **/
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

type Gift = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  pseudo?: string;
  likes_count?: number;
  is_liked_by_me?: boolean;
  is_mine?: boolean;
};

export default function WishlistPage() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [shellVisible, setShellVisible] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    setUserId(userData.user.id);

    // 1. Charger TOUS les cadeaux
    const { data: giftsData, error: giftsError } = await supabase
      .from("gifts")
      .select("*");

    if (giftsError) {
      console.error("Erreur chargement cadeaux:", giftsError);
      setLoading(false);
      return;
    }

    // 2. Charger TOUS les profils
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, pseudo");

    // 3. Charger tous les likes
    const { data: likesData } = await supabase
      .from("gift_likes")
      .select("gift_id, user_id");

    // 4. Combiner les données
    const giftsWithInfo = (giftsData || []).map((gift: any) => {
      const profile = (profilesData || []).find((p: any) => p.id === gift.user_id);
      const giftLikes = (likesData || []).filter((like: any) => like.gift_id === gift.id);
      
      return {
        ...gift,
        pseudo: profile?.pseudo || "Anonyme",
        likes_count: giftLikes.length,
        is_liked_by_me: giftLikes.some((like: any) => like.user_id === userData.user.id),
        is_mine: gift.user_id === userData.user.id,
      };
    });

    setGifts(giftsWithInfo);
    setLoading(false);
    setTimeout(() => setShellVisible(true), 300);
  }

  async function toggleLike(giftId: string) {
    if (!userId) return;

    const gift = gifts.find((g) => g.id === giftId);
    if (!gift || gift.is_mine) return;

    // ✅ UPDATE OPTIMISTE INSTANTANÉ (pas de latence!)
    setGifts(prev => prev.map(g => {
      if (g.id === giftId) {
        return {
          ...g,
          is_liked_by_me: !g.is_liked_by_me,
          likes_count: g.is_liked_by_me 
            ? Math.max((g.likes_count || 1) - 1, 0)
            : (g.likes_count || 0) + 1
        };
      }
      return g;
    }));

    // ✅ PUIS sauvegarde en base (en arrière-plan)
    if (gift.is_liked_by_me) {
      await supabase
        .from("gift_likes")
        .delete()
        .eq("user_id", userId)
        .eq("gift_id", giftId);
    } else {
      await supabase
        .from("gift_likes")
        .insert({ user_id: userId, gift_id: giftId });
    }
    
    // Plus de loadWishlist() ici ! Gain de performance énorme
  }

  function handleImageError(giftId: string) {
    setImageErrors((prev) => new Set(prev).add(giftId));
  }

  if (loading) {
    return (
      <>
        <Particles />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[var(--bg-dark)] to-[var(--bg-deep)]">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">🎅</div>
            <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
              CHARGEMENT LISTE DE NOËL
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".85rem",
                color: "var(--muted)",
                letterSpacing: ".15em",
              }}
            >
              Analyse des cadeaux disponibles...
            </div>
            <div className="mt-8 flex justify-center">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-[var(--accent)] rounded-full animate-spin"></div>
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
            MODULE LISTE DE NOËL // SANTA OS
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "16px",
              textShadow: "0 0 30px rgba(239,68,68,.3)",
            }}
          >
            🎅 Liste au Père Noël
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--muted)",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Like les cadeaux qui te font envie ! Le jour J, tu pourras te battre pour les gagner.<br/>
            <span style={{ fontSize: ".85rem", color: "var(--muted-dark)" }}>
              Les images sont affichées au format écran (identique au Jour J).
            </span>
          </p>
        </div>

        {/* ========== EMPTY STATE ========== */}
        {gifts.length === 0 && (
          <div className="fade-in-up" style={{ animationDelay: ".4s", textAlign: "center", padding: "var(--spacing-xxl) 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "var(--spacing-lg)" }}>📭</div>
            <p style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
              Aucun cadeau disponible pour le moment.
            </p>
            <p style={{ fontSize: ".9rem", color: "var(--muted-dark)", marginTop: "var(--spacing-sm)" }}>
              Reviens quand tes collègues auront déposé leurs cadeaux !
            </p>
          </div>
        )}

        {/* ========== GIFTS GRID ========== */}
        <div
          className="fade-in-up"
          style={{
            animationDelay: ".4s",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "var(--spacing-lg)",
            marginBottom: "var(--spacing-xl)",
          }}
        >
          {gifts.map((gift, i) => {
            const hasImageError = imageErrors.has(gift.id);

            return (
              <div
                key={gift.id}
                className="fade-in-up"
                style={{ animationDelay: `${0.5 + i * 0.05}s` }}
              >
                <div
                  style={{
                    background: "rgba(15,23,42,.8)",
                    borderRadius: "16px",
                    border: gift.is_mine
                      ? "2px solid var(--success)"
                      : "2px solid rgba(148,163,184,.2)",
                    overflow: "hidden",
                    transition: "all var(--transition-fast)",
                    boxShadow: gift.is_mine ? "0 0 30px rgba(34,197,94,.3)" : "none",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.borderColor = gift.is_mine
                      ? "var(--success)"
                      : "var(--accent)";
                    e.currentTarget.style.boxShadow = gift.is_mine
                      ? "0 12px 40px rgba(34,197,94,.4)"
                      : "0 12px 40px rgba(239,68,68,.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = gift.is_mine
                      ? "var(--success)"
                      : "rgba(148,163,184,.2)";
                    e.currentTarget.style.boxShadow = gift.is_mine
                      ? "0 0 30px rgba(34,197,94,.3)"
                      : "none";
                  }}
                >
                  {/* Gift Image - Format PAYSAGE 16:9 (comme Jour J) */}
                  <div style={{ position: "relative", aspectRatio: "16/9", background: "rgba(9,9,11,.9)" }}>
                    {gift.image_url && !hasImageError ? (
                      <img
                        src={gift.image_url}
                        alt={gift.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={() => handleImageError(gift.id)}
                      />
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
                        🎁
                      </div>
                    )}

                    {/* Badge TON CADEAU */}
                    {gift.is_mine && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
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
                        🎁 TON CADEAU
                      </div>
                    )}

                    {/* Like Button */}
                    {!gift.is_mine && (
                      <button
                        onClick={() => toggleLike(gift.id)}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          background: gift.is_liked_by_me
                            ? "var(--accent)"
                            : "rgba(9,9,11,.8)",
                          border: gift.is_liked_by_me
                            ? "2px solid var(--accent)"
                            : "2px solid rgba(148,163,184,.3)",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                          boxShadow: gift.is_liked_by_me
                            ? "0 4px 12px rgba(239,68,68,.5)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.15)";
                          e.currentTarget.style.boxShadow = gift.is_liked_by_me
                            ? "0 6px 20px rgba(239,68,68,.6)"
                            : "0 4px 12px rgba(148,163,184,.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = gift.is_liked_by_me
                            ? "0 4px 12px rgba(239,68,68,.5)"
                            : "none";
                        }}
                      >
                        {gift.is_liked_by_me ? "❤️" : "🤍"}
                      </button>
                    )}
                  </div>

                  {/* Gift Info */}
                  <div style={{ padding: "var(--spacing-md)" }}>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: "8px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {gift.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: ".8rem",
                        color: "var(--muted)",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginBottom: "var(--spacing-md)",
                      }}
                    >
                      {gift.description}
                    </p>

                    {/* Footer */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "var(--spacing-sm)",
                        borderTop: "1px solid rgba(148,163,184,.15)",
                      }}
                    >
                      {/* User Info */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: gift.is_mine
                              ? "var(--success)"
                              : "linear-gradient(135deg, var(--primary), #38bdf8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: ".85rem",
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {gift.is_mine ? "🎁" : (gift.pseudo?.charAt(0).toUpperCase() || "?")}
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: ".8rem",
                            color: "var(--muted)",
                          }}
                        >
                          {gift.is_mine ? "Toi" : gift.pseudo}
                        </span>
                      </div>

                      {/* Likes Count */}
                      {!gift.is_mine && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontFamily: "var(--mono)",
                            fontSize: ".85rem",
                            color: gift.likes_count ? "var(--accent)" : "var(--muted-dark)",
                            fontWeight: 600,
                          }}
                        >
                          <span>❤️</span>
                          <span>{gift.likes_count || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========== INFO BOX ========== */}
        {gifts.length > 0 && (
          <div
            className="fade-in-up"
            style={{
              animationDelay: ".7s",
              padding: "var(--spacing-lg)",
              borderRadius: "16px",
              background: "rgba(15,23,42,.4)",
              border: "1px solid rgba(148,163,184,.2)",
              textAlign: "center",
              marginBottom: "var(--spacing-xl)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".9rem",
                color: "var(--muted)",
                letterSpacing: ".08em",
              }}
            >
              💡 <span style={{ color: "var(--text)", fontWeight: 600 }}>ASTUCE :</span> Plus tu likes de cadeaux,
              plus tu auras de chances de participer aux batailles le jour J !
            </p>
          </div>
        )}

        {/* ========== BACK BUTTON ========== */}
        <div className="fade-in-up" style={{ animationDelay: ".8s", textAlign: "center" }}>
          <button onClick={() => router.push("/dashboard")} className="cyberpunk-btn">
            ← RETOUR AU DASHBOARD
          </button>
        </div>
      </div>
    </>
  );
}
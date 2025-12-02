"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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

    // 1. Charger TOUS les cadeaux (sans relation)
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
      // Trouver le profil
      const profile = (profilesData || []).find((p: any) => p.id === gift.user_id);
      
      // Calculer les likes
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
  }

  async function toggleLike(giftId: string) {
    if (!userId) return;

    const gift = gifts.find((g) => g.id === giftId);
    if (!gift || gift.is_mine) return;

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

    loadWishlist();
  }

  function handleImageError(giftId: string) {
    setImageErrors((prev) => new Set(prev).add(giftId));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white text-2xl">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7dd3fc",
              marginBottom: "12px",
              textShadow: "0 0 20px rgba(125, 211, 252, 0.4)",
            }}
          >
            LISTE DE NOËL
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            🎅 Liste au Père Noël
          </h1>
          <p className="text-base text-zinc-400">
            Like les cadeaux qui te font envie ! Le jour J, tu pourras te battre pour les gagner.
          </p>
        </div>

        {/* Empty State */}
        {gifts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-zinc-400 text-lg">
              Aucun cadeau disponible pour le moment.
            </p>
          </div>
        )}

        {/* Gifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gifts.map((gift) => {
            const hasImageError = imageErrors.has(gift.id);

            return (
              <div
                key={gift.id}
                className={`bg-[#0f172a] border-2 rounded-xl overflow-hidden transition-all ${
                  gift.is_mine
                    ? "border-green-500/50 shadow-lg shadow-green-500/20"
                    : "border-zinc-700/50 hover:border-[#7dd3fc]/50"
                }`}
              >
                {/* Gift Image - Format portrait */}
                <div className="relative aspect-[832/1248] bg-zinc-900">
                  {gift.image_url && !hasImageError ? (
                    <img
                      src={gift.image_url}
                      alt={gift.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(gift.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-6xl">
                      🎁
                    </div>
                  )}

                  {/* Badge "TON CADEAU" */}
                  {gift.is_mine && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🎁 TON CADEAU
                    </div>
                  )}

                  {/* Like Button */}
                  {!gift.is_mine && (
                    <button
                      onClick={() => toggleLike(gift.id)}
                      className={`absolute top-3 right-3 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                        gift.is_liked_by_me
                          ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50"
                          : "bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700"
                      }`}
                    >
                      {gift.is_liked_by_me ? "❤️" : "🤍"}
                    </button>
                  )}
                </div>

                {/* Gift Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {gift.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                    {gift.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                        {gift.is_mine ? "🎁" : (gift.pseudo?.charAt(0).toUpperCase() || "?")}
                      </div>
                      <span className="text-sm text-zinc-400">
                        {gift.is_mine ? "Toi" : gift.pseudo}
                      </span>
                    </div>

                    {/* Likes Count */}
                    {!gift.is_mine && (
                      <div className="flex items-center gap-1 text-sm text-zinc-400">
                        <span>❤️</span>
                        <span>{gift.likes_count || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        {gifts.length > 0 && (
          <div className="bg-[#0f172a]/60 border border-zinc-700/30 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-400">
              💡 <span className="text-white font-semibold">Astuce :</span> Plus tu likes de cadeaux, plus tu auras de chances de participer aux batailles le jour J !
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-[#0f172a] border border-zinc-700 text-zinc-300 rounded-xl hover:border-[#7dd3fc] hover:text-white transition-all"
          >
            ← Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
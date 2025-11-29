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
  profile?: {
    pseudo: string;
    avatar?: {
      name: string;
      image_url: string | null;
    };
  };
  likes_count?: number;
  is_liked_by_me?: boolean;
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

    // Récupérer tous les cadeaux sauf le mien
    const { data: giftsData, error: giftsError } = await supabase
      .from("gifts")
      .select(`
        *,
        profile:profiles!gifts_user_id_fkey (
          pseudo,
          avatar:avatars!profiles_avatar_id_fkey (
            name,
            image_url
          )
        )
      `)
      .neq("user_id", userData.user.id);

    if (giftsError) {
      console.error(giftsError);
      setLoading(false);
      return;
    }

    // Récupérer tous les likes
    const { data: likesData } = await supabase
      .from("gift_likes")
      .select("gift_id, user_id");

    // Calculer les likes pour chaque cadeau
    const giftsWithLikes = (giftsData || []).map((gift: any) => {
      const giftLikes = (likesData || []).filter((like) => like.gift_id === gift.id);
      return {
        ...gift,
        likes_count: giftLikes.length,
        is_liked_by_me: giftLikes.some((like) => like.user_id === userData.user.id),
      };
    });

    setGifts(giftsWithLikes);
    setLoading(false);
  }

  async function toggleLike(giftId: string) {
    if (!userId) return;

    const gift = gifts.find((g) => g.id === giftId);
    if (!gift) return;

    if (gift.is_liked_by_me) {
      // Unlike
      const { error } = await supabase
        .from("gift_likes")
        .delete()
        .eq("user_id", userId)
        .eq("gift_id", giftId);

      if (error) {
        console.error(error);
        return;
      }
    } else {
      // Like
      const { error } = await supabase
        .from("gift_likes")
        .insert({ user_id: userId, gift_id: giftId });

      if (error) {
        console.error(error);
        return;
      }
    }

    // Recharger les données
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
          <h1 className="text-4xl font-bold text-white mb-2">
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
            <p className="text-zinc-500 text-sm mt-2">
              Reviens plus tard quand tes collègues auront ajouté leurs cadeaux !
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
                className="bg-[#0f172a] border-2 border-zinc-700/50 rounded-xl overflow-hidden hover:border-[#7dd3fc]/50 transition-all"
              >
                {/* Gift Image */}
                <div className="relative">
                  {gift.image_url && !hasImageError ? (
                    <img
                      src={gift.image_url}
                      alt={gift.title}
                      className="w-full h-48 object-cover"
                      onError={() => handleImageError(gift.id)}
                    />
                  ) : (
                    <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-6xl">
                      🎁
                    </div>
                  )}

                  {/* Like Button Overlay */}
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
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">
                        {gift.profile?.avatar?.image_url ? (
                          <img
                            src={gift.profile.avatar.image_url}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          "👤"
                        )}
                      </div>
                      <span className="text-sm text-zinc-400">
                        {gift.profile?.pseudo || "Anonyme"}
                      </span>
                    </div>

                    {/* Likes Count */}
                    <div className="flex items-center gap-1 text-sm text-zinc-400">
                      <span>❤️</span>
                      <span>{gift.likes_count || 0}</span>
                    </div>
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
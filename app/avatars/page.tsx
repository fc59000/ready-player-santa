"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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
      setError(
        "Tu as déjà choisi un avatar ! Impossible de le changer."
      );
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
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white text-2xl">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
            SÉLECTION D'AVATAR
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Choisir ton avatar 🎮
          </h1>
          <p className="text-base text-zinc-400 max-w-2xl mx-auto">
            Chaque avatar est unique. Une fois choisi, il ne sera plus disponible pour les autres joueurs.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Empty State */}
        {avatars.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤷</div>
            <p className="text-zinc-400 text-lg">
              Aucun avatar disponible pour le moment.
            </p>
          </div>
        )}

        {/* All Taken Warning */}
        {avatars.length > 0 &&
          avatars.every((a) => a.taken_by_user_id && a.taken_by_user_id !== userId) && (
            <div className="bg-orange-900/30 border border-orange-500/50 text-orange-300 px-4 py-3 rounded-xl mb-6 text-center max-w-2xl mx-auto">
              ⚠️ Tous les avatars sont déjà pris. Contacte l'organisateur.
            </div>
          )}

        {/* Avatars Grid - ADAPTÉ POUR FORMAT PORTRAIT */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {avatars.map((avatar) => {
            const isTaken = !!avatar.taken_by_user_id;
            const isMine = avatar.taken_by_user_id === userId;
            const hasImageError = imageErrors.has(avatar.id);

            return (
              <div
                key={avatar.id}
                className={`bg-[#0f172a] border-2 rounded-xl overflow-hidden transition-all ${
                  isTaken && !isMine
                    ? "border-zinc-800 opacity-40 cursor-not-allowed"
                    : isMine
                    ? "border-green-500/50 shadow-lg shadow-green-500/20 ring-2 ring-green-500/20"
                    : "border-[#7dd3fc]/30 hover:border-[#7dd3fc] hover:shadow-xl hover:shadow-[#7dd3fc]/20 cursor-pointer hover:scale-105"
                }`}
                onClick={() => {
                  if (!isTaken || isMine) {
                    chooseAvatar(avatar.id);
                  }
                }}
              >
                {/* Avatar Image - Format portrait optimisé */}
                <div className="relative aspect-[832/1248] w-full bg-zinc-900">
                  {avatar.image_url && !hasImageError ? (
                    <>
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(avatar.id)}
                      />
                      {/* Overlay si pris */}
                      {isTaken && !isMine && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🔒</div>
                            <div className="text-zinc-400 text-sm font-semibold">
                              Déjà pris
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Badge "Ton avatar" */}
                      {isMine && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          ✅ TON AVATAR
                        </div>
                      )}
                      {/* Badge "Disponible" au hover */}
                      {!isTaken && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                          <div className="bg-[#7dd3fc] text-[#020617] text-sm font-bold px-4 py-2 rounded-full">
                            Choisir cet avatar
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      ❔
                    </div>
                  )}
                </div>

                {/* Avatar Info - Compact */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-white truncate">
                    {avatar.name}
                  </h3>
                  {avatar.description && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {avatar.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="text-center mb-8 text-zinc-400 text-sm">
          {avatars.filter((a) => !a.taken_by_user_id).length} avatar(s) disponible(s) sur {avatars.length}
        </div>

        {/* Back Button */}
        <div className="text-center">
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
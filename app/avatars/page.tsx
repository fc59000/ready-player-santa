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
        "Cet avatar vient d'être choisi par quelqu'un d'autre. Rafraîchis la page."
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Choisir ton avatar 🧙‍♂️
          </h1>
          <p className="text-base text-zinc-400">
            Chaque avatar ne peut être choisi que par une seule personne.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6">
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
            <div className="bg-orange-900/30 border border-orange-500/50 text-orange-300 px-4 py-3 rounded-xl mb-6 text-center">
              ⚠️ Tous les avatars sont déjà pris. Contacte l'organisateur.
            </div>
          )}

        {/* Avatars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {avatars.map((avatar) => {
            const isTaken = !!avatar.taken_by_user_id;
            const isMine = avatar.taken_by_user_id === userId;
            const hasImageError = imageErrors.has(avatar.id);

            return (
              <div
                key={avatar.id}
                className={`bg-[#0f172a] border-2 rounded-xl p-4 transition-all ${
                  isTaken && !isMine
                    ? "border-zinc-800 opacity-50"
                    : isMine
                    ? "border-green-500/50 shadow-lg shadow-green-500/20"
                    : "border-[#7dd3fc]/30 hover:border-[#7dd3fc] hover:shadow-lg hover:shadow-[#7dd3fc]/20"
                }`}
              >
                {/* Avatar Image */}
                {avatar.image_url && !hasImageError ? (
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={() => handleImageError(avatar.id)}
                  />
                ) : (
                  <div className="w-full h-48 bg-zinc-800 rounded-lg flex items-center justify-center text-5xl">
                    ❔
                  </div>
                )}

                {/* Avatar Info */}
                <h2 className="text-xl font-bold text-white mt-4">
                  {avatar.name}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {avatar.description}
                </p>

                {/* Status Badge */}
                {isMine && (
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-green-400 bg-green-900/30 px-3 py-1 rounded-full border border-green-500/30">
                    ✅ Ton avatar actuel
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => chooseAvatar(avatar.id)}
                  disabled={(isTaken && !isMine) || saving === avatar.id}
                  className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${
                    isTaken && !isMine
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : saving === avatar.id
                      ? "bg-zinc-700 text-zinc-400 cursor-wait"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/30"
                  }`}
                >
                  {isTaken && !isMine
                    ? "Déjà pris"
                    : saving === avatar.id
                    ? "Sélection…"
                    : isMine
                    ? "Choisir à nouveau"
                    : "Choisir"}
                </button>
              </div>
            );
          })}
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
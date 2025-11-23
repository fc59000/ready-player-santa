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
      <div className="min-h-screen flex items-center justify-center text-xl">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Choisir ton avatar 🧑‍🚀</h1>
        <p className="text-sm text-zinc-600 mb-6">
          Chaque avatar ne peut être choisi que par une seule personne.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {avatars.length === 0 && (
          <p className="text-center text-zinc-500 py-10">
            Aucun avatar disponible pour le moment.
          </p>
        )}

        {avatars.length > 0 && avatars.every(a => a.taken_by_user_id && a.taken_by_user_id !== userId) && (
          <p className="text-center text-orange-600 py-10">
            ⚠️ Tous les avatars sont déjà pris. Contacte l'organisateur.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {avatars.map((avatar) => {
            const isTaken = !!avatar.taken_by_user_id;
            const isMine = avatar.taken_by_user_id === userId;
            const hasImageError = imageErrors.has(avatar.id);

            return (
              <div
                key={avatar.id}
                className={`border rounded-xl p-4 shadow bg-white ${
                  isTaken && !isMine ? "opacity-50" : ""
                }`}
              >
                {avatar.image_url && !hasImageError ? (
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-40 object-cover rounded-lg"
                    onError={() => handleImageError(avatar.id)}
                  />
                ) : (
                  <div className="w-full h-40 bg-zinc-200 rounded-lg flex items-center justify-center text-4xl">
                    ❔
                  </div>
                )}

                <h2 className="text-xl font-bold mt-3">{avatar.name}</h2>
                <p className="text-sm text-zinc-600">{avatar.description}</p>

                {isMine && (
                  <p className="text-sm text-green-600 mt-2">
                    ✅ C'est ton avatar actuel
                  </p>
                )}

                <button
                  onClick={() => chooseAvatar(avatar.id)}
                  disabled={(isTaken && !isMine) || saving === avatar.id}
                  className={`w-full mt-4 py-2 rounded font-medium transition ${
                    isTaken && !isMine
                      ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                      : saving === avatar.id
                      ? "bg-zinc-400 text-white cursor-wait"
                      : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  {isTaken && !isMine
                    ? "Déjà pris"
                    : saving === avatar.id
                    ? "Sélection…"
                    : "Choisir"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-white shadow rounded hover:bg-zinc-50 transition"
          >
            ⬅ Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
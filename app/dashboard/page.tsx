"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white text-2xl">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profil Card */}
        <div className="bg-[#0f172a] border border-zinc-700/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-6">
            {avatar && avatar.image_url && !imageError ? (
              <img
                src={avatar.image_url}
                className="w-20 h-20 rounded-xl object-cover border-2 border-[#7dd3fc]/30"
                alt="avatar"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-4xl">
                ❔
              </div>
            )}

            <div>
              <p className="text-2xl font-bold text-white mb-1">
                {profile?.pseudo}
              </p>
              {avatar ? (
                <p className="text-base text-zinc-400">
                  Avatar : {avatar.name}
                </p>
              ) : (
                <Link
                  href="/avatars"
                  className="text-base text-[#7dd3fc] hover:text-[#38bdf8] underline"
                >
                  → Choisir un avatar
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push("/avatars")}
            className="bg-[#0f172a] border-2 border-[#7dd3fc]/30 rounded-xl p-6 text-center hover:border-[#7dd3fc] hover:bg-[#0f172a]/80 transition-all"
          >
            <div className="text-4xl mb-2">🧙‍♂️</div>
            <div className="text-lg font-semibold text-white">Avatar</div>
            <div className="text-sm text-zinc-400 mt-1">
              Choisir / changer
            </div>
          </button>

          <button
            onClick={() => router.push("/gift")}
            className="bg-[#0f172a] border-2 border-[#7dd3fc]/30 rounded-xl p-6 text-center hover:border-[#7dd3fc] hover:bg-[#0f172a]/80 transition-all"
          >
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-lg font-semibold text-white">
              Mon cadeau
            </div>
            <div className="text-sm text-zinc-400 mt-1">Ajouter / modifier</div>
          </button>

          <button
            onClick={() => router.push("/wishlist")}
            className="bg-[#0f172a] border-2 border-green-500/30 rounded-xl p-6 text-center hover:border-green-500 hover:bg-[#0f172a]/80 transition-all"
          >
            <div className="text-4xl mb-2">🎅</div>
            <div className="text-lg font-semibold text-white">Liste au Père Noël</div>
            <div className="text-sm text-zinc-400 mt-1">Liker les cadeaux</div>
          </button>

          <button
            onClick={() => router.push("/arena")}
            className="bg-[#0f172a] border-2 border-red-500/30 rounded-xl p-6 text-center hover:border-red-500 hover:bg-[#0f172a]/80 transition-all"
          >
            <div className="text-4xl mb-2">⚔️</div>
            <div className="text-lg font-semibold text-white">L'Arène</div>
            <div className="text-sm text-zinc-400 mt-1">Battle (11 déc.)</div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-[#0f172a]/60 border border-zinc-700/30 rounded-xl p-4 text-center">
          <p className="text-sm text-zinc-400">
            Prépare-toi pour le <span className="text-[#7dd3fc] font-semibold">11 décembre 2025</span>
          </p>
        </div>
      </div>
    </div>
  );
}
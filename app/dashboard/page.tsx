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

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-3xl flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">
          🎄 Ready Player Santa — Dashboard
        </h1>
        <button 
          onClick={handleLogout} 
          disabled={loading}
          className="text-red-600 underline disabled:text-red-400"
        >
          Déconnexion
        </button>
      </header>

      <div className="w-full max-w-3xl bg-white shadow rounded-lg p-6 flex items-center gap-6">
        {avatar && avatar.image_url && !imageError ? (
          <img
            src={avatar.image_url}
            className="w-24 h-24 rounded-lg object-cover border"
            alt="avatar"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-zinc-200 flex items-center justify-center text-3xl">
            ❔
          </div>
        )}

        <div>
          <p className="text-xl font-semibold">{profile?.pseudo}</p>
          {avatar ? (
            <p className="text-sm text-zinc-500 mt-1">
              Avatar sélectionné : {avatar.name}
            </p>
          ) : (
            <Link
              href="/avatars"
              className="text-sm text-blue-600 underline mt-1 inline-block"
            >
              Aucun avatar sélectionné → Choisir un avatar
            </Link>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        <button
          onClick={() => router.push("/avatars")}
          className="p-6 bg-white shadow rounded-lg text-center hover:bg-zinc-50 transition"
        >
          🧙‍♂️ Choisir / changer d'avatar
        </button>

        <button
          disabled
          className="p-6 bg-zinc-200 shadow rounded-lg text-center text-zinc-500 cursor-not-allowed"
        >
          🎁 Mon cadeau (bientôt)
        </button>

        <button
          onClick={() => router.push("/arena")}
          className="p-6 bg-white shadow rounded-lg text-center hover:bg-zinc-50 transition"
        >
          ⚔️ Entrer dans l'Arène
        </button>
      </div>

      <div className="mt-10 opacity-40 text-sm">
        <p className="mb-2 font-semibold">Dev Tools (temporaire)</p>
        <div className="flex flex-col gap-1">
          <a className="underline" href="/login">
            → Login
          </a>
          <a className="underline" href="/onboarding">
            → Onboarding
          </a>
          <a className="underline" href="/avatars">
            → Avatars
          </a>
          <a className="underline" href="/dashboard">
            → Dashboard
          </a>
          <a className="underline" href="/arena">
            → Arena
          </a>
        </div>
      </div>
    </div>
  );
}
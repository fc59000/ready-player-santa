"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkUser() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
      }
    }
    checkUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    // Vérifier l'unicité du pseudo
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("pseudo", pseudo.trim())
      .neq("id", user.id)
      .single();

    if (existing) {
      setError("Ce pseudo est déjà pris. Choisis-en un autre.");
      setLoading(false);
      return;
    }

    // Créer ou mettre à jour le profil
    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      pseudo: pseudo.trim(),
    });

    if (upsertError) {
      console.error(upsertError);
      setError("Erreur lors de la sauvegarde du profil.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Bienvenue ! Choisis ton pseudo 🎮
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="pseudo" className="block text-sm font-medium mb-2">
              Ton pseudo
            </label>
            <input
              id="pseudo"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              className="w-full px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ex: SnowWarrior"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-zinc-800 transition disabled:bg-zinc-400"
          >
            {loading ? "Création..." : "Continuer"}
          </button>
        </form>
      </div>
    </div>
  );
}
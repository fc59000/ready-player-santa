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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] px-4">
      <div className="bg-[#0f172a] border border-zinc-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Bienvenue dans l'arène !
          </h1>
          <p className="text-sm text-zinc-400">
            Choisis ton pseudo de joueur
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="pseudo"
              className="block text-sm font-semibold text-white mb-2"
            >
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
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-[#7dd3fc] transition placeholder:text-zinc-500"
              placeholder="Ex: SnowWarrior"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Entre 2 et 20 caractères
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading
                ? "bg-zinc-700 text-zinc-400 cursor-wait"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/30"
            }`}
          >
            {loading ? "Création..." : "🚀 Continuer"}
          </button>
        </form>

        {/* Info box */}
        <div className="mt-6 bg-zinc-900/50 border border-zinc-700/30 rounded-xl p-4">
          <p className="text-xs text-zinc-400 text-center">
            💡 Ce pseudo sera visible par les autres joueurs
          </p>
        </div>
      </div>
    </div>
  );
}
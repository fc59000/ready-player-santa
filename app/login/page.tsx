"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEmailSent(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setEmailSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] px-4">
      <div className="bg-[#0f172a] border border-zinc-700/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎄</div>
          <h1 className="text-2xl font-bold text-[#7dd3fc] mb-2">
            READY PLAYER SANTA™
          </h1>
          <p className="text-sm text-zinc-400">Connexion à l'arène</p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-white mb-2"
              >
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-[#7dd3fc] transition placeholder:text-zinc-500"
                placeholder="ton.email@ghicl.net"
              />
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
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/30"
              }`}
            >
              {loading ? "Envoi en cours..." : "🔑 Recevoir mon lien magique"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm text-zinc-400 hover:text-[#7dd3fc] transition"
              >
                ← Retour à l'accueil
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-7xl mb-6 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Email envoyé !
            </h2>
            <p className="text-base text-zinc-300 mb-2">
              Vérifiez votre boîte mail{" "}
              <span className="text-[#7dd3fc] font-semibold">{email}</span>
            </p>
            <p className="text-base text-zinc-300 mb-4">
              et cliquez sur le lien pour vous connecter.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              💡 Pensez à vérifier vos spams si vous ne voyez rien.
            </p>

            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="text-sm text-[#7dd3fc] hover:text-[#38bdf8] underline"
            >
              Renvoyer un email
            </button>

            <div className="mt-6">
              <button
                onClick={() => router.push("/")}
                className="text-sm text-zinc-400 hover:text-[#7dd3fc] transition"
              >
                ← Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
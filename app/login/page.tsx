"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          🎄 Ready Player Santa
        </h1>

        {!emailSent ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="ton.email@ghicl.net"
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
              {loading ? "Envoi en cours..." : "Recevoir mon lien magique"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">Email envoyé !</h2>
            <p className="text-zinc-600 mb-4">
              Vérifiez votre boîte mail <strong>{email}</strong> et cliquez sur
              le lien pour vous connecter.
            </p>
            <p className="text-sm text-zinc-500">
              Pensez à vérifier vos spams si vous ne voyez rien.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="mt-6 text-sm text-blue-600 underline"
            >
              Renvoyer un email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Charger l'utilisateur initial
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Ne rien afficher si pas connecté
  if (!user) return null;

  return (
    <nav className="w-full bg-[#0f172a]/90 backdrop-blur-sm border-b border-zinc-700/50 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* LOGO */}
        <Link
          href="/dashboard"
          className="font-bold text-base sm:text-lg text-[#7dd3fc] hover:text-[#38bdf8] transition tracking-wide"
        >
          🎮 READY PLAYER SANTA
        </Link>

        {/* LINKS */}
        <div className="flex gap-3 sm:gap-6 text-sm">
          <Link
            href="/dashboard"
            className="text-zinc-300 hover:text-[#7dd3fc] transition font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/avatars"
            className="text-zinc-300 hover:text-[#7dd3fc] transition font-medium"
          >
            Avatars
          </Link>
          <Link
            href="/gift"
            className="text-zinc-300 hover:text-[#7dd3fc] transition font-medium"
          >
            Cadeau
          </Link>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-red-500/30 font-medium"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
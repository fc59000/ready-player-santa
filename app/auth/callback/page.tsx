"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const process = async () => {
      // 1) Session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      // 2) Lecture du profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", userId)
        .single();

      // 3) Si pas de pseudo → onboarding
      if (!profile || !profile.pseudo) {
        router.replace("/onboarding");
        return;
      }

      // Sinon → dashboard
      router.replace("/dashboard");
    };

    process();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-white">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-pulse">🎮</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Connexion en cours...
        </h2>
        <p className="text-base text-zinc-400">
          Vous allez être redirigé dans un instant
        </p>
        
        {/* Loading spinner */}
        <div className="mt-8 flex justify-center">
          <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#7dd3fc] rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
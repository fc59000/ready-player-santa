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
    <div className="flex min-h-screen items-center justify-center text-xl">
      Connexion en cours…
    </div>
  );
}

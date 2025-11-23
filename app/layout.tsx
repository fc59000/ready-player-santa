import "./globals.css";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "Ready Player Santa",
  description: "Jeu Secret Santa 2025",
};

async function logout() {
  "use server";
  await supabase.auth.signOut();
  redirect("/login");
}

async function getUser() {
  const cookieStore = await cookies();
  const supabaseClient = supabase;
  
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session?.user || null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html lang="fr">
      <body className="bg-[#020617] text-white min-h-screen antialiased">
        
        {/* NAVBAR - Affichée uniquement si connecté */}
        {user && (
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
              <form action={logout}>
                <button
                  className="text-xs sm:text-sm bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-red-500/30 font-medium"
                  type="submit"
                >
                  Déconnexion
                </button>
              </form>

            </div>
          </nav>
        )}

        {/* SCANLINE EFFECT */}
        <div 
          className="fixed inset-0 pointer-events-none z-40 opacity-20 mix-blend-soft-light"
          style={{
            background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 2px, transparent 4px)'
          }}
        />

        {/* CONTENT */}
        <main className="relative z-10">
          {children}
        </main>

      </body>
    </html>
  );
}
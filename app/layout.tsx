import "./globals.css";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Ready Player Santa",
  description: "Jeu Secret Santa 2025",
};

async function logout() {
  "use server";
  await supabase.auth.signOut();
  redirect("/login");
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-zinc-100 text-zinc-900 min-h-screen">
        
        {/* NAVBAR */}
        <nav className="w-full bg-white border-b border-zinc-300 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
            
            {/* LOGO */}
            <Link href="/dashboard" className="font-bold text-lg">
              🎮 Ready Player Santa
            </Link>

            {/* LINKS */}
            <div className="flex gap-4 text-sm">
              <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
              <Link href="/avatars" className="hover:text-blue-600 transition">Avatars</Link>
              <Link href="/gift" className="hover:text-blue-600 transition">Cadeau</Link>
            </div>

            {/* LOGOUT */}
            <form action={logout}>
              <button
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                type="submit"
              >
                Déconnexion
              </button>
            </form>

          </div>
        </nav>

        {/* CONTENT */}
        <main className="max-w-4xl mx-auto mt-6 px-4">{children}</main>

      </body>
    </html>
  );
}

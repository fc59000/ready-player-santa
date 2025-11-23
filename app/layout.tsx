import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Ready Player Santa",
  description: "Jeu Secret Santa 2025",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#020617] text-white min-h-screen antialiased">
        
        {/* NAVBAR - Client Component qui gère l'état */}
        <Navbar />

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
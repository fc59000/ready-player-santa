import "./globals.css";
import "./styles/cyberpunk.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Ready Player Santa",
  description: "Jeu Secret Santa 2025",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {/* NAVBAR - Client Component qui gère l'état */}
        <Navbar />

        {/* CONTENT */}
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
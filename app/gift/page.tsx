/** READY PLAYER SANTA™ – GIFT PAGE AAA ULTIMATE WITH BRIEFING **/
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";

export default function GiftPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shellVisible, setShellVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [existingGift, setExistingGift] = useState<any>(null);
  const [error, setError] = useState("");

  // Briefing popup
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefingText, setBriefingText] = useState("");
  const [briefingComplete, setBriefingComplete] = useState(false);

  const fullBriefing = `▸ BRIEFING MISSION : DÉPÔT D'ARTEFACT

Joueur, ton cadeau est bien plus qu'un présent.
C'est un trésor qui sera convoité.

Le jour J, ton image et ta description s'afficheront
sur le grand écran devant tous les joueurs.

Ceux qui le désirent entreront en confrontation.
Plus tu seras original, intrigant, mystérieux,
plus nombreux seront ceux qui voudront le remporter.
Plus la bataille sera épique.

RECOMMANDATIONS TACTIQUES :

→ NE RÉVÈLE PAS ton cadeau directement
→ ÉVOQUE-LE, fais-le deviner, crée le mystère
→ FORMAT IMAGE : Paysage (horizontal) recommandé

EXEMPLE CONCRET :

Cadeau réel : Un livre de science-fiction

❌ À ÉVITER :
Titre : "Livre Foundation d'Asimov"
→ Trop direct, aucun mystère

✓ APPROCHE GAGNANTE :
Titre : "L'Artefact des Empires Oubliés"
Description : "Un portail vers des mondes lointains où 
les civilisations s'effondrent et renaissent. 
Pour ceux qui rêvent de galaxies et de prophéties."
Image : Galaxie, étoiles, ou livre avec éclairage mystérieux

La créativité est ton arme.
L'originalité est ton atout.

Que le meilleur gagne.

– Santa`;

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.push("/login");
      setUser(data.user);

      const { data: gift } = await supabase
        .from("gifts")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (gift) {
        setExistingGift(gift);
        setTitle(gift.title || "");
        setDescription(gift.description || "");
        setImagePreview(gift.image_url || null);
      }

      setLoading(false);
      setTimeout(() => setShellVisible(true), 300);

      // Ne plus afficher automatiquement le briefing
      // L'utilisateur cliquera sur le bouton "CONSIGNES & AIDE" s'il veut le voir
    }
    load();
  }, [router]);

  function startBriefingTyping() {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullBriefing.length) {
        setBriefingText(fullBriefing.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
        setBriefingComplete(true);
      }
    }, 15);
  }

  function closeBriefing(dontShowAgain: boolean) {
    if (dontShowAgain) {
      localStorage.setItem("gift_briefing_seen", "true");
    }
    setShowBriefing(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;
    if (!title.trim() || !description.trim()) {
      setError("Le titre et la description sont obligatoires.");
      return;
    }

    setSaving(true);
    setError("");

    let image_url = existingGift?.image_url || "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const path = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gifts")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("Erreur lors de l'upload de l'image : " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("gifts")
        .getPublicUrl(path);

      image_url = publicUrl.publicUrl;
    }

    const payload = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      image_url,
    };

    const { error: saveError } = existingGift
      ? await supabase.from("gifts").update(payload).eq("id", existingGift.id)
      : await supabase.from("gifts").insert([payload]);

    if (saveError) {
      console.error("Save error:", saveError);
      setError("Erreur lors de la sauvegarde : " + saveError.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <>
        <Particles />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[var(--bg-dark)] to-[var(--bg-deep)]">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">🎁</div>
            <div className="hud-title" style={{ marginBottom: "var(--spacing-sm)" }}>
              CHARGEMENT MODULE CADEAU
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".85rem",
                color: "var(--muted)",
                letterSpacing: ".15em",
              }}
            >
              Préparation du dépôt...
            </div>
            <div className="mt-8 flex justify-center">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-[var(--success)] rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Particles />

      {/* ========== BRIEFING POPUP ========== */}
      {showBriefing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(2,6,23,.95)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--spacing-lg)",
            animation: "fadeIn .4s ease-out",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && briefingComplete) {
              closeBriefing(false);
            }
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              width: "100%",
              background: "radial-gradient(circle at top, rgba(125,211,252,.08), transparent 60%), rgba(15,23,42,.95)",
              border: "1px solid rgba(125,211,252,.3)",
              borderRadius: "20px",
              padding: "var(--spacing-xxl) var(--spacing-xl)",
              boxShadow: "0 0 60px rgba(125,211,252,.2), inset 0 1px 0 rgba(255,255,255,.05)",
              animation: "fadeInUp .6s ease-out",
              position: "relative",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
              <div className="hud-title" style={{ marginBottom: "12px" }}>
                📡 TRANSMISSION SÉCURISÉE - SANTA
              </div>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "8px",
                }}
              >
                READY PLAYER SANTA™
              </h2>
              <p style={{ fontFamily: "var(--mono)", fontSize: ".85rem", color: "var(--muted)" }}>
                Mission · Dépôt d'artefact
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "linear-gradient(to right, transparent, var(--primary), transparent)",
                marginBottom: "var(--spacing-xl)",
              }}
            />

            {/* Briefing Text */}
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: ".92rem",
                color: "var(--text)",
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
                marginBottom: "var(--spacing-xl)",
                minHeight: "400px",
                paddingLeft: "var(--spacing-lg)",
                paddingRight: "var(--spacing-lg)",
              }}
            >
              {briefingText}
              {briefingText.length < fullBriefing.length && (
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "1rem",
                    background: "var(--primary)",
                    marginLeft: "4px",
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                />
              )}
            </div>

            {/* Buttons */}
            {briefingComplete && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  animation: "fadeIn .4s ease-out",
                }}
              >
                <button
                  onClick={() => setShowBriefing(false)}
                  className="cyberpunk-btn"
                  style={{ minWidth: "250px" }}
                >
                  ✓ FERMER
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== MAIN CONTENT ========== */}
      <div
        style={{
          maxWidth: "800px",
          margin: "60px auto 80px",
          padding: "0 var(--spacing-lg)",
          opacity: shellVisible ? 1 : 0,
          transform: shellVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity .7s ease-out, transform .7s ease-out",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ========== HEADER ========== */}
        <div className="fade-in-up" style={{ animationDelay: ".2s", textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
          <div className="hud-title" style={{ marginBottom: "12px" }}>
            {existingGift ? "MODULE MODIFICATION // SANTA OS" : "MODULE DÉPÔT // SANTA OS"}
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "16px",
              textShadow: "0 0 30px rgba(34,197,94,.3)",
            }}
          >
            {existingGift ? "Modifier mon cadeau 🎁" : "Déposer mon cadeau 🎁"}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--muted)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            {existingGift
              ? "Tu peux modifier ton cadeau jusqu'au jour J"
              : "Ajoute ton cadeau au Secret Santa"}
          </p>
        </div>

        {/* ========== BRIEFING BUTTON ========== */}
        <div className="fade-in-up" style={{ animationDelay: ".3s", textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          <button
            onClick={() => {
              setShowBriefing(true);
              setBriefingText("");
              setBriefingComplete(false);
              startBriefingTyping();
            }}
            style={{
              fontFamily: "var(--mono)",
              fontSize: ".85rem",
              letterSpacing: ".12em",
              padding: "14px 28px",
              borderRadius: "12px",
              background: "rgba(125,211,252,.12)",
              border: "2px solid rgba(125,211,252,.4)",
              color: "var(--primary)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(125,211,252,.2)";
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(125,211,252,.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(125,211,252,.12)";
              e.currentTarget.style.borderColor = "rgba(125,211,252,.4)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>📡</span>
            CONSIGNES & AIDE
          </button>
        </div>

        {/* ========== ERROR MESSAGE ========== */}
        {error && (
          <div
            className="fade-in-up"
            style={{
              animationDelay: ".4s",
              padding: "var(--spacing-md)",
              borderRadius: "14px",
              background: "rgba(239,68,68,.15)",
              border: "1px solid rgba(239,68,68,.4)",
              color: "rgba(252,165,165,.9)",
              marginBottom: "var(--spacing-xl)",
              textAlign: "center",
              fontFamily: "var(--mono)",
              fontSize: ".85rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ========== FORM PANEL ========== */}
        <form
          onSubmit={handleSubmit}
          className="cyberpunk-panel fade-in-up"
          style={{ animationDelay: ".5s" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xl)" }}>
            {/* Title */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--mono)",
                  fontSize: ".85rem",
                  letterSpacing: ".12em",
                  color: "var(--text)",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                TITRE DU CADEAU * <span style={{ color: "var(--muted-dark)", fontSize: ".75rem" }}>(Mystérieux, évocateur)</span>
              </label>
              <input
                type="text"
                style={{
                  width: "100%",
                  background: "rgba(9,9,11,.9)",
                  border: "1px solid rgba(148,163,184,.3)",
                  color: "var(--text)",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  transition: "all var(--transition-fast)",
                }}
                placeholder="Ex: L'Artefact des Empires Oubliés"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(125,211,252,.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(148,163,184,.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".72rem",
                  color: "var(--muted-dark)",
                  marginTop: "8px",
                }}
              >
                {title.length}/100 caractères
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--mono)",
                  fontSize: ".85rem",
                  letterSpacing: ".12em",
                  color: "var(--text)",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                DESCRIPTION * <span style={{ color: "var(--muted-dark)", fontSize: ".75rem" }}>(Crée le désir sans révéler)</span>
              </label>
              <textarea
                style={{
                  width: "100%",
                  background: "rgba(9,9,11,.9)",
                  border: "1px solid rgba(148,163,184,.3)",
                  color: "var(--text)",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  resize: "none",
                  transition: "all var(--transition-fast)",
                }}
                rows={5}
                placeholder="Ex: Un portail vers des mondes lointains où les civilisations s'effondrent et renaissent. Pour ceux qui rêvent de galaxies..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(125,211,252,.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(148,163,184,.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".72rem",
                  color: "var(--muted-dark)",
                  marginTop: "8px",
                }}
              >
                {description.length}/500 caractères
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--mono)",
                  fontSize: ".85rem",
                  letterSpacing: ".12em",
                  color: "var(--text)",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                PHOTO (optionnelle) <span style={{ color: "var(--muted-dark)", fontSize: ".75rem" }}>(Format paysage recommandé)</span>
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageChange}
                style={{
                  width: "100%",
                  background: "rgba(9,9,11,.9)",
                  border: "1px solid rgba(148,163,184,.3)",
                  color: "var(--muted)",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  fontSize: ".9rem",
                  cursor: "pointer",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: ".72rem",
                  color: "var(--muted-dark)",
                  marginTop: "8px",
                }}
              >
                💡 Formats : PNG, JPG, WEBP · Max 5MB · Paysage horizontal recommandé
              </p>
            </div>

            {/* Image Previews */}
            {imagePreview && (
              <div>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: ".85rem",
                    color: "var(--muted)",
                    marginBottom: "16px",
                    fontWeight: 600,
                  }}
                >
                  {imageFile ? "APERÇU NOUVELLE IMAGE" : "IMAGE ACTUELLE"}
                </p>

                {/* Preview normale */}
                <div style={{ marginBottom: "var(--spacing-lg)" }}>
                  <p style={{ fontSize: ".8rem", color: "var(--muted-dark)", marginBottom: "8px" }}>
                    📱 Aperçu normal :
                  </p>
                  <div style={{ position: "relative" }}>
                    <img
                      src={imagePreview}
                      style={{
                        width: "100%",
                        borderRadius: "16px",
                        border: "2px solid rgba(148,163,184,.3)",
                        boxShadow: "0 8px 30px rgba(0,0,0,.3)",
                        objectFit: "cover",
                        maxHeight: "400px",
                      }}
                      alt="Aperçu normal"
                    />
                    {imageFile && (
                      <div
                        style={{
                          position: "absolute",
                          top: "16px",
                          right: "16px",
                          background: "var(--success)",
                          color: "#fff",
                          fontSize: ".75rem",
                          fontWeight: 700,
                          padding: "8px 16px",
                          borderRadius: "20px",
                          boxShadow: "0 4px 12px rgba(34,197,94,.4)",
                        }}
                      >
                        ✓ NOUVELLE IMAGE
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Jour J (16:9) */}
                <div>
                  <p style={{ fontSize: ".8rem", color: "var(--muted-dark)", marginBottom: "8px" }}>
                    🖥️ Aperçu tel qu'affiché le Jour J (format écran 16:9) :
                  </p>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      background: "#000",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "2px solid rgba(125,211,252,.4)",
                      boxShadow: "0 0 20px rgba(125,211,252,.2)",
                    }}
                  >
                    <img
                      src={imagePreview}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                      alt="Aperçu Jour J"
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: ".72rem",
                      color: "var(--primary)",
                      marginTop: "8px",
                      textAlign: "center",
                    }}
                  >
                    👆 C'est ainsi que ton cadeau sera affiché sur le grand écran
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="cyberpunk-btn"
              style={{
                width: "100%",
                padding: "18px",
                fontSize: "1.1rem",
                background: saving
                  ? "rgba(63,63,70,.5)"
                  : "linear-gradient(135deg, var(--success), #10b981)",
                border: saving ? "2px solid rgba(82,82,91,.5)" : "2px solid var(--success)",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <>
                  <span className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></span>
                  SAUVEGARDE EN COURS...
                </>
              ) : existingGift ? (
                "💾 METTRE À JOUR LE CADEAU"
              ) : (
                "🎁 DÉPOSER MON CADEAU"
              )}
            </button>
          </div>
        </form>

        {/* ========== BACK BUTTON ========== */}
        <div className="fade-in-up" style={{ animationDelay: ".6s", textAlign: "center", marginTop: "var(--spacing-xl)" }}>
          <button onClick={() => router.push("/dashboard")} className="cyberpunk-btn">
            ← RETOUR AU DASHBOARD
          </button>
        </div>
      </div>
    </>
  );
}
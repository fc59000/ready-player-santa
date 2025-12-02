"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function GiftPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [existingGift, setExistingGift] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.push("/login");
      setUser(data.user);

      // Charger le cadeau existant
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
    }
    load();
  }, [router]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    // Créer une preview
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

    // Upload de l'image si nouvelle image
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

    // Sauvegarder en base
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

    // Rediriger vers le dashboard
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white text-2xl">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#7dd3fc",
              marginBottom: "12px",
              textShadow: "0 0 20px rgba(125, 211, 252, 0.4)",
            }}
          >
            {existingGift ? "MODIFICATION CADEAU" : "DÉPÔT CADEAU"}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {existingGift ? "Modifier mon cadeau 🎁" : "Déposer mon cadeau 🎁"}
          </h1>
          <p className="text-base text-zinc-400">
            {existingGift
              ? "Tu peux modifier ton cadeau jusqu'au jour J"
              : "Ajoute ton cadeau au Secret Santa"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0f172a] border border-zinc-700/50 p-6 rounded-2xl flex flex-col gap-6"
        >
          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Titre du cadeau *
            </label>
            <input
              type="text"
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#7dd3fc] transition"
              placeholder="Ex: Livre de science-fiction"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-zinc-500 mt-1">{title.length}/100 caractères</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Description *
            </label>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#7dd3fc] transition resize-none"
              rows={5}
              placeholder="Décris ton cadeau en quelques mots..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-zinc-500 mt-1">{description.length}/500 caractères</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Photo du cadeau (optionnelle)
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageChange}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-400 px-4 py-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#7dd3fc] file:text-zinc-900 file:font-semibold file:cursor-pointer hover:file:bg-[#38bdf8] transition"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Formats acceptés : PNG, JPG, WEBP (max 5MB)
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div>
              <p className="text-sm text-zinc-400 mb-3 font-semibold">
                {imageFile ? "Aperçu de la nouvelle image :" : "Image actuelle :"}
              </p>
              <div className="relative">
                <img
                  src={imagePreview}
                  className="w-full rounded-xl border-2 border-zinc-700 shadow-lg object-cover max-h-96"
                  alt="Aperçu du cadeau"
                />
                {imageFile && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    ✓ Nouvelle image
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              saving
                ? "bg-zinc-700 text-zinc-400 cursor-wait"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/30"
            }`}
          >
            {saving ? "⏳ Sauvegarde en cours..." : existingGift ? "💾 Mettre à jour" : "🎁 Déposer mon cadeau"}
          </button>
        </form>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-[#0f172a] border border-zinc-700 text-zinc-300 rounded-xl hover:border-[#7dd3fc] hover:text-white transition-all"
          >
            ← Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
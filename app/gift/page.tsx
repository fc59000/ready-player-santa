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

  const [existingGift, setExistingGift] = useState<any>(null);

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
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    let image_url = existingGift?.image_url || "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const path = `${user.id}/gift.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("gifts")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        alert("Erreur upload image : " + uploadError.message);
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
      title,
      description,
      image_url,
    };

    const { error: saveError } = existingGift
      ? await supabase.from("gifts").update(payload).eq("id", existingGift.id)
      : await supabase.from("gifts").insert(payload);

    if (saveError) {
      alert("Erreur lors de la sauvegarde : " + saveError.message);
      setSaving(false);
      return;
    }

    alert("🎁 Ton cadeau a bien été enregistré !");
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
          <h1 className="text-3xl font-bold text-white mb-2">
            🎁 Mon cadeau
          </h1>
          <p className="text-base text-zinc-400">
            {existingGift
              ? "Modifie ton cadeau pour le Secret Santa"
              : "Ajoute ton cadeau pour le Secret Santa"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0f172a] border border-zinc-700/50 p-6 rounded-2xl flex flex-col gap-6"
        >
          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Titre du cadeau
            </label>
            <input
              type="text"
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#7dd3fc] transition"
              placeholder="Ex: Livre de science-fiction"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Description
            </label>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#7dd3fc] transition resize-none"
              rows={4}
              placeholder="Décris ton cadeau..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Image (optionnelle)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-400 px-4 py-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#7dd3fc] file:text-zinc-900 file:font-semibold file:cursor-pointer hover:file:bg-[#38bdf8] transition"
            />
          </div>

          {/* Current Image Preview */}
          {existingGift?.image_url && (
            <div>
              <p className="text-sm text-zinc-400 mb-3">Image actuelle :</p>
              <img
                src={existingGift.image_url}
                className="w-full rounded-xl border border-zinc-700 shadow-lg"
                alt="Cadeau actuel"
              />
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
            {saving ? "Sauvegarde en cours..." : "Sauvegarder 🎄"}
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
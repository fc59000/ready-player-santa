"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function GiftPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [existingGift, setExistingGift] = useState<any>(null);

  useEffect(() => {
    async function load() {
      // Vérifier user
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.push("/login");
      setUser(data.user);

      // Charger cadeau existant
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

    let image_url = existingGift?.image_url || "";

    // 1) S'il y a une nouvelle image → upload dans Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const path = `${user.id}/gift.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("gifts")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        alert("Erreur upload image : " + uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("gifts")
        .getPublicUrl(path);

      image_url = publicUrl.publicUrl;
    }

    // 2) Sauvegarde dans la table gifts
    const payload = {
      user_id: user.id,
      title,
      description,
      image_url,
    };

    // Si un cadeau existait, update — sinon insert
    const { error: saveError } = existingGift
      ? await supabase.from("gifts").update(payload).eq("id", existingGift.id)
      : await supabase.from("gifts").insert(payload);

    if (saveError) {
      alert("Erreur lors de la sauvegarde : " + saveError.message);
      return;
    }

    alert("🎁 Ton cadeau a bien été enregistré !");
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🎁 Mon cadeau</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md max-w-md w-full flex flex-col gap-4"
      >
        <label className="font-semibold">Titre du cadeau</label>
        <input
          className="border px-3 py-2 rounded"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="font-semibold">Description</label>
        <textarea
          className="border px-3 py-2 rounded"
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="font-semibold">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        {existingGift?.image_url && (
          <div className="mt-4">
            <p className="text-sm text-zinc-600 mb-2">Image actuelle :</p>
            <img
              src={existingGift.image_url}
              className="w-full rounded shadow"
              alt="Cadeau"
            />
          </div>
        )}

        <button type="submit" className="btn-primary mt-4">
          Sauvegarder 🎄
        </button>
      </form>

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-6 underline text-zinc-700"
      >
        ← Retour au dashboard
      </button>
    </div>
  );
}

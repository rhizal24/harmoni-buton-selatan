"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { VillageRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

interface ProfilForm {
  short_description: string;
  about: string; // paragraf dipisah baris kosong
  history: string; // paragraf dipisah baris kosong
  vision: string;
  missions: string; // satu misi per baris
  logo_url: string;
  cover_image_url: string;
  map_embed_url: string;
}

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#31577F] focus:ring-2 focus:ring-[#31577F]/20";
const areaCls =
  "w-full rounded-md border border-[#D0D0D0] px-3 py-2 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#31577F] focus:ring-2 focus:ring-[#31577F]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";
const hintCls = "font-body text-xs text-[#5A5A5A]";

/**
 * Profil Desa, edit konten halaman /profil: tentang, sejarah (jejak desa),
 * visi & misi, plus logo/cover desa. Disimpan ke baris `villages` desa ini.
 */
export default function AdminProfilPage() {
  const admin = useAdmin();
  const [form, setForm] = useState<ProfilForm | null>(null);
  const [savedMedia, setSavedMedia] = useState({ logo: "", cover: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("villages")
      .select("*")
      .eq("id", admin.village.id)
      .maybeSingle();
    if (error || !data) {
      setMsg({ kind: "err", text: `Gagal memuat profil: ${error?.message ?? "kosong"}` });
      return;
    }
    const v = data as VillageRow;
    setForm({
      short_description: v.short_description ?? "",
      about: v.about ?? "",
      history: v.history ?? "",
      vision: v.vision ?? "",
      missions: (v.missions ?? []).join("\n"),
      logo_url: v.logo_url ?? "",
      cover_image_url: v.cover_image_url ?? "",
      map_embed_url: v.map_embed_url ?? "",
    });
    setSavedMedia({ logo: v.logo_url ?? "", cover: v.cover_image_url ?? "" });
  }, [admin.village.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase()
        .from("villages")
        .update({
          short_description: form.short_description.trim() || null,
          about: form.about.trim() || null,
          history: form.history.trim() || null,
          vision: form.vision.trim() || null,
          missions: form.missions
            .split("\n")
            .map((m) => m.trim())
            .filter(Boolean),
          logo_url: form.logo_url || null,
          cover_image_url: form.cover_image_url || null,
          map_embed_url: form.map_embed_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", admin.village.id);
      if (error) throw new Error(error.message);
      if (savedMedia.logo && savedMedia.logo !== form.logo_url) {
        void deleteUploadedFile(savedMedia.logo, admin.accessToken);
      }
      if (savedMedia.cover && savedMedia.cover !== form.cover_image_url) {
        void deleteUploadedFile(savedMedia.cover, admin.accessToken);
      }
      setSavedMedia({ logo: form.logo_url, cover: form.cover_image_url });
      setMsg({ kind: "ok", text: "Profil desa disimpan." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(file: File, field: "logo_url" | "cover_image_url") {
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken);
      setForm((f) => (f ? { ...f, [field]: url } : f));
      setMsg({ kind: "ok", text: "Foto ter-upload. Jangan lupa klik Simpan." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload gagal." });
    } finally {
      setBusy(false);
    }
  }

  if (!form) {
    return <p className="font-body text-sm text-[#5A5A5A]">Memuat profil…</p>;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Profil Desa</h1>
        <p className="mt-1 font-body text-sm text-[#5A5A5A]">
          Konten halaman /profil: tentang desa, jejak desa, visi &amp; misi.
        </p>
      </header>

      {msg && (
        <p
          role="status"
          className={`rounded-md border px-3 py-2 font-body text-sm ${
            msg.kind === "ok"
              ? "border-[#D9E4F1] bg-[#F2F6FB] text-[#1F3A59]"
              : "border-[#FFDAD6] bg-[#FFF4F3] text-[#93000A]"
          }`}
        >
          {msg.text}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-xl border border-[#D0D0D0] bg-white p-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Deskripsi singkat</span>
          <input
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            className={inputCls}
          />
          <span className={hintCls}>Satu kalimat pembuka tentang desa (untuk metadata).</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Tentang desa</span>
          <textarea
            rows={6}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            className={areaCls}
          />
          <span className={hintCls}>Pisahkan paragraf dengan satu baris kosong.</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Jejak desa (sejarah)</span>
          <textarea
            rows={6}
            value={form.history}
            onChange={(e) => setForm({ ...form, history: e.target.value })}
            className={areaCls}
          />
          <span className={hintCls}>Pisahkan paragraf dengan satu baris kosong.</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Visi</span>
          <textarea
            rows={2}
            value={form.vision}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
            className={areaCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Misi (satu per baris)</span>
          <textarea
            rows={5}
            value={form.missions}
            onChange={(e) => setForm({ ...form, missions: e.target.value })}
            className={areaCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Link embed peta (Google Maps)</span>
          <input
            type="url"
            placeholder="https://www.google.com/maps/embed?…"
            value={form.map_embed_url}
            onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })}
            className={inputCls}
          />
        </label>

        {/* Logo & cover */}
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              { field: "logo_url", label: "Logo desa" },
              { field: "cover_image_url", label: "Foto cover desa" },
            ] as const
          ).map(({ field, label }) => (
            <div key={field} className="flex flex-col gap-1.5">
              <span className={labelCls}>{label}</span>
              {form[field] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form[field]}
                  alt={label}
                  className={`w-full rounded-md border border-[#D0D0D0] object-cover ${
                    field === "logo_url" ? "aspect-square max-w-[120px]" : "aspect-video"
                  }`}
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file, field);
                  e.target.value = "";
                }}
                className="font-body text-sm text-[#5A5A5A] file:mr-3 file:rounded-md file:border file:border-[#31577F] file:bg-white file:px-3 file:py-1.5 file:font-body file:text-xs file:font-semibold file:text-[#31577F]"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="self-start rounded-md bg-[#31577F] px-6 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#27466A] disabled:opacity-60"
        >
          {busy ? "Menyimpan…" : "Simpan Profil"}
        </button>
      </form>
    </div>
  );
}

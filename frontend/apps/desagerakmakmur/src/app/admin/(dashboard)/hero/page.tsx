"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { VillageRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

type HeroField = "hero_beranda_url" | "hero_wisata_url" | "hero_profil_url";

const HERO_PAGES: { field: HeroField; label: string; halaman: string; default: string }[] = [
  {
    field: "hero_beranda_url",
    label: "Beranda",
    halaman: "/",
    default: "/images/hero-bg.jpg",
  },
  {
    field: "hero_wisata_url",
    label: "Wisata",
    halaman: "/wisata",
    default: "/images/wisata-pantai.jpg",
  },
  {
    field: "hero_profil_url",
    label: "Profil",
    halaman: "/profil",
    default: "/images/hero-bg.jpg",
  },
];

type HeroForm = Record<HeroField, string>;

/**
 * Hero Section — kelola foto latar hero tiap halaman publik (Beranda, Wisata,
 * Profil). Disimpan di kolom `villages.hero_*_url`; kosong berarti halaman
 * memakai foto default bawaan. Lihat docs/supabase-migration-hero.sql.
 */
export default function AdminHeroPage() {
  const admin = useAdmin();
  const [form, setForm] = useState<HeroForm | null>(null);
  const [saved, setSaved] = useState<HeroForm | null>(null);
  const [busyField, setBusyField] = useState<HeroField | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("villages")
      .select("hero_beranda_url, hero_wisata_url, hero_profil_url")
      .eq("id", admin.village.id)
      .maybeSingle();
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat hero: ${error.message}` });
      return;
    }
    const v = (data ?? {}) as Partial<VillageRow>;
    const next: HeroForm = {
      hero_beranda_url: v.hero_beranda_url ?? "",
      hero_wisata_url: v.hero_wisata_url ?? "",
      hero_profil_url: v.hero_profil_url ?? "",
    };
    setForm(next);
    setSaved(next);
  }, [admin.village.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(file: File, field: HeroField) {
    setBusyField(field);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken, { asli: true });
      setForm((f) => (f ? { ...f, [field]: url } : f));
      setMsg({ kind: "ok", text: "Foto ter-upload. Jangan lupa klik Simpan." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload gagal." });
    } finally {
      setBusyField(null);
    }
  }

  function handleReset(field: HeroField) {
    setForm((f) => (f ? { ...f, [field]: "" } : f));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setMsg(null);
    try {
      const { error } = await getSupabase()
        .from("villages")
        .update({
          hero_beranda_url: form.hero_beranda_url || null,
          hero_wisata_url: form.hero_wisata_url || null,
          hero_profil_url: form.hero_profil_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", admin.village.id);
      if (error) throw new Error(error.message);

      // Bersihkan file lama di ImageKit yang sudah tak terpakai.
      if (saved) {
        for (const { field } of HERO_PAGES) {
          if (saved[field] && saved[field] !== form[field]) {
            void deleteUploadedFile(saved[field], admin.accessToken);
          }
        }
      }
      setSaved(form);
      setMsg({ kind: "ok", text: "Foto hero disimpan. Tampil di situs maksimal 5 menit lagi." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return <p className="font-body text-sm text-muted-foreground">Memuat hero section…</p>;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <p className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
          {admin.village.name}
        </p>
        <h1 className="mt-1 font-body text-2xl font-bold tracking-tight text-[#006572]">
          Hero Section
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Ganti foto latar hero tiap halaman publik. Kosongkan untuk kembali ke foto default.
        </p>
      </header>

      {msg && (
        <p
          role="status"
          className={`rounded-md border px-3 py-2 font-body text-sm ${
            msg.kind === "ok"
              ? "border-primary-container bg-primary-container/40 text-on-primary-container"
              : "border-error-container bg-[#FFF4F3] text-on-error-container"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HERO_PAGES.map(({ field, label, halaman, default: defaultSrc }) => {
          const currentSrc = form[field] || defaultSrc;
          const isCustom = Boolean(form[field]);
          return (
            <div
              key={field}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-body text-sm font-semibold text-foreground">
                  {label}
                </span>
                <a
                  href={halaman}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-semibold text-[#006572] hover:underline"
                >
                  Lihat halaman ↗
                </a>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentSrc}
                alt={`Hero ${label}`}
                className="aspect-video w-full rounded-md border object-cover"
              />

              <span className="font-body text-xs text-muted-foreground">
                {isCustom ? "Foto kustom" : "Foto default bawaan"}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center rounded-md border-[1.5px] border-[#006572] px-4 py-2 font-body text-xs font-semibold text-[#006572] motion-safe:transition-colors hover:bg-[#006572]/5 ${
                    busyField === field ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {busyField === field ? "Mengunggah…" : "Ganti Foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={busyField !== null}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUpload(file, field);
                      e.target.value = "";
                    }}
                  />
                </label>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => handleReset(field)}
                    className="font-body text-xs font-semibold text-muted-foreground hover:text-destructive"
                  >
                    Pakai default
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || busyField !== null}
        className="self-start rounded-md bg-[#006572] px-6 py-2.5 font-body text-sm font-semibold text-white shadow-sm motion-safe:transition-[transform,filter] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:-translate-y-0.5 enabled:hover:[filter:drop-shadow(0_0_16px_rgba(0,101,114,0.55))_drop-shadow(0_0_44px_rgba(0,101,114,0.30))]"
      >
        {saving ? "Menyimpan…" : "Simpan Hero Section"}
      </button>
    </div>
  );
}

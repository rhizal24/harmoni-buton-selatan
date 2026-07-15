"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { VillageRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

type PetaField = "peta_wisata_url" | "peta_dusun_url";

const PETA_IMAGES: { field: PetaField; label: string; deskripsi: string }[] = [
  {
    field: "peta_wisata_url",
    label: "Peta Wisata Gerak Makmur",
    deskripsi: "Sebaran destinasi wisata unggulan dalam satu peta desa.",
  },
  {
    field: "peta_dusun_url",
    label: "Peta Batas Dusun",
    deskripsi: "Pembagian wilayah administratif tiap dusun di desa.",
  },
];

type PetaForm = Record<PetaField, string>;

/**
 * Peta — kelola 2 gambar peta statis di halaman /peta (Peta Wisata Gerak
 * Makmur & Peta Batas Dusun). Peta interaktif (WebGIS) di halaman publik
 * memakai koordinat dari menu "Wisata" (`tourism_spots.latitude/longitude`),
 * bukan gambar — jadi tidak dikelola di sini.
 * Disimpan di kolom `villages.peta_*_url` — lihat docs/supabase-migration-peta.sql.
 */
export default function AdminPetaPage() {
  const admin = useAdmin();
  const [form, setForm] = useState<PetaForm | null>(null);
  const [saved, setSaved] = useState<PetaForm | null>(null);
  const [busyField, setBusyField] = useState<PetaField | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("villages")
      .select("peta_wisata_url, peta_dusun_url")
      .eq("id", admin.village.id)
      .maybeSingle();
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat peta: ${error.message}` });
      return;
    }
    const v = (data ?? {}) as Partial<VillageRow>;
    const next: PetaForm = {
      peta_wisata_url: v.peta_wisata_url ?? "",
      peta_dusun_url: v.peta_dusun_url ?? "",
    };
    setForm(next);
    setSaved(next);
  }, [admin.village.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(file: File, field: PetaField) {
    setBusyField(field);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken);
      setForm((f) => (f ? { ...f, [field]: url } : f));
      setMsg({ kind: "ok", text: "Gambar ter-upload. Jangan lupa klik Simpan." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload gagal." });
    } finally {
      setBusyField(null);
    }
  }

  function handleReset(field: PetaField) {
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
          peta_wisata_url: form.peta_wisata_url || null,
          peta_dusun_url: form.peta_dusun_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", admin.village.id);
      if (error) throw new Error(error.message);

      if (saved) {
        for (const { field } of PETA_IMAGES) {
          if (saved[field] && saved[field] !== form[field]) {
            void deleteUploadedFile(saved[field], admin.accessToken);
          }
        }
      }
      setSaved(form);
      setMsg({ kind: "ok", text: "Peta disimpan. Tampil di situs maksimal 5 menit lagi." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return <p className="font-body text-sm text-muted-foreground">Memuat peta…</p>;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <p className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
          {admin.village.name}
        </p>
        <h1 className="mt-1 font-body text-2xl font-bold tracking-tight text-[#006572]">
          Peta
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Kelola 2 gambar peta statis di halaman /peta. Titik lokasi di peta
          interaktif diatur lewat menu{" "}
          <a href="/admin/wisata" className="font-semibold text-[#006572] hover:underline">
            Wisata
          </a>{" "}
          dan{" "}
          <a href="/admin/umkm" className="font-semibold text-[#006572] hover:underline">
            UMKM
          </a>{" "}
          (koordinat tiap titik).
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

      <div className="grid gap-5 sm:grid-cols-2">
        {PETA_IMAGES.map(({ field, label, deskripsi }) => {
          const isCustom = Boolean(form[field]);
          return (
            <div key={field} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
              <div>
                <p className="font-body text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 font-body text-xs text-muted-foreground">{deskripsi}</p>
              </div>

              {form[field] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form[field]}
                  alt={label}
                  className="aspect-[4/3] w-full rounded-md border object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border-[1.5px] border-dashed border-outline-variant bg-surface-container-low">
                  <p className="font-body text-xs text-muted-foreground">Belum diunggah</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center rounded-md border-[1.5px] border-[#006572] px-4 py-2 font-body text-xs font-semibold text-[#006572] motion-safe:transition-colors hover:bg-[#006572]/5 ${
                    busyField === field ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {busyField === field ? "Mengunggah…" : "Ganti Gambar"}
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
                    Hapus
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
        {saving ? "Menyimpan…" : "Simpan Peta"}
      </button>
    </div>
  );
}

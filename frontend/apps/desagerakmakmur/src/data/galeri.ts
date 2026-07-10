import { cache } from "react";
import { getGalleryImages } from "@/lib/desa";
import type { FotoGaleri } from "@/types/galeri";
import { GALERI_SEED } from "./seeds/galeri";

/**
 * Data-access Galeri (Lensa Lande) — ADAPTER.
 *
 * Sumber data: Supabase (`gallery_images`). Query memakai publishable key
 * (role anon) sehingga RLS otomatis menyaring hanya foto `approved` —
 * kiriman warga berstatus `pending` tidak pernah bocor ke publik (lihat
 * docs/supabase-migration-galeri-kiriman.sql).
 *
 * Fallback: bila tabel kosong atau Supabase tidak terjangkau, pakai seed
 * statis agar halaman tidak pernah tampil kosong/crash.
 */
export const getGaleri = cache(async (): Promise<FotoGaleri[]> => {
  try {
    const rows = await getGalleryImages();
    if (rows.length === 0) return GALERI_SEED;
    return rows.map((row) => ({
      src: row.image_url,
      alt: row.caption ?? "Foto galeri Desa Gerak Makmur",
    }));
  } catch {
    return GALERI_SEED;
  }
});

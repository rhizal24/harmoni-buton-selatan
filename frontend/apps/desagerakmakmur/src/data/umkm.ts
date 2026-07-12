import { cache } from "react";
import { getUmkmArticles } from "./articles";
import { truncate } from "@/lib/utils";
import type { Umkm } from "@/types/umkm";
import { UMKM_SEED } from "./seeds/umkm";

/** Fallback foto saat profil UMKM belum punya cover. */
const FALLBACK_FOTO = "/images/hero-bg.jpg";

/**
 * Data-access UMKM — LIVE dari Supabase: artikel kategori `umkm` (dikelola
 * dashboard `/admin/umkm`) dipetakan ke kartu UMKM. Bila tabel masih kosong
 * atau Supabase tak terjangkau, jatuh ke SEED placeholder agar section tidak
 * pernah tampil kosong (pola fallback yang sama dgn `lib/konten.ts`).
 */
export const getUmkm = cache(async (): Promise<Umkm[]> => {
  try {
    const articles = await getUmkmArticles();
    if (articles.length === 0) return UMKM_SEED;
    return articles.map((a) => ({
      nama: a.title,
      deskripsi: a.excerpt ?? truncate(a.content, 160),
      foto: a.coverImageUrl ?? FALLBACK_FOTO,
      slug: a.slug,
    }));
  } catch {
    return UMKM_SEED;
  }
});

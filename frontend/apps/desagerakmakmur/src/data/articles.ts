import { cache } from "react";
import {
  getPublishedArticles,
  getArticleBySlug as getRowBySlug,
} from "@/lib/desa";
import type { ArticleRow } from "@/lib/db-types";
import type { Article } from "@/types/article";
import { ARTIKEL_SEED } from "./seeds/articles";

/**
 * Data-access Artikel — LIVE dari Supabase (tabel `articles`, RLS hanya
 * meloloskan baris published). Satu tabel menampung dua jenis konten yang
 * dikelola dashboard admin: kategori `berita` (halaman Informasi § Berita)
 * dan `umkm` (profil usaha warga).
 *
 * Berita punya fallback SEED dummy selama tabel masih kosong / Supabase tak
 * terjangkau (pola `lib/konten.ts`) — otomatis tergantikan begitu admin
 * menerbitkan berita asli.
 *
 * Semua fungsi dibungkus `React.cache` → memoize per-request (satu render
 * tidak menjalankan query yang sama dua kali).
 */

/** Petakan baris Supabase (snake_case) → tipe aplikasi (camelCase). */
export function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    category: row.category,
    publishedAt: row.published_at ?? row.created_at,
  };
}

/** Berita terbit untuk desa ini, terbaru dulu; SEED bila belum ada. */
export const getArticles = cache(async (): Promise<Article[]> => {
  try {
    const rows = await getPublishedArticles();
    const berita = rows
      .filter((row) => row.category === "berita")
      .map(toArticle);
    return berita.length > 0 ? berita : ARTIKEL_SEED;
  } catch {
    return ARTIKEL_SEED;
  }
});

/** Artikel UMKM terbit (profil usaha warga), terbaru dulu. */
export const getUmkmArticles = cache(async (): Promise<Article[]> => {
  const rows = await getPublishedArticles();
  return rows.filter((row) => row.category === "umkm").map(toArticle);
});

/** Satu artikel terbit berdasarkan slug; cek SEED juga; `null` jika tidak ada. */
export const getArticleBySlug = cache(
  async (slug: string): Promise<Article | null> => {
    try {
      const row = await getRowBySlug(slug);
      if (row) return toArticle(row);
    } catch {
      /* Supabase tak terjangkau — coba seed di bawah */
    }
    return ARTIKEL_SEED.find((a) => a.slug === slug) ?? null;
  },
);

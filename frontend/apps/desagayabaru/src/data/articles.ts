import { cache } from "react";
import { apiFetch } from "@/lib/api/http";
import { VILLAGE, DEFAULT_REVALIDATE } from "@/lib/api/config";
import type { Article } from "@/types/article";

/**
 * Data-access Berita/Artikel, LIVE dari backend (tabel `articles`).
 *
 * Endpoint publik hanya mengembalikan artikel `published`, di-scope per desa:
 *   GET /villages/:village/articles          → { articles: ArticleRow[] }
 *   GET /villages/:village/articles/:slug     → { article: ArticleRow }
 *
 * Semua fungsi dibungkus `React.cache` → memoize per-request (satu render tidak
 * memanggil endpoint yang sama dua kali).
 */

/** Bentuk mentah baris dari API (snake_case, sesuai kolom Postgres). */
export interface ArticleRow {
  id: number;
  village: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published: boolean;
  author_id: number | null;
  created_at: string;
  updated_at: string;
}

/** Petakan baris API (snake_case) → tipe aplikasi (camelCase). */
export function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    village: row.village,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    published: row.published,
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Semua artikel terbit untuk desa ini, terbaru dulu. */
export const getArticles = cache(async (): Promise<Article[]> => {
  const { articles } = await apiFetch<{ articles: ArticleRow[] }>(
    `/villages/${VILLAGE}/articles`,
    { revalidate: DEFAULT_REVALIDATE },
  );
  return articles.map(toArticle);
});

/** Satu artikel terbit berdasarkan slug; `null` jika tidak ada. */
export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  try {
    const { article } = await apiFetch<{ article: ArticleRow }>(
      `/villages/${VILLAGE}/articles/${slug}`,
      { revalidate: DEFAULT_REVALIDATE },
    );
    return toArticle(article);
  } catch {
    return null;
  }
});

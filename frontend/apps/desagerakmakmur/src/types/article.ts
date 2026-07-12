import type { ArticleCategory } from "@/lib/db-types";

/**
 * Artikel (berita & profil UMKM) — tipe aplikasi (camelCase).
 *
 * Sumber data LIVE dari Supabase (tabel `articles`, dikelola dashboard
 * `/admin/berita` dan `/admin/umkm`). Bentuk mentah baris (snake_case,
 * `ArticleRow` di `@/lib/db-types`) dipetakan ke bentuk ini oleh
 * `toArticle` di `@/data/articles`.
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: ArticleCategory;
  /** Tanggal tayang untuk ditampilkan — `published_at`, fallback `created_at`. */
  publishedAt: string;
}

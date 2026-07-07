/**
 * Artikel / Berita — tipe aplikasi (camelCase).
 *
 * Sumber data LIVE dari backend (tabel `articles`). Bentuk mentah dari API
 * memakai snake_case (`ArticleRow` di `@/data/articles`) lalu dipetakan ke
 * bentuk ini oleh `toArticle`.
 */
export interface Article {
  id: number;
  village: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  published: boolean;
  authorId: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload untuk membuat/menyunting artikel dari dashboard admin. */
export interface ArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  slug?: string;
  published?: boolean;
}

/**
 * Layer mutasi ber-auth untuk dashboard admin (STUB).
 *
 * Endpoint CRUD backend sudah ada di `/admin/articles` dan butuh Bearer token
 * (lihat `backend/src/routes/article.routes.ts`). Modul ini menyiapkan pola
 * pemanggilannya; implementasi penuh menyusul bersama halaman `/admin` +
 * login + Server Actions (acuan: next docs 07-mutating-data).
 *
 * Dipakai dari Server Action / Route Handler, BUKAN Client Component, agar
 * token tidak bocor ke browser.
 */
import { apiFetch } from "./http";
import type { Article, ArticleInput } from "@/types/article";
import { toArticle, type ArticleRow } from "@/data/articles";

/** Login admin → kembalikan token JWT. */
export async function login(username: string, password: string): Promise<string> {
  const { token } = await apiFetch<{ token: string }>("/auth/login", {
    method: "POST",
    body: { username, password },
    revalidate: false,
  });
  return token;
}

/** Semua artikel milik desa admin (termasuk draft). */
export async function listMyArticles(token: string): Promise<Article[]> {
  const { articles } = await apiFetch<{ articles: ArticleRow[] }>("/admin/articles", {
    token,
    revalidate: false,
  });
  return articles.map(toArticle);
}

export async function createArticle(token: string, input: ArticleInput): Promise<Article> {
  const { article } = await apiFetch<{ article: ArticleRow }>("/admin/articles", {
    method: "POST",
    token,
    body: input,
    revalidate: false,
  });
  return toArticle(article);
}

export async function updateArticle(
  token: string,
  id: number,
  input: Partial<ArticleInput>,
): Promise<Article> {
  const { article } = await apiFetch<{ article: ArticleRow }>(`/admin/articles/${id}`, {
    method: "PUT",
    token,
    body: input,
    revalidate: false,
  });
  return toArticle(article);
}

export async function deleteArticle(token: string, id: number): Promise<void> {
  await apiFetch<void>(`/admin/articles/${id}`, {
    method: "DELETE",
    token,
    revalidate: false,
  });
}

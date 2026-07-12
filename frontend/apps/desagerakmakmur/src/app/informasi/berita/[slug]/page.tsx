import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/sections";
import { getArticleBySlug } from "@/data/articles";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

// ISR — artikel disegarkan tiap 5 menit.
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return { title: "Berita" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

/**
 * Detail Berita — Server Component, route dinamis `/informasi/berita/[slug]`.
 * Artikel tak ditemukan (atau backend mati) → `notFound()`. Konten artikel
 * berupa teks polos; dirender per-paragraf (dipisah baris kosong) dengan
 * lebar baca 720px sesuai `reading-max-width` design system.
 */
export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const paragraf = article.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main>
      <article className="bg-white px-5 pb-16 pt-36 sm:px-8 lg:pb-24 lg:pt-40">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          <Link
            href="/informasi"
            className="self-start font-body text-sm font-semibold text-[#006572] no-underline hover:underline"
          >
            <span aria-hidden>←</span> Kembali ke Informasi
          </Link>

          <header className="flex flex-col gap-3">
            <time
              dateTime={article.publishedAt}
              className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant"
            >
              {formatDate(article.publishedAt)}
            </time>
            <h1 className="font-body text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-tight text-[#006572]">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="font-body text-lg leading-relaxed text-on-surface-variant">
                {article.excerpt}
              </p>
            )}
          </header>

          {article.coverImageUrl && (
            <div className="group overflow-hidden rounded-xl border-[1.5px] border-[#006572]">
              <img
                src={article.coverImageUrl}
                alt=""
                className="aspect-video w-full object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex flex-col gap-4">
            {paragraf.map((p, i) => (
              <p
                key={i}
                className="font-body text-base leading-relaxed text-on-surface"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}

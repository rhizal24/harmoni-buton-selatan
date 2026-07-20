import type { MetadataRoute } from "next";
import { getArticles } from "@/data/articles";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gayabaru.caheabusel.com";

/**
 * Sitemap XML (`/sitemap.xml`), diperiksa Google Search Console supaya
 * seluruh halaman publik (termasuk artikel berita yang jumlahnya bertambah
 * dari admin) ditemukan dan diindeks, bukan cuma beranda.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const halamanStatis: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/wisata`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/informasi`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/profil`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/galeri`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/peta`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const artikel = await getArticles().catch(() => []);
  const halamanArtikel: MetadataRoute.Sitemap = artikel.map((a) => ({
    url: `${SITE_URL}/informasi/berita/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...halamanStatis, ...halamanArtikel];
}

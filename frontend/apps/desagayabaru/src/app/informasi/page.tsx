import type { Metadata } from "next";
import { Footer } from "@/components/sections";
import { BeritaTerkini } from "./_components/BeritaTerkini";
import { getArticles } from "@/data/articles";

export const metadata: Metadata = {
  title: "Informasi",
  description:
    "Berita terkini Desa Gaya Baru, Buton Selatan, kabar kegiatan dan perkembangan desa dalam satu halaman.",
};

/**
 * Halaman Informasi, Server Component (App Router). Berita Terkini dari
 * tabel Supabase `articles` kategori `berita` (dikelola dashboard admin).
 * Section route-spesifik dicolocate di `./_components`; Navbar sudah
 * dirender di root layout.
 */
// ISR, konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function InformasiPage() {
  // Berita tidak boleh merobohkan halaman saat Supabase tak terjangkau -
  // fallback [] → BeritaTerkini menampilkan pesan kosong yang ramah.
  const articles = await getArticles().catch(() => []);

  return (
    <main>
      {/* Tanpa hero, header editorial BeritaTerkini jadi pembuka halaman
          (pola Galeri) agar konten langsung terlihat tanpa scroll ekstra. */}
      <BeritaTerkini articles={articles} />
      <Footer />
    </main>
  );
}

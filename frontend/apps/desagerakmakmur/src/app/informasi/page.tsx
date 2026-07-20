import type { Metadata } from "next";
import { Footer } from "@/components/sections";
import { BeritaTerkini } from "./_components/BeritaTerkini";
import { UmkmDesa } from "./_components/UmkmDesa";
import { getArticles } from "@/data/articles";
import { getUmkm } from "@/data/umkm";

export const metadata: Metadata = {
  title: "Berita & UMKM Desa",
  description:
    "Berita terkini dan UMKM Desa Gerak Makmur, Buton Selatan — kabar kegiatan desa dan usaha warga dalam satu halaman.",
};

/**
 * Halaman Informasi — Server Component (App Router). Gabungan dua konten
 * dari tabel Supabase `articles` (dikelola dashboard admin): Berita Terkini
 * (kategori `berita`) dan sorotan UMKM (kategori `umkm`, fallback seed saat
 * kosong). Section route-spesifik dicolocate di `./_components`; Navbar
 * sudah dirender di root layout.
 */
// ISR — konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function InformasiPage() {
  // Berita tidak boleh merobohkan halaman saat Supabase tak terjangkau —
  // fallback [] → BeritaTerkini menampilkan pesan kosong yang ramah.
  const [articles, umkm] = await Promise.all([
    getArticles().catch(() => []),
    getUmkm(),
  ]);

  return (
    <main>
      {/* Tanpa hero — header editorial BeritaTerkini jadi pembuka halaman
          (pola Galeri) agar konten langsung terlihat tanpa scroll ekstra. */}
      <BeritaTerkini articles={articles} umkm={umkm} />
      <UmkmDesa umkm={umkm} />
      <Footer />
    </main>
  );
}

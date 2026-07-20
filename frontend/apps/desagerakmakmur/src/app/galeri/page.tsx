import type { Metadata } from "next";
import { Footer } from "@/components/sections";
import { GaleriHero } from "./_components/GaleriHero";
import { GaleriMasonry } from "./_components/GaleriMasonry";
import { GaleriOutro } from "./_components/GaleriOutro";
import { getGaleri } from "@/data/galeri";

export const metadata: Metadata = {
  title: "Galeri Foto Desa",
  description:
    "Galeri foto alam, budaya, dan kehidupan masyarakat Desa Gerak Makmur, Buton Selatan.",
};

/**
 * Halaman Galeri — Server Component (App Router). Tanpa hero: langsung
 * masuk ke galeri masonry. Section route-spesifik dicolocate di
 * `./_components`; Footer dari `@/components/sections`. Navbar sudah
 * dirender di root layout, jadi tidak diulang di sini.
 *
 * Data ditarik lewat layer `@/data/galeri` (masih SEED — adapter diganti
 * fetch Supabase saat endpoint galeri tersedia).
 */
// ISR — konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function GaleriPage() {
  const galeri = await getGaleri();

  return (
    <main>
      <GaleriHero />
      {/* Header grid dimatikan — judul halaman sudah dibawa GaleriHero. */}
      <GaleriMasonry data={galeri} header={false} />
      <GaleriOutro />
      <Footer />
    </main>
  );
}

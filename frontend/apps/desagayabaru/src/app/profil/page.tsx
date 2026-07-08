import type { Metadata } from "next";
import { Footer } from "@/components/sections";
import { HeroProfil } from "./_components/HeroProfil";
import { TentangDesa } from "./_components/TentangDesa";
import { SejarahDesa } from "./_components/SejarahDesa";
import { VisiMisi } from "./_components/VisiMisi";
import { StatistikDesa } from "./_components/StatistikDesa";
import { StrukturOrganisasi } from "./_components/StrukturOrganisasi";
import { DokumenDesa } from "./_components/DokumenDesa";
import { getStruktur, getDokumen } from "@/data/profil";

export const metadata: Metadata = {
  title: "Profil",
  description:
    "Sejarah, visi-misi, statistik, dan perangkat Desa Gaya Baru, Buton Selatan.",
};

/**
 * Halaman Profil — Server Component (App Router). Section route-spesifik
 * dicolocate di `./_components`, datanya di `./_data`. Footer diambil dari
 * `@/components/sections`; Navbar sudah dirender di root layout.
 *
 * Data ditarik lewat layer `@/data/profil`. Komponen server (Sejarah, VisiMisi,
 * Statistik) memuat datanya sendiri; komponen client (Struktur, Dokumen)
 * menerima data sebagai props dari page ini.
 *
 * CATATAN: konten Sejarah/VisiMisi/Statistik masih PLACEHOLDER (seed di
 * `./_data/*`) sampai endpoint backend-nya tersedia.
 */
// ISR — konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function ProfilPage() {
  const [struktur, dokumen] = await Promise.all([getStruktur(), getDokumen()]);

  return (
    <main>
      <HeroProfil />
      <TentangDesa />
      <SejarahDesa />
      <VisiMisi />
      <StatistikDesa />
      <StrukturOrganisasi data={struktur} />
      <DokumenDesa data={dokumen} />
      <Footer />
    </main>
  );
}

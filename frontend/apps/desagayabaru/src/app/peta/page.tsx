import type { Metadata } from "next";
import { Footer } from "@/components/sections";
import { PetaHero } from "./_components/PetaHero";
import { PetaWebGIS } from "./_components/PetaWebGIS";
import { GambarPeta } from "./_components/GambarPeta";
import { getWisata } from "@/data/wisata";
import { getVillage } from "@/lib/desa";

export const metadata: Metadata = {
  title: "Peta",
  description:
    "Peta interaktif dan infografis wilayah Desa Gaya Baru, Buton Selatan, sebaran wisata dan batas dusun.",
};

/**
 * Halaman Peta, Server Component (App Router). Peta interaktif (WebGIS,
 * Leaflet) dipisah ke Client Component `_components/PetaWebGIS` karena
 * Leaflet butuh `window`. Section route-spesifik dicolocate di
 * `./_components`; Navbar sudah dirender di root layout.
 */
// ISR, konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function PetaPage() {
  const [wisata, village] = await Promise.all([
    getWisata(),
    getVillage().catch(() => null),
  ]);

  return (
    <main>
      <PetaHero />
      <PetaWebGIS wisata={wisata} />
      <GambarPeta
        petaWisataUrl={village?.peta_wisata_url}
        petaDusunUrl={village?.peta_dusun_url}
      />
      <Footer />
    </main>
  );
}

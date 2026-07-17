import type { Metadata } from "next";
import {
  HeroBeranda,
  WisataUnggulan,
  JelajahDesa,
  LensaLande,
  MitraKolaborasi,
  Footer,
} from "@/components/sections";
import { getWisata } from "@/data/wisata";
import { fetchGaleri, fetchPaket } from "@/lib/konten";
import { getVillage } from "@/lib/desa";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Selamat datang di website resmi Desa Gerak Makmur, Buton Selatan — jelajahi Karamba, wisata bahari unggulan.",
};

/**
 * Homepage — Server Component (default di Next.js App Router).
 * Section disusun sesuai design system: hero → jelajah desa → lensa lande →
 * mitra kolaborasi → footer. Semua styling pakai Tailwind utilities.
 * Data wisata ditarik dari `@/data/wisata` (sumber sama dgn halaman /wisata,
 * kini Supabase dgn fallback seed statis) dan diteruskan sebagai props.
 */
// ISR — konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function HomePage() {
  const [wisata, paket, galeri, village] = await Promise.all([
    getWisata(),
    fetchPaket(),
    fetchGaleri(),
    getVillage().catch(() => null),
  ]);

  const waDesa = village?.whatsapp?.replace(/[^0-9]/g, "") || undefined;

  return (
    <main>
      <HeroBeranda imageUrl={village?.hero_beranda_url} />
      <WisataUnggulan data={wisata} />
      <JelajahDesa items={paket ?? undefined} wa={waDesa} />
      <LensaLande images={galeri ?? undefined} />
      <MitraKolaborasi />
      <Footer />
    </main>
  );
}

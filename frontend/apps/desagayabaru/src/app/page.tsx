import type { Metadata } from "next";
import {
  HeroBeranda,
  WisataUnggulan,
  JelajahDesa,
  LensaGayaBaru,
  MitraKolaborasi,
  Footer,
} from "@/components/sections";
import { getWisata } from "@/data/wisata";
import { fetchGaleri, fetchPaket } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Selamat datang di website resmi Desa Gaya Baru, Buton Selatan — jelajahi pesona wisata bahari unggulan.",
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
  const [wisata, paket, galeri] = await Promise.all([
    getWisata(),
    fetchPaket(),
    fetchGaleri(),
  ]);

  return (
    <main>
      <HeroBeranda />
      <WisataUnggulan data={wisata} />
      <JelajahDesa items={paket ?? undefined} />
      <LensaGayaBaru images={galeri ?? undefined} />
      <MitraKolaborasi />
      <Footer />
    </main>
  );
}

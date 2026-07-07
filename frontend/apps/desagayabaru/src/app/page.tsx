import type { Metadata } from "next";
import {
  HeroBeranda,
  WisataUnggulan,
  JelajahDesa,
  LensaGayaBaru,
  MitraKolaborasi,
  Footer,
} from "@/components/sections";
import { fetchPaket, fetchWisataUnggulan } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Selamat datang di website resmi Desa Gaya Baru, Buton Selatan — jelajahi pesona wisata bahari unggulan.",
};

/**
 * Homepage — Server Component (default di Next.js App Router).
 * Section disusun sesuai design system: hero → jelajah desa → lensa gaya baru →
 * mitra kolaborasi → footer. Semua styling pakai Tailwind utilities.
 */
// ISR — konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function HomePage() {
  const [unggulan, paket] = await Promise.all([fetchWisataUnggulan(), fetchPaket()]);

  return (
    <main>
      <HeroBeranda />
      <WisataUnggulan items={unggulan ?? undefined} />
      <JelajahDesa items={paket ?? undefined} />
      <LensaGayaBaru />
      <MitraKolaborasi />
      <Footer />
    </main>
  );
}

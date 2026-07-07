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

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Selamat datang di website resmi Desa Gerak Makmur, Buton Selatan — jelajahi Karamba, wisata bahari unggulan.",
};

/**
 * Homepage — Server Component (default di Next.js App Router).
 * Section disusun sesuai design system: hero → jelajah desa → lensa lande →
 * mitra kolaborasi → footer. Semua styling pakai Tailwind utilities.
 * Data wisata ditarik dari `@/data/wisata` (sumber sama dgn halaman /wisata)
 * dan diteruskan ke WisataUnggulan sebagai props.
 */
export default async function HomePage() {
  const wisata = await getWisata();
  return (
    <main>
      <HeroBeranda />
      <WisataUnggulan data={wisata} />
      <JelajahDesa />
      <LensaLande />
      <MitraKolaborasi />
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import {
  HeroBeranda,
  WisataUnggulan,
  JelajahDesa,
  LensaLande,
  MitraKolaborasi,
  Footer,
} from "@/components/sections";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Selamat datang di website resmi Desa Gerak Makmur, Buton Selatan — jelajahi Karamba, wisata bahari unggulan.",
};

/**
 * Homepage — Server Component (default di Next.js App Router).
 * Section disusun sesuai design system: hero → jelajah desa → lensa lande →
 * mitra kolaborasi → footer. Semua styling pakai Tailwind utilities.
 */
export default function HomePage() {
  return (
    <main>
      <HeroBeranda />
      <WisataUnggulan />
      <JelajahDesa />
      <LensaLande />
      <MitraKolaborasi />
      <Footer />
    </main>
  );
}

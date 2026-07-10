import type { Metadata } from "next";
import { JelajahDesa, Footer } from "@/components/sections";
import { ScrollCoverReveal } from "@/components/ui/ScrollCoverReveal";
import { HeroWisata } from "./_components/HeroWisata";
import { DaftarWisata } from "./_components/DaftarWisata";
import { getWisata } from "@/data/wisata";
import { fetchPaket } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Wisata",
  description:
    "Jelajahi destinasi wisata bahari dan potensi alam Desa Gaya Baru, Buton Selatan.",
};

/**
 * Halaman Wisata, Server Component (App Router).
 * Section route-spesifik dicolocate di `./_components`; Footer & komponen
 * lintas-halaman diambil dari `@/components/sections`. Navbar sudah dirender
 * di root layout, jadi tidak diulang di sini.
 */
// ISR, konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function WisataPage() {
  const [wisata, paket] = await Promise.all([getWisata(), fetchPaket()]);

  return (
    <main>
      {/* Hero di-pin; panel di bawahnya (asset tepi atas + section) naik
          menutupi hero sebagai satu kesatuan, dari utuh (0) sampai tertutup. */}
      <ScrollCoverReveal
        cover={<HeroWisata />}
        capSrc="/assets/bawah.avif"
        capClassName="mix-blend-screen [filter:drop-shadow(0_0_16px_rgba(150,230,240,0.55))_drop-shadow(0_0_44px_rgba(90,200,220,0.35))]"
        capOverlap={1}
        capOffset={0.15}
        hideDistance={0}
      >
        <DaftarWisata data={wisata} />
        <JelajahDesa items={paket ?? undefined} />
        <Footer />
      </ScrollCoverReveal>
    </main>
  );
}

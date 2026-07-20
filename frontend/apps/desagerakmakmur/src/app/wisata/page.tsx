import type { Metadata } from "next";
import { JelajahDesa, Footer } from "@/components/sections";
import { ScrollCoverReveal } from "@/components/ui/ScrollCoverReveal";
import { HeroWisata } from "./_components/HeroWisata";
import { DaftarWisata } from "./_components/DaftarWisata";
import { GuidebookWisata } from "./_components/GuidebookWisata";
import { getWisata } from "@/data/wisata";
import { fetchPaket } from "@/lib/konten";
import { getVillage } from "@/lib/desa";

export const metadata: Metadata = {
  title: "Wisata Buton Selatan",
  description:
    "Jelajahi destinasi wisata bahari dan potensi alam Desa Gerak Makmur, Buton Selatan.",
};

/**
 * Halaman Wisata — Server Component (App Router).
 * Section route-spesifik dicolocate di `./_components`; Footer & komponen
 * lintas-halaman diambil dari `@/components/sections`. Navbar sudah dirender
 * di root layout, jadi tidak diulang di sini.
 */
// ISR — konten Supabase disegarkan tiap 5 menit.
export const revalidate = 300;

export default async function WisataPage() {
  const [wisata, paket, village] = await Promise.all([
    getWisata(),
    fetchPaket(),
    getVillage().catch(() => null),
  ]);

  // Nomor WA seragam untuk seluruh halaman (villages.whatsapp).
  const waDesa = village?.whatsapp?.replace(/[^0-9]/g, "") || undefined;

  // Data terstruktur (schema.org) tiap destinasi — sinyal buat Google supaya
  // bisa menampilkan rich result "wisata" untuk pencarian seperti
  // "wisata buton selatan", bukan cuma tautan biru biasa.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: wisata.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: w.nama,
        description: w.deskripsi,
        image: w.imgs[0],
        ...(w.latitude != null && w.longitude != null
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: w.latitude,
                longitude: w.longitude,
              },
            }
          : {}),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Desa Gerak Makmur",
          addressRegion: "Sulawesi Tenggara",
          addressCountry: "ID",
        },
      },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- JSON-LD statis dari data server, bukan HTML dari input pengguna
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero di-pin; panel di bawahnya (asset tepi atas + section) naik
          menutupi hero sebagai satu kesatuan, dari utuh (0) sampai tertutup. */}
      <ScrollCoverReveal
        cover={<HeroWisata imageUrl={village?.hero_wisata_url} />}
        capSrc="/assets/bawah.avif"
        capClassName="mix-blend-screen [filter:drop-shadow(0_0_16px_rgba(150,230,240,0.55))_drop-shadow(0_0_44px_rgba(90,200,220,0.35))]"
        capOverlap={1}
        capOffset={0.15}
        hideDistance={0}
      >
        <DaftarWisata data={wisata} />
        <JelajahDesa items={paket ?? undefined} compactBottom wa={waDesa} />
        <GuidebookWisata wa={waDesa} fileUrl={village?.guidebook_url ?? undefined} />
        <Footer />
      </ScrollCoverReveal>
    </main>
  );
}

import type { Metadata } from "next";
import { Footer } from "@/components/sections";

export const metadata: Metadata = {
  title: "Informasi",
  description:
    "Berita dan UMKM Desa Gerak Makmur, Buton Selatan.",
};

/**
 * Halaman Informasi — PLACEHOLDER sementara.
 * Dibuat agar link "Informasi" di navbar (pengganti dropdown Berita/UMKM)
 * tidak 404; konten Berita & UMKM menyusul saat development halamannya.
 */
export default function InformasiPage() {
  return (
    <main>
      <section
        aria-label="Informasi Desa Gerak Makmur"
        className="flex min-h-[70vh] items-center bg-surface px-5 pt-32 pb-16 sm:px-8"
      >
        <div className="mx-auto w-full max-w-[1112px]">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant md:text-sm">
            Informasi Desa
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold text-primary">
            Berita &amp; UMKM
          </h1>
          <p className="mt-4 max-w-[640px] font-body text-base leading-relaxed text-on-surface-variant">
            Halaman ini masih dalam pengembangan. Kabar terbaru dan profil UMKM
            Desa Gerak Makmur akan tampil di sini.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

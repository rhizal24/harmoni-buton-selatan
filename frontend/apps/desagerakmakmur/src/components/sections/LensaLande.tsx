"use client";

import { useEffect, useRef, useState } from "react";
import { ExpandingGallery } from "@/components/ui/ExpandingGallery";
import { Pagination } from "@/components/ui/Pagination";
import type { GaleriFoto } from "@/lib/konten";

const IMG = {
  panorama: { src: "/images/hero-bg.jpg", alt: "Panorama Desa Gerak Makmur dari udara" },
  pantai: {
    src: "/images/wisata-pantai.jpg",
    alt: "Garis pantai berpasir putih Buton Selatan",
  },
  diving: { src: "/images/wisata-diving.jpg", alt: "Terumbu karang bawah laut" },
  mangrove: {
    src: "/images/wisata-mangrove.jpg",
    alt: "Hutan mangrove tepi teluk",
  },
};

/** Tiap halaman = satu set foto yang tampil di strip galeri. */
const PAGES = [
  [IMG.panorama, IMG.pantai, IMG.diving, IMG.mangrove, IMG.diving, IMG.pantai],
  [IMG.mangrove, IMG.diving, IMG.pantai, IMG.panorama, IMG.pantai, IMG.diving],
  [IMG.pantai, IMG.panorama, IMG.mangrove, IMG.diving, IMG.mangrove, IMG.panorama],
];

const FADE_MS = 300;

/** Pecah daftar foto jadi halaman berisi maksimal 6 foto. */
function chunkPages(images: GaleriFoto[]): GaleriFoto[][] {
  const pages: GaleriFoto[][] = [];
  for (let i = 0; i < images.length; i += 6) {
    pages.push(images.slice(i, i + 6));
  }
  return pages;
}

/**
 * Lensa Lande — galeri foto (strip melebar saat hover) + pagination.
 * Ganti halaman → seluruh set foto ditukar dengan crossfade halus
 * (fade-out → swap saat invisible → fade-in), tanpa pergeseran.
 * Figma node 92:1397 / 94:1447.
 * `images` (dari Supabase) menggantikan foto default bila tersedia.
 */
export function LensaLande({ images }: { images?: GaleriFoto[] }) {
  const pages = images && images.length > 0 ? chunkPages(images) : PAGES;
  const [page, setPage] = useState(1); // 1-based
  const [fading, setFading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function changePage(next: number) {
    if (next === page || next < 1 || next > pages.length || fading) return;
    setFading(true); // fade-out halus seluruh set lama
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPage(next); // swap saat invisible → tile baru fade-in bertahap
      setFading(false);
    }, FADE_MS);
  }

  return (
    <section
      id="lensa-lande"
      aria-label="Lensa Lande — galeri foto desa"
      className="bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1112px]">
        <hr className="mb-12 border-t border-[#006572]/15" />

        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="font-body text-[clamp(2.5rem,5vw,3.75rem)] font-semibold text-[#006572]">
            Lensa Lande
          </h2>
          <p className="mt-4 max-w-[730px] font-body text-lg leading-relaxed text-[#006572]">
            Lensa Lande menghadirkan potret alam, budaya, dan kehidupan Desa
            Gaya Baru. Setiap gambar menyimpan cerita tentang pesona desa.
          </p>
        </div>

        {/* fading → fade-out halus (transition); selesai fade-out, set ditukar
            & tile baru fade-in bertahap (stagger) tanpa transition container */}
        <div
          className={
            fading
              ? "opacity-0 motion-safe:transition-opacity motion-safe:duration-300"
              : "opacity-100"
          }
        >
          <ExpandingGallery
            key={page}
            images={pages[page - 1]}
            staggerMs={90}
          />
        </div>

        <Pagination
          page={page}
          count={pages.length}
          onChange={changePage}
          className="mt-10"
        />
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * GaleriHero, pembuka halaman Galeri, teks tengah saja:
 * eyebrow → judul display → subtitle dua warna → CTA scroll ke grid.
 * Elemen masuk dengan stagger dari atas; hormat reduced-motion.
 */
export function GaleriHero() {
  const reduceMotion = useReducedMotion();

  const scrollToGrid = () => {
    document.getElementById("galeri-masonry")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      aria-label="Pembuka galeri Desa Gaya Baru"
      className="bg-white px-5 pt-36 sm:px-8 lg:pt-40"
    >
      {/* ── Teks tengah ── */}
      <div className="mx-auto flex w-full max-w-[52rem] flex-col items-center gap-5 text-center">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]"
        >
          Desa Gaya Baru
        </motion.span>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[clamp(2.75rem,7vw,5rem)] font-bold leading-[1.02] tracking-tight text-[#31577F]"
        >
          Lensa Gaya Baru
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[34rem] font-body text-base leading-relaxed sm:text-lg"
        >
          <span className="text-[#31577F]">Jelajahi dokumentasi </span>
          <span className="text-[#31577F]/50">
            kegiatan, alam, dan budaya -{" "}
          </span>
          <span className="text-[#31577F]">
            keseharian warga Desa Gaya Baru dalam satu bingkai.
          </span>
        </motion.p>

        {/* Animasi masuk di wrapper, framer meninggalkan transform inline
            yang menimpa hover:-translate-y tombol (bikin transisi patah). */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1"
        >
          <button
            type="button"
            onClick={scrollToGrid}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-[#31577F] px-8 py-3 font-body text-sm font-semibold text-white shadow-sm motion-safe:transition-[transform,filter] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:[filter:drop-shadow(0_0_16px_rgba(49,87,127,0.55))_drop-shadow(0_0_44px_rgba(49,87,127,0.30))] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F]"
          >
            Jelajahi Galeri
          </button>
        </motion.div>
      </div>
    </section>
  );
}

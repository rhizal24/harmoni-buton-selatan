"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CircularGallery from "./CircularGallery";
import type { FotoGaleri } from "@/types/galeri";

/**
 * Overlay viewer galeri, dibuka saat tile GaleriMasonry diklik.
 * Isi: CircularGallery (carousel WebGL melengkung, tanpa loop) yang mulai
 * dari foto yang diklik, counter foto aktif, dan tombol tutup (juga Esc).
 * Render di dalam <AnimatePresence> agar animasi keluar berjalan.
 */
export function GaleriCarouselOverlay({
  data,
  startIndex,
  onClose,
}: {
  data: FotoGaleri[];
  startIndex: number;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [aktif, setAktif] = useState(startIndex);

  // Identitas array harus stabil, jadi dependency effect CircularGallery.
  const items = useMemo(
    () => data.map((foto) => ({ image: foto.src, text: foto.alt })),
    [data],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Kunci scroll native; data-lenis-prevent di overlay menahan Lenis.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${aktif + 1} dari ${data.length}: ${data[aktif].alt}`}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      className="fixed inset-0 z-[100] bg-[#0b1d20]/95 backdrop-blur-sm"
    >
      {/* Carousel WebGL full-screen, kartu tepat di tengah layar;
          geser/scroll/panah, berhenti di ujung (tanpa loop) */}
      <div className="absolute inset-0">
        <CircularGallery
          items={items}
          startIndex={startIndex}
          // Bend negatif = deretan kartu melengkung ke atas (cekung).
          bend={1}
          scrollEase={reduceMotion ? 1 : 0.05}
          onActiveChange={setAktif}
        />
      </div>

      {/* Bar atas: counter + tombol tutup, lapisan di atas canvas */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-6 p-5 text-white sm:p-8">
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-xs font-semibold tracking-[0.2em] text-white/60">
            {String(aktif + 1).padStart(2, "0")} /{" "}
            {String(data.length).padStart(2, "0")}
          </span>
          <span className="font-body text-lg font-semibold leading-tight">
            {data[aktif].alt}
          </span>
        </div>
        <button
          type="button"
          aria-label="Tutup galeri"
          onClick={onClose}
          className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/25 text-white motion-safe:transition-colors motion-safe:duration-150 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center font-body text-xs font-semibold tracking-[0.2em] text-white/40">
        GESER, SCROLL, ATAU TEKAN ← → UNTUK MENJELAJAH
      </p>
    </motion.div>
  );
}

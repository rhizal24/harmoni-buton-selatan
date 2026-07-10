"use client";

import { useEffect, useState } from "react";

interface PhotoSlideshowProps {
  /** Daftar sumber foto yang di-cross-fade bergantian. */
  images: string[];
  /** Label aksesibilitas (mis. nama destinasi) untuk `aria-label`. */
  label: string;
  /** Durasi tiap foto sebelum berganti (ms). Default 3500 (rentang 2–5 dtk). */
  intervalMs?: number;
  className?: string;
}

/**
 * PhotoSlideshow, menumpuk beberapa foto dan mem-fade-nya bergantian secara
 * otomatis (loop). Bingkai tosca mengikuti design system. Hormati
 * prefers-reduced-motion: bila minim gerak, hanya foto pertama yang tampil
 * (tanpa cycling). State reset otomatis bila komponen di-remount lewat `key`.
 */
export function PhotoSlideshow({
  images,
  label,
  intervalMs = 3500,
  className = "",
}: PhotoSlideshowProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(
      () => setIdx((i) => (i + 1) % images.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div
      role="img"
      aria-label={`Foto ${label}`}
      className={`relative h-full min-h-[320px] self-stretch overflow-hidden rounded-xl border-2 border-[#31577F] shadow-card-hover sm:min-h-[420px] ${className}`}
    >
      {images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-1000 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Indikator titik */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((src, i) => (
            <span
              key={`dot-${src}-${i}`}
              aria-hidden
              className={`h-1.5 rounded-full bg-white motion-safe:transition-all motion-safe:duration-500 ${
                i === idx ? "w-5 opacity-100" : "w-1.5 opacity-60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

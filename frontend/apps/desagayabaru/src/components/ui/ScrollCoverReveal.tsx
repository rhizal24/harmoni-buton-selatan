"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollCoverRevealProps {
  /** Bagian yang di-pin/diam (mis. hero) saat panel di bawahnya naik menutupi. */
  cover: ReactNode;
  /** Konten (panel) yang naik menutupi `cover` sebagai satu kesatuan. */
  children: ReactNode;
  /** Sumber asset tepi atas panel (mis. "/assets/bawah.avif"). */
  capSrc?: string;
  /** Kelas tampilan asset (mix-blend, filter glow, dll). */
  capClassName?: string;
  /** TINGGI band asset (px). Kosong = ikut rasio asli (full width). Diisi = di-crop dari atas. */
  capHeight?: number;
  /** GAP/overlap: rasio tinggi asset yang tersembul di atas panel (0–1). 0.8 = 80% di atas hero, 20% overlap ke panel putih (makin besar = makin rapat/anti-gap). */
  capOverlap?: number;
  /** Nudge halus posisi asset (px). Positif = geser ke bawah (menutup gap tipis). */
  capOffset?: number;
  /** Jarak (px) panel didorong turun di awal agar asset tepi atasnya tak terlihat. */
  hideDistance?: number;
  /** POSISI SCROLL, kapan efek mulai (format ScrollTrigger, mis. "top top"). */
  start?: string;
  /** POSISI SCROLL, kapan efek selesai / panjang scroll (mis. "bottom top", "+=120%"). */
  end?: string;
}

/**
 * ScrollCoverReveal, efek "cover": `cover` (hero) di-pin (diam) saat di-scroll,
 * lalu panel `children` NAIK menutupinya sebagai satu kesatuan
 * (`pinSpacing: false` → saling tumpang-tindih), dari hero utuh (0) sampai
 * tertutup penuh.
 *
 * Asset (`bawah.avif`) menempel di TEPI ATAS panel dan bergerak bersamanya
 * (menyatu, seperti lengkung Biak Elok). Di awal panel sedikit didorong turun
 * (`hideDistance`) agar asset belum terlihat. Semua ter-scrub pada satu
 * ScrollTrigger. Menghormati reduced-motion.
 */
export function ScrollCoverReveal({
  cover,
  children,
  capSrc,
  capClassName = "",
  capHeight,
  capOverlap = 0.8,
  capOffset = 0,
  hideDistance = 400,
  start = "top top",
  end = "bottom top",
}: ScrollCoverRevealProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coverEl = coverRef.current;
    const panelEl = panelRef.current;
    if (!coverEl || !panelEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(panelEl, { y: 0 }); // layout normal, tanpa efek
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(panelEl, { y: hideDistance });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: coverEl,
          start,
          end,
          pin: true,
          pinSpacing: false,
          scrub: true,
        },
      });

      // Panel (beserta asset tepi atasnya) naik menutupi hero.
      tl.to(panelEl, { y: 0, ease: "none", duration: 1 }, 0);
    });

    return () => ctx.revert();
  }, [hideDistance, start, end]);

  return (
    <>
      <div ref={coverRef}>{cover}</div>
      {/* Panel menutupi hero. Asset menempel di tepi atas (di atas hero) dan
          ikut bergerak dengan panel. Inline transform awal agar tak "loncat". */}
      <div
        ref={panelRef}
        className="relative z-10"
        style={{ transform: `translateY(${hideDistance}px)` }}
      >
        {capSrc && (
          <img
            src={capSrc}
            alt=""
            aria-hidden
            loading="lazy"
            // top-0 + translate ke atas: sebagian besar asset tersembul di atas
            // panel (di atas hero), sisanya overlap ke panel putih → tanpa gap.
            // capHeight (opsional) meng-crop tinggi band dari atas.
            style={{
              transform: `translateY(calc(-${capOverlap * 100}% + ${capOffset}px))`,
              ...(capHeight
                ? {
                    height: `${capHeight}px`,
                    objectFit: "cover",
                    objectPosition: "top",
                  }
                : null),
            }}
            className={`pointer-events-none absolute inset-x-0 top-0 z-[6] w-full ${capClassName}`}
          />
        )}
        {children}
      </div>
    </>
  );
}

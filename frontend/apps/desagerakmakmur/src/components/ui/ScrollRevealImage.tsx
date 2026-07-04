"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealImageProps {
  src: string;
  alt?: string;
  /** Selector elemen pemicu scroll, mis. "#hero" */
  trigger: string;
  /** Titik akhir scrub (kapan opacity penuh). Makin kecil = makin cepat muncul. */
  revealEnd?: string;
  className?: string;
}

/**
 * ScrollRevealImage — gambar dekoratif yang opacity-nya naik mengikuti scroll
 * (GSAP ScrollTrigger, scrub). Awalnya transparan; muncul saat mulai men-scroll.
 * Hormati reduced-motion (langsung tampil penuh, tanpa animasi).
 */
export function ScrollRevealImage({
  src,
  alt = "",
  trigger,
  revealEnd = "55% top",
  className = "",
}: ScrollRevealImageProps) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    // Hanya animasi opacity (bukan transform) supaya flip CSS di className
    // tidak ikut ditimpa GSAP.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top top",
            end: revealEnd,
            scrub: true,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [trigger]);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      aria-hidden={alt === ""}
      loading="lazy"
      className={className}
      style={{ opacity: 0 }}
    />
  );
}

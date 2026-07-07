"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero halaman Wisata — full screen, konten rata kiri (beda dari hero Beranda
 * yang center), tapi lebar/jarak kiri-kanan mengikuti container standar situs
 * (`max-w-[1112px]` + `px-5 sm:px-8`) agar konsisten dengan section lain.
 *
 * Background foto full-bleed + overlay gradient dari kiri supaya teks terbaca.
 * Konten di-nudge sedikit ke atas (`pb-[10vh]`) dan diberi parallax halus
 * (GSAP, naik saat di-scroll). Dua CTA: "Mulai Eksplorasi" & "Pesan Paket".
 * Colocated di `app/wisata/_components`. (Pembatas parallax `bawah.avif`
 * dipasang di section berikutnya — DaftarWisata — agar menempel ke sana.)
 */
export function HeroWisata() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.05,
      });
      gsap.to(el, {
        y: -90,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero-wisata",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero-wisata"
      aria-label="Wisata Desa Gaya Baru"
      className="relative flex min-h-screen items-center overflow-hidden pb-[10vh]"
    >
      {/* Background foto */}
      <img
        src="/images/wisata-pantai.jpg"
        alt="Panorama wisata bahari Desa Gaya Baru"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      {/* Overlay gradient dari kiri — jaga keterbacaan teks rata kiri */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/15"
        aria-hidden
      />

      {/* Konten — container standar, tapi teks rata kiri */}
      <div className="relative z-10 mx-auto w-full max-w-[1112px] px-5 sm:px-8">
        <div
          ref={contentRef}
          className="flex max-w-[640px] flex-col items-start text-left"
        >
          <p className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#CFF1F4]/90 md:text-sm">
            Jelajahi Pesona
          </p>

          <h1 className="mt-3 font-body text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.01em] text-white drop-shadow-sm">
            Wisata Desa Gaya Baru
          </h1>

          <p className="mt-5 font-body text-base leading-[1.7] text-white/85 md:text-lg">
            Selami keindahan bahari, mangrove, dan budaya pesisir Buton Selatan.
            Mulai eksplorasi destinasi atau pesan paket wisata untuk pengalaman
            yang terkurasi bersama warga desa.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            {/* Primary — Mulai Eksplorasi */}
            <Link
              href="#daftar-wisata"
              className="inline-flex items-center rounded-md bg-[#006572] px-8 py-3 font-body text-sm font-semibold text-white no-underline shadow-sm motion-safe:transition-[transform,filter] motion-safe:duration-200 hover:-translate-y-0.5 hover:[filter:drop-shadow(0_0_16px_rgba(0,101,114,0.55))_drop-shadow(0_0_44px_rgba(0,101,114,0.30))] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Mulai Eksplorasi
            </Link>
            {/* Secondary — Pesan Paket Wisata (ghost/glass) */}
            <Link
              href="#paket-wisata"
              className="inline-flex items-center rounded-md border border-white/70 bg-white/10 px-8 py-3 font-body text-sm font-semibold text-white no-underline backdrop-blur-sm shadow-sm motion-safe:transition-[transform,filter,background-color] motion-safe:duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:[filter:drop-shadow(0_0_16px_rgba(255,255,255,0.45))_drop-shadow(0_0_44px_rgba(255,255,255,0.25))] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              Pesan Paket Wisata
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

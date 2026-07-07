import Link from "next/link";
import { GlowPill } from "@/components/ui/GlowPill";
import { ScrollRevealImage } from "@/components/ui/ScrollRevealImage";
import { StaggerIn } from "@/components/ui/StaggerIn";

/**
 * Hero Beranda — full-bleed foto drone desa + overlay gelap + konten center.
 * Susunan: pill (identitas situs) → eyebrow → headline → deskripsi → CTA,
 * dengan indikator scroll-down di bawah. Sesuai Figma node 82:873.
 */
export function HeroBeranda() {
  return (
    <section
      id="hero"
      aria-label="Selamat datang di Desa Gerak Makmur"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background foto */}
      <img
        src="/images/hero-bg.jpg"
        alt="Panorama Desa Gerak Makmur dari udara"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black/45" aria-hidden />

      {/* Asset dekoratif tepi atas & bawah — blend screen + glow,
          muncul (opacity) saat scroll. Atas = mirror vertikal dari bawah. */}
      {[
        { edge: "bottom-0", end: "55% top" }, // bawah — orientasi asli
        { edge: "top-0 -scale-y-100", end: "22% top" }, // atas — muncul lebih awal
      ].map(({ edge, end }) => (
        <ScrollRevealImage
          key={edge}
          src="/assets/bawah.avif"
          trigger="#hero"
          revealEnd={end}
          className={`pointer-events-none absolute inset-x-0 z-[6] w-full mix-blend-screen [filter:drop-shadow(0_0_16px_rgba(150,230,240,0.55))_drop-shadow(0_0_44px_rgba(90,200,220,0.35))] ${edge}`}
        />
      ))}

      {/* Konten — tiap anak masuk ber-stagger saat halaman dibuka/di-reload */}
      <StaggerIn className="relative z-10 mx-auto flex max-w-[820px] flex-col items-center px-5 text-center">
        <GlowPill>Portal Informasi Resmi</GlowPill>

        <p className="mt-7 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#CFF1F4]/90 md:text-sm">
          Selamat Datang di
        </p>

        <h1 className="mt-3 font-body text-[clamp(2.75rem,7vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.01em] text-white drop-shadow-sm">
          Desa Gerak Makmur
        </h1>

        <p className="mt-5 max-w-xl font-body text-base leading-[1.7] text-white/80 md:text-lg">
          Pusat informasi, layanan publik, dan eksplorasi potensi wisata bahari
          Buton Selatan — bergerak bersama menuju kesejahteraan.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/wisata#daftar-wisata"
            className="inline-flex items-center rounded-md bg-[#006572] px-8 py-3 font-body text-sm font-semibold text-white no-underline shadow-sm motion-safe:transition-[transform,filter] motion-safe:duration-200 hover:-translate-y-0.5 hover:[filter:drop-shadow(0_0_16px_rgba(0,101,114,0.55))_drop-shadow(0_0_44px_rgba(0,101,114,0.30))] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            Jelajahi Karamba
          </Link>
          <Link
            href="/informasi/umkm"
            className="inline-flex items-center rounded-md bg-[#ae263a] px-8 py-3 font-body text-sm font-semibold text-white no-underline shadow-sm motion-safe:transition-[transform,filter] motion-safe:duration-200 hover:-translate-y-0.5 hover:[filter:drop-shadow(0_0_16px_rgba(174,38,58,0.55))_drop-shadow(0_0_44px_rgba(174,38,58,0.30))] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            Lihat UMKM
          </Link>
        </div>
      </StaggerIn>

      {/* Scroll down */}
      <a
        href="#wisata-unggulan"
        aria-label="Gulir ke bawah"
        className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 text-white/60 no-underline motion-safe:animate-bounce hover:text-white/90"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M19 9A7 7 0 1 0 5 9v6a7 7 0 1 0 14 0zm-7-3v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-body text-sm">Scroll ke bawah</span>
      </a>
    </section>
  );
}

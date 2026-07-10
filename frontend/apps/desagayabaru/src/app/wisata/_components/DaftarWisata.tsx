"use client";

import { useState, type ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import {
  PhotoSlideshow,
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  PhoneIcon,
  MapPinIcon,
  MapIcon,
} from "@/components/ui";
import type { Wisata } from "@/types/wisata";

/**
 * Daftar Wisata, accordion "expanding". Tiap panel melebar saat hover dan
 * judulnya muncul; klik untuk MENGUNCI panel tetap terbuka (`active`). Detail
 * destinasi aktif tampil di bawah (menyatu lewat divider): narasi + lokasi +
 * kontak di kiri, slideshow foto di kanan. Menghormati `prefers-reduced-motion`.
 *
 * Data destinasi: `../_data/wisata`. Slideshow & ikon: `@/components/ui`.
 * Asset cap (`bawah.avif`) & gerak panel hero ditangani `ScrollCoverReveal`
 * yang membungkus blok ini di `page.tsx`.
 */
export function DaftarWisata({ data }: { data: Wisata[] }) {
  const [active, setActive] = useState(0); // item pertama terbuka default
  const current = data[active];

  return (
    <section
      id="daftar-wisata"
      aria-label="Daftar destinasi wisata"
      className="bg-white px-5 pt-16 pb-6 sm:px-8 lg:pt-24 lg:pb-8"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Header editorial rata kiri, selaras dengan hero */}
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
              <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
              Destinasi
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#31577F]">
              Daftar Wisata
            </h2>
            <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#31577F]/80">
              Lima destinasi unggulan Desa Gaya Baru. Arahkan kursor untuk
              mengintip tiap tempat, lalu klik untuk membuka informasi
              lengkapnya di bawah.
            </p>
          </div>
        </Reveal>

        {/* ── Accordion desktop (md+) ── */}
        <Reveal delay={90}>
          <div className="hidden h-[460px] w-full items-stretch gap-3 md:flex">
            {data.map((w, i) => {
              const isActive = active === i;
              return (
                <button
                  key={w.nama}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  aria-label={`Buka detail ${w.nama}`}
                  className={`group relative h-full flex-grow overflow-hidden rounded-lg border-2 motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F] ${
                    isActive
                      ? "w-full border-[#31577F] shadow-[0_0_16px_rgba(49,87,127,0.55),0_0_48px_rgba(49,87,127,0.32)]"
                      : "w-56 border-transparent hover:w-full"
                  }`}
                >
                  <img
                    src={w.imgs[0]}
                    alt={w.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105"
                  />
                  {/* Scrim gelap agar teks/label terbaca */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                    aria-hidden
                  />

                  {/* Label vertikal saat panel menyempit (tidak aktif & tidak di-hover) */}
                  <span
                    style={{ writingMode: "vertical-rl" }}
                    className={`absolute bottom-6 left-1/2 -translate-x-1/2 rotate-180 font-body text-sm font-semibold uppercase tracking-[0.2em] text-white/90 motion-safe:transition-opacity motion-safe:duration-200 group-hover:opacity-0 ${
                      isActive ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    {w.nama}
                  </span>

                  {/* Konten muncul saat hover ATAU aktif */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-end gap-1 p-8 text-left text-white motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="font-body text-xs font-semibold tracking-[0.2em] text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="whitespace-nowrap font-body text-3xl font-semibold leading-tight">
                      {w.nama}
                    </h3>
                    <p className="whitespace-nowrap font-body text-sm text-white/85">
                      {w.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ── Kartu grid mobile (<md) ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
          {data.map((w, i) => {
            const isActive = active === i;
            return (
              <button
                key={w.nama}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`group relative aspect-[4/3] overflow-hidden rounded-lg border-2 text-left motion-safe:transition-[box-shadow,border-color] motion-safe:duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F] ${
                  isActive
                    ? "border-[#31577F] shadow-[0_0_16px_rgba(49,87,127,0.55),0_0_48px_rgba(49,87,127,0.32)]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={w.imgs[0]}
                  alt={w.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4 text-white">
                  <h3 className="font-body text-xl font-semibold leading-tight">
                    {w.nama}
                  </h3>
                  <p className="font-body text-xs text-white/85">{w.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Detail destinasi aktif, menyatu dgn daftar (divider).
              key → re-animate & reset slideshow saat berganti. ── */}
        <div
          key={current.nama}
          aria-live="polite"
          className="grid items-start gap-10 border-t border-[#31577F]/15 pt-8 motion-safe:animate-gallery-fade sm:pt-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14"
        >
          {/* Kolom kiri, identitas, narasi, lokasi, kontak */}
          <div className="flex flex-col items-start gap-6">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
              <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
              Detail Destinasi
            </span>

            <div className="flex flex-col gap-3">
              <h3 className="font-body text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight text-[#31577F]">
                {current.nama}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {current.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[#31577F]/30 px-3.5 py-1.5 font-body text-sm font-semibold text-[#31577F]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#31577F]">
              <strong className="font-bold text-[#1F3A59]">
                {current.tagline}.
              </strong>{" "}
              {current.deskripsi}
            </p>

            {/* Lokasi */}
            <div className="flex w-full flex-col gap-3">
              <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#31577F]/60">
                Lokasi
              </span>
              <div className="flex flex-wrap gap-3">
                <a
                  href={current.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border-[1.5px] border-[#31577F] bg-white px-4 py-2.5 font-body text-sm font-semibold text-[#31577F] no-underline motion-safe:transition-colors hover:bg-[#31577F]/5 focus-visible:outline-2 focus-visible:outline-[#31577F] focus-visible:outline-offset-2"
                >
                  <MapPinIcon />
                  Buka di Google Maps
                  <span className="text-[#31577F]/60" aria-hidden>
                    ↗
                  </span>
                </a>
                {/* Peta Desa, halaman menyusul */}
                <span
                  aria-disabled="true"
                  title="Halaman Peta Desa segera hadir"
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border-[1.5px] border-[#31577F]/25 bg-white px-4 py-2.5 font-body text-sm font-semibold text-[#31577F]/50"
                >
                  <MapIcon />
                  Lihat di Peta Desa
                  <span className="rounded-full bg-[#31577F]/10 px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide text-[#31577F]">
                    Segera
                  </span>
                </span>
              </div>
            </div>

            {/* Kontak & sosial media */}
            <div className="flex w-full flex-col gap-3">
              <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#31577F]/60">
                Kontak &amp; Sosial Media
              </span>
              {/* WhatsApp, di-highlight (glow tetap menyala + sedikit lebih besar) */}
              <a
                href={`https://wa.me/${current.wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-md border border-white bg-[#31577F] px-6 py-3.5 font-body text-base font-semibold text-white no-underline shadow-[0_0_18px_rgba(49,87,127,0.45),0_0_44px_rgba(49,87,127,0.22)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(49,87,127,0.65),0_0_54px_rgba(49,87,127,0.35)] focus-visible:outline-2 focus-visible:outline-[#31577F] focus-visible:outline-offset-2 sm:w-auto"
              >
                <WhatsAppIcon />
                Chat via WhatsApp
              </a>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={`tel:${current.telepon.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center gap-2 font-body text-sm font-semibold text-[#31577F] no-underline hover:underline"
                >
                  <PhoneIcon />
                  {current.telepon}
                </a>
                <span className="h-5 w-px bg-[#31577F]/20" aria-hidden />
                <div className="flex items-center gap-3">
                  {current.instagram && (
                    <SocialLink href={current.instagram} label="Instagram">
                      <InstagramIcon />
                    </SocialLink>
                  )}
                  {current.tiktok && (
                    <SocialLink href={current.tiktok} label="TikTok">
                      <TikTokIcon />
                    </SocialLink>
                  )}
                  {current.facebook && (
                    <SocialLink href={current.facebook} label="Facebook">
                      <FacebookIcon />
                    </SocialLink>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom kanan, slideshow foto auto-fade (loop) */}
          <PhotoSlideshow images={current.imgs} label={current.nama} />
        </div>
      </div>
    </section>
  );
}

/* ── Social link, tombol bulat ikon sosmed (target eksternal) ─────── */
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#31577F]/30 text-[#31577F] no-underline motion-safe:transition-[transform,filter,background-color,color] motion-safe:duration-200 hover:-translate-y-0.5 hover:bg-[#31577F] hover:text-white hover:[filter:drop-shadow(0_0_14px_rgba(49,87,127,0.45))] focus-visible:outline-2 focus-visible:outline-[#31577F] focus-visible:outline-offset-2"
    >
      {children}
    </a>
  );
}

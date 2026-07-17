"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Guidebook Wisata, section unduhan panduan wisata resmi desa.
 * Split 2 kolom: teks + daftar isi (kiri), sampul buku CSS (kanan).
 * Mengikuti pola editorial DaftarWisata: eyebrow bergaris → judul → deskripsi.
 * Animasi masuk (GSAP ScrollTrigger, pola BeritaTerkini/DaftarWisata): kolom
 * kiri ber-stagger, sampul buku menyusul dengan sedikit delay.
 * Berkas: /docs/guidebook-wisata-gayabaru.pdf (stub, ganti berkas asli).
 */

const ISI_GUIDEBOOK = [
  "Peta & rute perjalanan menuju Desa Gaya Baru",
  "Profil lengkap destinasi beserta fasilitasnya",
  "Daftar paket wisata dan kisaran harga terbaru",
  "Tips berkunjung, etika wisata, dan kontak penting",
];

const FILE_GUIDEBOOK_DEFAULT = "/docs/guidebook-wisata-gayabaru.pdf";
const WA_DEFAULT = "6281234567890";

export function GuidebookWisata({
  wa,
  fileUrl,
}: {
  /** Nomor WA tujuan (wa.me) - seragam dengan bagian lain halaman wisata. */
  wa?: string;
  /** URL PDF guidebook dari admin (villages.guidebook_url); default file statis. */
  fileUrl?: string;
}) {
  const FILE_GUIDEBOOK = fileUrl ?? FILE_GUIDEBOOK_DEFAULT;
  const WA_LINK = `https://wa.me/${wa ?? WA_DEFAULT}`;
  const leftRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const masuk = { opacity: 0, y: 28, duration: 0.8, ease: "power3.out" } as const;

      if (leftRef.current) {
        gsap.from(leftRef.current.children, {
          ...masuk,
          stagger: 0.12,
          scrollTrigger: { trigger: leftRef.current, start: "top 80%" },
        });
      }
      if (coverRef.current) {
        gsap.from(coverRef.current, {
          opacity: 0,
          y: 32,
          scale: 0.96,
          duration: 0.9,
          delay: 0.25,
          ease: "power3.out",
          scrollTrigger: { trigger: coverRef.current, start: "top 85%" },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="guidebook-wisata"
      aria-label="Guidebook wisata Desa Gaya Baru"
      className="bg-white px-5 pt-6 pb-16 sm:px-8 lg:pt-8 lg:pb-24"
    >
      <div className="mx-auto grid w-full max-w-[1112px] items-center gap-12 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-16">
        {/* Kolom kiri, teks editorial + daftar isi + CTA */}
        <div ref={leftRef} className="flex flex-col items-start gap-4">
          <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
            <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
            Panduan Wisata
          </span>
          <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[#31577F]">
            Guidebook Wisata Gaya Baru
          </h2>
          <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#31577F]/80">
            Satu panduan lengkap untuk merencanakan kunjunganmu, dari rute
            perjalanan sampai tips menikmati pantai bersama warga desa.
            Gratis, tinggal unduh.
          </p>

          <ul className="mt-2 flex flex-col gap-3">
            {ISI_GUIDEBOOK.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 font-body text-base text-[#3e494b]"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9E4F1] text-[#31577F]"
                  aria-hidden
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href={FILE_GUIDEBOOK}
              download
              className="inline-flex items-center gap-2.5 rounded-md bg-[#31577F] px-8 py-3 font-body text-sm font-semibold text-white no-underline shadow-sm motion-safe:transition-[transform,filter] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0 hover:[filter:drop-shadow(0_0_16px_rgba(49,87,127,0.55))_drop-shadow(0_0_44px_rgba(49,87,127,0.30))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Unduh Guidebook (PDF)
            </a>
            <a
              href={`${WA_LINK}?text=${encodeURIComponent("Halo, saya mau bertanya soal wisata Desa Gaya Baru")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border-[1.5px] border-[#31577F] px-8 py-3 font-body text-sm font-semibold text-[#31577F] no-underline shadow-sm motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F]"
            >
              Tanya via WhatsApp
            </a>
          </div>
        </div>

        {/* Kolom kanan, sampul buku bergaya CSS, dibingkai tosca */}
        <a
          ref={coverRef}
          href={FILE_GUIDEBOOK}
          download
          aria-label="Unduh guidebook wisata (PDF)"
          className="group mx-auto block w-full max-w-[300px] no-underline lg:max-w-[340px]"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg border-[1.5px] border-[#31577F] bg-gradient-to-br from-[#31577F] via-[#02525c] to-[#00343c] p-7 shadow-sm motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5">
            {/* Garis hias gelombang */}
            <svg
              className="absolute -right-8 -bottom-6 h-44 w-44 text-white/10"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex h-full flex-col">
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Panduan Resmi
              </span>
              <span className="mt-3 font-body text-[1.65rem] font-bold leading-snug tracking-tight text-white">
                Guidebook
                <br />
                Wisata Desa
                <br />
                Gaya Baru
              </span>
              <span className="mt-auto flex flex-col gap-1">
                <span className="h-[3px] w-[42px] bg-white/80" aria-hidden />
                <span className="mt-2 font-body text-xs font-semibold text-white/80">
                  Buton Selatan · Buton Selatan
                </span>
                <span className="font-body text-[11px] text-white/55">
                  PDF · gratis diunduh
                </span>
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

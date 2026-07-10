"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { TiltScene, TiltLayer } from "@/components/ui/TiltScene";
import type { Wisata } from "@/types/wisata";

/**
 * Wisata Unggulan, split 2 kolom: teks & daftar (kiri), foto berbingkai (kanan).
 * Daftar interaktif: pilih item → foto & deskripsi berganti (nama di-bold).
 * Tiga elemen miring 3D mengikuti pointer; kiri & kanan berlawanan (cekung ke
 * tengah). Figma node 89:1295.
 *
 * Data destinasi diterima sebagai props dari page beranda (sumber sama dengan
 * halaman /wisata via `@/data/wisata`), ubah di satu tempat, tampil di
 * keduanya.
 */
export function WisataUnggulan({ data }: { data: Wisata[] }) {
  const [active, setActive] = useState(0);
  const current = data[active];

  return (
    <section
      id="wisata-unggulan"
      aria-label="Wisata unggulan Desa Gaya Baru"
      className="bg-white px-5 pt-16 pb-6 sm:px-8 lg:pt-24 lg:pb-8"
    >
      <TiltScene className="mx-auto grid w-full max-w-[1112px] items-center gap-10 lg:grid-cols-[373px_1fr] lg:gap-10">
        {/* Kolom kiri */}
        <Reveal className="flex flex-col gap-12 lg:gap-[7rem]">
          {/* Teks, tilt sedang */}
          <TiltLayer strength={6} className="flex flex-col items-start gap-8">
            <h2 className="font-body text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-[1.1] text-[#31577F]">
              Wisata Unggulan
            </h2>
            <p
              key={active}
              className="min-h-[6.5rem] font-body text-lg leading-relaxed text-[#31577F] motion-safe:animate-gallery-fade"
            >
              <strong className="font-bold text-[#1F3A59]">
                {current.nama}
              </strong>{" "}
             , {current.deskripsi}
            </p>
            <Link
              href="/wisata#daftar-wisata"
              className="inline-flex items-center rounded-md border border-white bg-[#31577F] px-8 py-3 font-body text-sm font-semibold text-white no-underline shadow-sm motion-safe:transition-[transform,filter] motion-safe:duration-200 hover:-translate-y-0.5 hover:[filter:drop-shadow(0_0_16px_rgba(49,87,127,0.55))_drop-shadow(0_0_44px_rgba(49,87,127,0.30))] focus-visible:outline-2 focus-visible:outline-[#31577F] focus-visible:outline-offset-2"
            >
              Lihat Detail
            </Link>
          </TiltLayer>

          {/* Daftar wisata, searah dengan teks (satu sisi kiri) */}
          <TiltLayer strength={7}>
            <ul className="flex flex-col gap-5">
              {data.map((w, i) => (
                <li key={w.nama}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    className={`cursor-pointer border-0 bg-transparent p-0 text-left font-body text-xl font-semibold motion-safe:transition-colors ${
                      i === active
                        ? "text-[#31577F]"
                        : "text-[#3e494b]/30 hover:text-[#31577F]"
                    }`}
                  >
                    {w.nama}
                  </button>
                </li>
              ))}
            </ul>
          </TiltLayer>
        </Reveal>

        {/* Kolom kanan, foto berbingkai tosca, arah kebalikan (cekung ke tengah) */}
        <Reveal delay={120}>
          <TiltLayer
            strength={9}
            flip={-1}
            className="overflow-hidden rounded-xl border-2 border-[#31577F] shadow-card-hover"
          >
            <img
              key={active}
              src={current.imgs[0]}
              alt={current.alt}
              className="aspect-[698/569] w-full object-cover motion-safe:animate-gallery-fade"
              loading="lazy"
            />
          </TiltLayer>
        </Reveal>
      </TiltScene>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { TiltScene, TiltLayer } from "@/components/ui/TiltScene";

/** Daftar wisata — klik untuk ganti foto & deskripsi (Figma node 89:1291) */
const WISATA = [
  {
    name: "Karamba Resto",
    href: "/karamba",
    img: "/images/hero-bg.jpg",
    desc: "menjadi ikon wisata bahari Desa Gerak Makmur — panggung apung tempat menikmati seafood segar dan senja di atas laut Buton Selatan.",
  },
  {
    name: "Singkung",
    href: "/wisata/singkung",
    img: "/images/wisata-pantai.jpg",
    desc: "menyuguhkan hamparan pasir putih dan air laut jernih — tempat sempurna untuk berenang, bersantai, dan menikmati deburan ombak.",
  },
  {
    name: "Wisata 3",
    href: "/wisata",
    img: "/images/wisata-diving.jpg",
    desc: "menghadirkan keindahan bawah laut dengan terumbu karang berwarna — surga bagi penyelam dan pencinta snorkeling.",
  },
  {
    name: "Wisata 4",
    href: "/wisata",
    img: "/images/wisata-mangrove.jpg",
    desc: "menawarkan susur hutan mangrove yang teduh — jalur ekowisata untuk mengenal ekosistem pesisir desa.",
  },
];

/**
 * Wisata Unggulan — split 2 kolom: teks & daftar (kiri), foto berbingkai (kanan).
 * Daftar interaktif: pilih item → foto & deskripsi berganti (nama di-bold).
 * Tiga elemen miring 3D mengikuti pointer; kiri & kanan berlawanan (cekung ke
 * tengah). Figma node 89:1295.
 */
export function WisataUnggulan() {
  const [active, setActive] = useState(0);
  const current = WISATA[active];

  return (
    <section
      id="wisata-unggulan"
      aria-label="Wisata unggulan Desa Gerak Makmur"
      className="bg-white px-5 pt-16 pb-6 sm:px-8 lg:pt-24 lg:pb-8"
    >
      <TiltScene className="mx-auto grid w-full max-w-[1112px] items-center gap-10 lg:grid-cols-[373px_1fr] lg:gap-10">
        {/* Kolom kiri */}
        <Reveal className="flex flex-col gap-12 lg:gap-[7rem]">
          {/* Teks — tilt sedang */}
          <TiltLayer strength={6} className="flex flex-col items-start gap-8">
            <h2 className="font-body text-[clamp(2.5rem,5vw,3.75rem)] font-semibold leading-[1.1] text-[#006572]">
              Wisata Unggulan
            </h2>
            <p
              key={active}
              className="min-h-[6.5rem] font-body text-lg leading-relaxed text-[#006572] motion-safe:animate-gallery-fade"
            >
              <strong className="font-bold text-[#004750]">
                {current.name}
              </strong>{" "}
              {current.desc}
            </p>
            <Link
              href={current.href}
              className="inline-flex items-center rounded-md border border-white bg-[#006572] px-8 py-3 font-body text-sm font-semibold text-white no-underline shadow-sm motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#006572] focus-visible:outline-offset-2"
            >
              Lihat Detail
            </Link>
          </TiltLayer>

          {/* Daftar wisata — searah dengan teks (satu sisi kiri) */}
          <TiltLayer strength={7}>
            <ul className="flex flex-col gap-5">
              {WISATA.map((w, i) => (
                <li key={w.name}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    className={`cursor-pointer border-0 bg-transparent p-0 text-left font-body text-xl font-semibold motion-safe:transition-colors ${
                      i === active
                        ? "text-[#006572]"
                        : "text-[#3e494b]/30 hover:text-[#006572]"
                    }`}
                  >
                    {w.name}
                  </button>
                </li>
              ))}
            </ul>
          </TiltLayer>
        </Reveal>

        {/* Kolom kanan — foto berbingkai tosca, arah kebalikan (cekung ke tengah) */}
        <Reveal delay={120}>
          <TiltLayer
            strength={9}
            flip={-1}
            className="overflow-hidden rounded-xl border-2 border-[#006572] shadow-card-hover"
          >
            <img
              key={active}
              src={current.img}
              alt={current.name}
              className="aspect-[698/569] w-full object-cover motion-safe:animate-gallery-fade"
              loading="lazy"
            />
          </TiltLayer>
        </Reveal>
      </TiltScene>
    </section>
  );
}

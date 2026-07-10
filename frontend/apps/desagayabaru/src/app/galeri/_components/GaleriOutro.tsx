import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { UnggahFoto } from "./UnggahFoto";

/**
 * GaleriOutro, penutup halaman Galeri, mengisi ruang antara grid dan
 * footer: hairline editorial + ajakan warga membagikan dokumentasi
 * (modal Unggah Foto, diverifikasi admin) + link silang ke halaman Wisata.
 */

/** Transisi tombol halus, pola sama dengan CTA GaleriHero/HeroBeranda. */
const BUTTON_MOTION =
  "motion-safe:transition-[transform,filter] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0";

export function GaleriOutro() {
  return (
    <section
      aria-label="Bagikan momen untuk galeri"
      className="bg-white px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28"
    >
      <div className="mx-auto w-full max-w-[1600px] border-t border-outline-variant pt-14 lg:pt-20">
        <Reveal>
          <div className="mx-auto flex w-full max-w-[42rem] flex-col items-center gap-5 text-center">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
              Bagikan Momenmu
            </span>
            <h2 className="font-body text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight text-[#31577F]">
              Punya cerita dalam bingkai?
            </h2>
            <p className="max-w-[34rem] font-body text-base leading-relaxed sm:text-lg">
              <span className="text-[#31577F]">
                Kirimkan foto kegiatan, alam, atau keseharianmu{" "}
              </span>
              <span className="text-[#31577F]/50">
                di Desa Gaya Baru -{" "}
              </span>
              <span className="text-[#31577F]">
                setelah diverifikasi admin, momen terbaik tampil di Lensa
                Gaya Baru.
              </span>
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
              <UnggahFoto />
              <Link
                href="/wisata"
                className={`inline-flex min-h-11 items-center rounded-md border-[1.5px] border-[#31577F] px-8 py-3 font-body text-sm font-semibold text-[#31577F] no-underline hover:bg-[#31577F]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F] ${BUTTON_MOTION}`}
              >
                Jelajahi Wisata
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

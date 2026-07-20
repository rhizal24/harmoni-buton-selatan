"use client";

import dynamic from "next/dynamic";
import { Reveal } from "@/components/ui/Reveal";
import type { Wisata } from "@/types/wisata";

// Leaflet butuh `window`/`document`, wajib dimuat khusus client (ssr:false),
// dan hanya boleh dipanggil dari Client Component (bukan langsung di page
// Server Component), makanya dipisah ke wrapper ini.
const WebGISMapInner = dynamic(
  () => import("./WebGISMapInner").then((m) => m.WebGISMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
        <p className="font-body text-sm text-muted-foreground">Memuat peta…</p>
      </div>
    ),
  },
);

export function PetaWebGIS({ wisata }: { wisata: Wisata[] }) {
  const jumlahBerkoordinat = wisata.filter(
    (w) => w.latitude != null && w.longitude != null,
  ).length;

  return (
    <section
      id="peta-interaktif"
      aria-label="Peta interaktif Desa Gaya Baru"
      className="bg-white px-5 pt-16 pb-6 sm:px-8 lg:pt-24 lg:pb-8"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
              <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
              Peta Interaktif
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#31577F]">
              Jelajahi Peta Desa
            </h2>
            <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#31577F]/80">
              Geser dan perbesar peta untuk melihat sebaran destinasi wisata
              Desa Gaya Baru.{" "}
              {jumlahBerkoordinat > 0
                ? "Klik penanda untuk membuka detail tiap titik, atau pakai tombol filter di pojok peta."
                : "Titik lokasi akan tampil setelah admin melengkapi koordinatnya."}
            </p>
          </div>
        </Reveal>

        <Reveal delay={90} dropTransformWhenVisible>
          <div className="h-[65vh] min-h-[420px] w-full overflow-hidden rounded-xl border-[1.5px] border-[#31577F] lg:h-[75vh]">
            <WebGISMapInner wisata={wisata} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

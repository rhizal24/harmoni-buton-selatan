import { Reveal } from "@/components/ui/Reveal";

interface PetaGambarItem {
  judul: string;
  deskripsi: string;
  src: string | null;
}

/**
 * GambarPeta — 2 peta statis (bukan interaktif): Peta Wisata Gerak Makmur
 * & Peta Batas Dusun. Sumber: `villages.peta_wisata_url` / `peta_dusun_url`
 * (dikelola admin di /admin/peta). Kosong → kartu placeholder "belum
 * diunggah", bukan gambar rusak.
 */
export function GambarPeta({
  petaWisataUrl,
  petaDusunUrl,
}: {
  petaWisataUrl?: string | null;
  petaDusunUrl?: string | null;
}) {
  const items: PetaGambarItem[] = [
    {
      judul: "Peta Wisata Gerak Makmur",
      deskripsi: "Sebaran destinasi wisata unggulan dalam satu peta desa.",
      src: petaWisataUrl ?? null,
    },
    {
      judul: "Peta Batas Dusun",
      deskripsi: "Pembagian wilayah administratif tiap dusun di desa.",
      src: petaDusunUrl ?? null,
    },
  ];

  return (
    <section
      id="gambar-peta"
      aria-label="Peta wisata dan peta batas dusun"
      className="bg-white px-5 pt-6 pb-16 sm:px-8 lg:pt-8 lg:pb-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
              <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
              Peta Wilayah
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
              Peta Wisata &amp; Batas Dusun
            </h2>
            <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#006572]/80">
              Dua peta rujukan resmi desa — klik gambar untuk melihat versi
              penuhnya.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.judul} delay={i * 90}>
              <figure className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-white p-3">
                {item.src ? (
                  <a
                    href={item.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buka ${item.judul} ukuran penuh`}
                    className="group block overflow-hidden rounded-md border border-outline-variant"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.judul}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                    />
                  </a>
                ) : (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-outline-variant bg-surface-container-low">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                      className="text-[#006572]/40"
                    >
                      <path
                        d="M3 17l5-5 4 4 5-6 4 5M4 20h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="font-body text-sm font-semibold text-[#006572]/50">
                      Peta belum diunggah
                    </p>
                  </div>
                )}
                <figcaption className="px-1.5 pb-1">
                  <p className="font-body text-base font-bold text-[#006572]">
                    {item.judul}
                  </p>
                  <p className="mt-0.5 font-body text-sm text-[#006572]/70">
                    {item.deskripsi}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

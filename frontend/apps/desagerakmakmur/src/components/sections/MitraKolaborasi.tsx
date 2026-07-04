import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";

/** Mitra dummy — ganti dengan data/logo asli nanti */
const MITRA = [
  "KKN-PPM UGM",
  "Pemdes Gerak Makmur",
  "Dinas Pariwisata",
  "BUMDes Bahari",
  "Pokdarwis",
  "Karang Taruna",
  "Dekranasda",
  "Bank Sultra",
];

/**
 * Mitra Kolaborasi — judul center + baris logo. Figma node 92:1432 / 94:1444.
 */
export function MitraKolaborasi() {
  return (
    <section
      id="mitra-kolaborasi"
      aria-label="Mitra kolaborasi"
      className="bg-white py-16 lg:py-24"
    >
      {/* Header tetap di dalam container */}
      <div className="mx-auto w-full max-w-[1112px] px-5 sm:px-8">
        <hr className="mb-12 border-t border-[#006572]/15" />
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="font-body text-[clamp(2rem,4vw,2.5rem)] font-semibold text-[#006572]">
            Mitra Kolaborasi
          </h2>
          <p className="mt-4 max-w-[754px] font-body text-lg leading-relaxed text-[#006572]">
            Berkolaborasi dengan berbagai mitra untuk mendukung pengembangan
            pariwisata dan potensi lokal Desa Gerak Makmur dalam kegiatan
            KKN-PPM UGM tahun ini.
          </p>
        </div>
      </div>

      {/* Baris mitra — full-bleed selebar layar, tepi fade */}
      <Reveal>
        <Marquee itemClassName="pr-4" speed={0.4}>
          {MITRA.map((m) => (
            <button
              key={m}
              type="button"
              className="flex h-[108px] w-[190px] cursor-pointer items-center justify-center rounded-lg border-0 bg-[#d9d9d9] px-3 text-center font-body text-sm font-semibold text-[#006572] grayscale motion-safe:transition-[filter,box-shadow] motion-safe:duration-300 hover:grayscale-0 hover:shadow-[0_0_18px_rgba(0,101,114,0.45),0_0_44px_rgba(0,101,114,0.22)] active:shadow-[0_0_22px_rgba(0,101,114,0.65),0_0_54px_rgba(0,101,114,0.35)]"
            >
              {m}
            </button>
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}

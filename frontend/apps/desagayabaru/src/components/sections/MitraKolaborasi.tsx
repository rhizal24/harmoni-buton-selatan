import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { getMitra } from "@/data/mitra";

/**
 * Mitra Kolaborasi — judul center + baris logo. Figma node 92:1432 / 94:1444.
 * Data via `@/data/mitra` (Server Component async).
 */
export async function MitraKolaborasi() {
  const mitra = await getMitra();
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
            pariwisata dan potensi lokal Desa Gaya Baru dalam kegiatan
            KKN-PPM UGM tahun ini.
          </p>
        </div>
      </div>

      {/* Baris mitra — full-bleed selebar layar, tepi fade */}
      <Reveal>
        <Marquee itemClassName="pr-4" speed={0.4}>
          {mitra.map((m) => (
            <button
              key={m.nama}
              type="button"
              className="flex h-[108px] w-[190px] cursor-pointer items-center justify-center rounded-lg border-0 bg-[#d9d9d9] px-3 text-center font-body text-sm font-semibold text-[#006572] [filter:grayscale(1)] motion-safe:transition-[filter] motion-safe:duration-300 hover:[filter:grayscale(0)_drop-shadow(0_0_16px_rgba(0,101,114,0.55))_drop-shadow(0_0_44px_rgba(0,101,114,0.30))] active:[filter:grayscale(0)_drop-shadow(0_0_20px_rgba(0,101,114,0.7))_drop-shadow(0_0_54px_rgba(0,101,114,0.4))]"
            >
              {m.nama}
            </button>
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}

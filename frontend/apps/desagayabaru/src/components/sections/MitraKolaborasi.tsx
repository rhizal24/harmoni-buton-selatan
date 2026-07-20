import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { getMitra } from "@/data/mitra";

/**
 * Mitra Kolaborasi, judul center + baris logo. Figma node 92:1432 / 94:1444.
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
        <hr className="mb-12 border-t border-[#31577F]/15" />
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="font-body text-[clamp(2rem,4vw,2.5rem)] font-semibold text-[#31577F]">
            Mitra Kolaborasi
          </h2>
          <p className="mt-4 max-w-[754px] font-body text-lg leading-relaxed text-[#31577F]">
            Berkolaborasi dengan berbagai mitra untuk mendukung pengembangan
            pariwisata dan potensi lokal Desa Gaya Baru dalam kegiatan
            KKN-PPM UGM tahun ini.
          </p>
        </div>
      </div>

      {/* Baris mitra, full-bleed selebar layar, tepi fade. Kotak SAMA besar
          untuk semua logo (h-24 w-40), lebar ikut rasio asli tiap logo
          (`w-auto`) sempat dicoba, tapi logo lebar (mis. Pupuk Kaltim) jadi
          "makan" ruang dan bikin gap di sebelahnya kelihatan mengecil,
          padahal gap CSS-nya sama. Kotak tetap + `object-contain` bikin gap
          antar logo benar-benar rata secara visual. Tanpa
          background/grayscale, warna logo asli. */}
      <Reveal>
        <Marquee itemClassName="pr-6" speed={0.7}>
          {mitra.map((m) => (
            <div
              key={m.nama}
              className="flex h-24 w-40 shrink-0 items-center justify-center"
            >
              {m.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo statis di /public/sponsor
                <img
                  src={m.logo}
                  alt={m.nama}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-center font-body text-sm font-semibold text-[#31577F]">
                  {m.nama}
                </span>
              )}
            </div>
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}

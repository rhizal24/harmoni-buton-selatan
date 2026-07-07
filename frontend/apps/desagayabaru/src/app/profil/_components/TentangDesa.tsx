import { Reveal } from "@/components/ui/Reveal";
import { getTentang } from "@/data/profil";

/**
 * Tentang Desa — deskripsi singkat pembuka halaman Profil, narasi lebar-baca
 * (max 760px). Data via `@/data/profil` (Server Component async).
 */
export async function TentangDesa() {
  const tentang = await getTentang();
  return (
    <section
      id="tentang"
      aria-label="Tentang Desa Gaya Baru"
      className="bg-[#f6fafb] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
              <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
              Tentang Desa
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
              Sekilas Desa
            </h2>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex max-w-[760px] flex-col gap-4">
            {tentang.map((p, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-[#006572]/85"
              >
                {p}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

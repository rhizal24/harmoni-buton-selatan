import { Reveal } from "@/components/ui/Reveal";
import { BorderGlow, TiltCard, ParallaxHover } from "@/components/ui";
import { getStatistik } from "@/data/profil";

/**
 * Statistik Desa — grid kartu angka (card-profil-stat: primary-container).
 * Interaksi hover berlapis: TiltCard (kartu miring 3D) → BorderGlow (glow
 * tosca di tepi) → ParallaxHover (angka zoom + geser mengikuti kursor).
 * Data via `@/data/profil` (Server Component async).
 */
export async function StatistikDesa() {
  const statistik = await getStatistik();
  return (
    <section
      id="statistik"
      aria-label="Statistik desa"
      className="bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
              <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
              Data Desa
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
              Desa dalam Angka
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col gap-12">
          {statistik.map((group) => (
            <div key={group.judul} className="flex flex-col gap-6">
              {/* Sub judul kelompok + hairline pengisi */}
              <Reveal>
                <div className="flex items-center gap-4">
                  <h3 className="shrink-0 font-body text-xl font-semibold text-[#006572]">
                    {group.judul}
                  </h3>
                  <span className="h-px flex-1 bg-[#006572]/15" aria-hidden />
                </div>
              </Reveal>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {group.items.map((s, i) => (
                  <Reveal key={s.label} delay={i * 90} className="h-full">
                    <TiltCard className="h-full cursor-pointer" max={7}>
                      <BorderGlow
                        className="h-full"
                        backgroundColor="#CFF1F4"
                        borderRadius={12}
                        glowRadius={36}
                        glowIntensity={1.8}
                        edgeSensitivity={18}
                      >
                        <ParallaxHover className="h-full" shift={8} zoom={1.03}>
                          <div className="flex h-full flex-col gap-2 p-6 text-[#00434B]">
                            <span className="font-body text-[clamp(2rem,4vw,2.5rem)] font-semibold leading-none">
                              {s.value}
                            </span>
                            <span className="font-body text-sm font-medium">{s.label}</span>
                          </div>
                        </ParallaxHover>
                      </BorderGlow>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Reveal } from "@/components/ui/Reveal";
import { BorderGlow } from "@/components/ui";
import { getVisiMisi } from "@/data/profil";

function CheckIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-1 shrink-0 text-[#31577F]"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/**
 * Visi & Misi, kartu visi (tosca solid, highlight) + daftar misi berpoin.
 * Data via `@/data/profil` (Server Component async).
 */
export async function VisiMisi() {
  const { visi, misi } = await getVisiMisi();
  return (
    <section
      id="visi-misi"
      aria-label="Visi dan misi desa"
      className="bg-[#f7f9fc] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
              <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
              Arah &amp; Tujuan
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#31577F]">
              Visi &amp; Misi
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Visi, kartu highlight tosca; glow lebih terang agar kontras dgn bg gelap */}
          <Reveal>
            <BorderGlow
              className="h-full"
              backgroundColor="#31577F"
              borderRadius={24}
              glowRadius={48}
              glowIntensity={1.8}
              edgeSensitivity={18}
              glowColor="187 80 72"
              colors={["#A9C4E8", "#D9E4F1", "#4A76A8"]}
            >
              <div className="flex h-full flex-col gap-4 p-7 text-white sm:p-8">
                <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Visi
                </span>
                <p className="font-body text-xl leading-relaxed">{visi}</p>
              </div>
            </BorderGlow>
          </Reveal>

          {/* Misi, daftar berpoin */}
          <Reveal delay={120}>
            <BorderGlow
              className="h-full"
              backgroundColor="#FFFFFF"
              borderRadius={24}
              glowRadius={48}
              glowIntensity={1.8}
              edgeSensitivity={18}
            >
              <div className="flex h-full flex-col gap-4 p-7 sm:p-8">
                <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#31577F]/60">
                  Misi
                </span>
                <ul className="flex flex-col gap-3.5">
                  {misi.map((m, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="font-body text-base leading-relaxed text-[#31577F]/85">
                        {m}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </BorderGlow>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

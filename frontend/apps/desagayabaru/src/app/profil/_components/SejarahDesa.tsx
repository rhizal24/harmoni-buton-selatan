import { Reveal } from "@/components/ui/Reveal";
import { TiltCard, BorderGlow } from "@/components/ui";
import { getSejarah } from "@/data/profil";

/**
 * Sejarah Desa, narasi (kiri) + foto berbingkai dengan efek 3D tilt (kanan).
 * Data via `@/data/profil` (Server Component async).
 */
export async function SejarahDesa() {
  const sejarah = await getSejarah();
  return (
    <section
      id="sejarah"
      aria-label="Sejarah Desa Gaya Baru"
      className="bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-[1112px] items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        <Reveal className="flex flex-col items-start gap-5">
          <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
            <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
            Sejarah
          </span>
          <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#31577F]">
            Jejak Desa
          </h2>
          <div className="flex flex-col gap-4">
            {sejarah.map((p, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-[#31577F]/85"
              >
                {p}
              </p>
            ))}
          </div>
        </Reveal>

        {/* Foto desa, tilt 3D + border glow mengikuti kursor */}
        <Reveal delay={120}>
          <TiltCard className="cursor-pointer">
            <BorderGlow
              backgroundColor="#f7f9fc"
              borderRadius={24}
              glowRadius={56}
              glowIntensity={1.8}
              edgeSensitivity={18}
            >
              <div className="aspect-[4/5] w-full">
                <img
                  src="/images/hero-bg.jpg"
                  alt="Panorama pesisir desa, Desa Gaya Baru"
                  className="h-full w-full object-cover"
                />
              </div>
            </BorderGlow>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  );
}

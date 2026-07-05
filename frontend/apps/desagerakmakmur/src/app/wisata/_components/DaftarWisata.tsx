import { Reveal } from "@/components/ui/Reveal";

interface Destinasi {
  nama: string;
  desc: string;
  img: string;
  alt: string;
}

const DESTINASI: Destinasi[] = [
  {
    nama: "Pantai Pesisir Sampolawa",
    desc: "Hamparan pasir putih dan air jernih — spot terbaik menikmati matahari terbenam Buton Selatan.",
    img: "/images/wisata-pantai.jpg",
    alt: "Pantai berpasir putih di Desa Gerak Makmur",
  },
  {
    nama: "Snorkeling & Diving",
    desc: "Terumbu karang hidup dan biota laut beragam, cocok untuk penyelam pemula maupun berpengalaman.",
    img: "/images/wisata-diving.jpg",
    alt: "Terumbu karang bawah laut",
  },
  {
    nama: "Hutan Mangrove",
    desc: "Susur kanal mangrove dengan perahu, mengenal ekosistem pesisir bersama warga desa.",
    img: "/images/wisata-mangrove.jpg",
    alt: "Kawasan hutan mangrove pesisir",
  },
];

/**
 * Daftar Wisata — section contoh setelah hero (target anchor #daftar-wisata).
 * Grid kartu destinasi. Container & spacing mengikuti standar situs
 * (`max-w-[1112px]` + `px-5 sm:px-8`) agar konsisten. Colocated route-spesifik.
 *
 * Asset cap (`bawah.avif`) & gerak parallax + blur hero ditangani oleh
 * `ScrollCoverReveal` yang membungkus blok ini di `page.tsx`.
 */
export function DaftarWisata() {
  return (
    <section
      id="daftar-wisata"
      aria-label="Daftar destinasi wisata"
      className="bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Header rata kiri — selaras dengan hero */}
        <div className="flex flex-col items-start gap-4">
          <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
            <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
            Destinasi
          </span>
          <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
            Daftar Wisata
          </h2>
          <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#006572]/80">
            Pilih destinasi untuk memulai eksplorasi — dari pantai, bawah laut,
            hingga hutan mangrove yang dikelola bersama masyarakat pesisir.
          </p>
        </div>

        {/* Grid kartu destinasi */}
        <div className="grid gap-6 md:grid-cols-3">
          {DESTINASI.map((d, i) => (
            <Reveal key={d.nama} delay={i * 90}>
              <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#006572]/20 bg-[#f6fafb] motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-card-hover">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={d.img}
                    alt={d.alt}
                    loading="lazy"
                    className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-body text-xl font-bold leading-tight text-[#006572]">
                    {d.nama}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-[#006572]/80">
                    {d.desc}
                  </p>
                  <a
                    href="#"
                    className="mt-3 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-[#006572] no-underline motion-safe:transition-transform motion-safe:duration-200 hover:gap-2.5"
                  >
                    Selengkapnya
                    <span aria-hidden>→</span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

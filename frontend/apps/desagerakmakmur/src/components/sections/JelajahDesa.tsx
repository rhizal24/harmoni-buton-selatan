import { Reveal } from "@/components/ui/Reveal";

interface Paket {
  nama: string;
  desc: string;
  harga: string;
  benefits: string[];
  /** kartu dengan tombol terisi (highlight) — di tengah */
  highlight?: boolean;
}

const PAKET: Paket[] = [
  {
    nama: "Senja di Karamba",
    desc: "Tur singkat menikmati sunset",
    harga: "150.000",
    benefits: ["Akses dermaga apung", "Susur laut 45 menit", "Welcome drink"],
  },
  {
    nama: "Susur Teluk Karamba",
    desc: "Perahu keliling teluk + seafood",
    harga: "250.000",
    highlight: true,
    benefits: ["Perahu privat", "Makan siang seafood", "Pemandu lokal"],
  },
  {
    nama: "Panen Karamba",
    desc: "Ikut memanen hasil budidaya",
    harga: "120.000",
    benefits: ["Edukasi budidaya", "Panen ikan bersama", "Snack khas Busel"],
  },
];

function CheckIcon() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-[#006572]"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const WA_LINK = "https://wa.me/6281234567890";

function PaketCard({ paket }: { paket: Paket }) {
  return (
    <article className="flex flex-col justify-between gap-8 rounded-xl border border-[#006572]/30 bg-[#f6fafb] p-5 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-card-hover">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="font-body text-[1.375rem] font-bold leading-tight text-[#006572]">
            {paket.nama}
          </h3>
          <p className="font-body text-xs font-medium text-[#006572]">
            {paket.desc}
          </p>
        </div>

        <p className="flex items-end gap-1 font-body text-[#006572]">
          <span className="text-[1.75rem] font-semibold leading-none">
            Rp {paket.harga}
          </span>
          <span className="text-xs font-medium">/pax</span>
        </p>

        <ul className="flex flex-col gap-3">
          {paket.benefits.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <CheckIcon />
              <span className="font-body text-xs font-medium text-[#006572]">
                {b}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href={`${WA_LINK}?text=${encodeURIComponent(`Halo, saya mau pesan ${paket.nama}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex h-[46px] items-center justify-center rounded-md border-[1.5px] px-8 font-body text-sm font-semibold no-underline shadow-sm motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#006572] focus-visible:outline-offset-2 ${
          paket.highlight
            ? "border-white bg-[#006572] text-white"
            : "border-[#006572] bg-transparent text-[#006572]"
        }`}
      >
        Pesan Sekarang via WhatsApp
      </a>
    </article>
  );
}

/**
 * Jelajah Desa — 3 kartu paket wisata Karamba.
 * Header rata kanan (paragraf • dash • judul). Figma node 92:1395.
 */
export function JelajahDesa() {
  return (
    <section
      id="jelajah-desa"
      aria-label="Jelajah Desa — paket wisata Karamba"
      className="bg-white px-5 pt-6 pb-16 sm:px-8 lg:pt-8 lg:pb-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Header rata kanan */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-end md:gap-7">
          <p className="max-w-[45rem] font-body text-lg leading-relaxed text-[#006572] md:text-right">
            Temukan pengalaman terbaik melalui perjalanan yang membawa Anda lebih
            dekat dengan keindahan alam dan kehidupan masyarakat pesisir.
          </p>
          <span className="hidden h-[3px] w-[42px] shrink-0 bg-[#006572] md:block" aria-hidden />
          <h2 className="whitespace-nowrap font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
            Jelajah Desa
          </h2>
        </div>

        {/* Kartu */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PAKET.map((paket, i) => (
            <Reveal key={paket.nama} delay={i * 90}>
              <PaketCard paket={paket} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

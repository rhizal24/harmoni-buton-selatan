import { Reveal } from "@/components/ui/Reveal";

export interface Paket {
  nama: string;
  desc: string;
  harga: string;
  benefits: string[];
  /** kartu dengan tombol terisi (highlight), di tengah */
  highlight?: boolean;
}

const PAKET_DEFAULT: Paket[] = [
  {
    nama: "Senja di Pantai",
    desc: "Tur singkat menikmati sunset",
    harga: "150.000",
    benefits: ["Akses area pantai", "Susur pesisir 45 menit", "Welcome drink"],
  },
  {
    nama: "Jelajah Taman Terumbu",
    desc: "Snorkeling + perahu keliling",
    harga: "250.000",
    highlight: true,
    benefits: ["Perahu privat", "Alat snorkeling", "Pemandu lokal"],
  },
  {
    nama: "Susur Mangrove",
    desc: "Ekowisata hutan mangrove",
    harga: "120.000",
    benefits: ["Edukasi ekosistem", "Jalur susur mangrove", "Snack khas Busel"],
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
      className="shrink-0 text-[#31577F]"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const WA_LINK = "https://wa.me/6281234567890";

function PaketCard({ paket }: { paket: Paket }) {
  return (
    <article className="flex flex-col justify-between gap-8 rounded-xl border border-[#31577F]/30 bg-[#f7f9fc] p-5 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-card-hover">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="font-body text-[1.375rem] font-bold leading-tight text-[#31577F]">
            {paket.nama}
          </h3>
          <p className="font-body text-xs font-medium text-[#31577F]">
            {paket.desc}
          </p>
        </div>

        <p className="flex items-end gap-1 font-body text-[#31577F]">
          <span className="text-[1.75rem] font-semibold leading-none">
            Rp {paket.harga}
          </span>
          <span className="text-xs font-medium">/pax</span>
        </p>

        <ul className="flex flex-col gap-3">
          {paket.benefits.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <CheckIcon />
              <span className="font-body text-xs font-medium text-[#31577F]">
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
        className={`inline-flex h-[46px] items-center justify-center rounded-md border-[1.5px] px-8 font-body text-sm font-semibold no-underline shadow-sm motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#31577F] focus-visible:outline-offset-2 ${
          paket.highlight
            ? "border-white bg-[#31577F] text-white"
            : "border-[#31577F] bg-transparent text-[#31577F]"
        }`}
      >
        Pesan Sekarang via WhatsApp
      </a>
    </article>
  );
}

/**
 * Jelajah Desa, 3 kartu paket wisata desa.
 * Header rata kanan (paragraf • dash • judul). Figma node 92:1395.
 */
export function JelajahDesa({ items = PAKET_DEFAULT }: { items?: Paket[] }) {
  return (
    <section
      id="jelajah-desa"
      aria-label="Jelajah Desa, paket wisata desa"
      className="bg-white px-5 pt-6 pb-16 sm:px-8 lg:pt-8 lg:pb-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Header rata kanan */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-end md:gap-7">
          <p className="max-w-[45rem] font-body text-lg leading-relaxed text-[#31577F] md:text-right">
            Temukan pengalaman terbaik melalui perjalanan yang membawa Anda lebih
            dekat dengan keindahan alam dan kehidupan masyarakat pesisir.
          </p>
          <span className="hidden h-[3px] w-[42px] shrink-0 bg-[#31577F] md:block" aria-hidden />
          <h2 className="whitespace-nowrap font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#31577F]">
            Jelajah Desa
          </h2>
        </div>

        {/* Kartu */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((paket, i) => (
            <Reveal key={paket.nama} delay={i * 90}>
              <PaketCard paket={paket} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

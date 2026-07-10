import Link from "next/link";
import {
  WhatsAppIcon,
  MailIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/ui";

/* ── Kolom navigasi (link internal) ───────────────────────────────── */
const NAV_COLS: {
  title: string;
  links: { label: string; href: string; active?: boolean }[];
}[] = [
  {
    title: "Jelajah",
    links: [
      { label: "Beranda", href: "/", active: true },
      { label: "Wisata", href: "/wisata" },
      { label: "Galeri", href: "/galeri" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Profil Desa", href: "/profil" },
      { label: "Peta Infografis", href: "/peta" },
      { label: "Berita", href: "/informasi/berita" },
    ],
  },
];

/* ── Kontak langsung: perangkat desa (WA) + email desa ────────────────
 * TODO(data): ganti nama, jabatan, dan nomor WA dengan data asli.
 * `phone` format internasional tanpa "+" / spasi, mis. 6281234567890.  */
const PERANGKAT: { name: string; jabatan: string; phone: string }[] = [
  { name: "La Ode …", jabatan: "Kepala Desa", phone: "6281234567890" },
  { name: "Wa Ode …", jabatan: "Sekretaris Desa", phone: "6281234567890" },
];

const EMAIL_DESA = "desagayabaru@butonselatan.go.id";

/* ── Sosial media ─────────────────────────────────────────────────────
 * TODO(data): ganti href dengan link/username asli.                     */
const SOSMED: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Instagram", href: "#", icon: <InstagramIcon /> },
  { label: "TikTok", href: "#", icon: <TikTokIcon /> },
  { label: "Facebook", href: "#", icon: <FacebookIcon /> },
];

/**
 * Footer, brand kiri lebar, kolom navigasi, kolom kontak perangkat desa
 * (direct WhatsApp + email), kolom sosmed. Semua kontak diberi icon.
 * Tagline italik di tengah, divider, copyright. Background tosca solid.
 */
export function Footer() {
  return (
    <footer className="bg-[#31577F] px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-16">
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Bagian atas: brand + kolom */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* Brand */}
          <div className="flex max-w-[324px] flex-col gap-5">
            <img
              src="/assets/caheabusel-footer.avif"
              alt="Cahea Busel"
              className="h-24 w-auto self-start"
              loading="lazy"
            />
            <p className="font-body text-base leading-relaxed text-white">
              Bergerak bersama menuju kemakmuran, Kabupaten Buton
              Selatan, Sulawesi Tenggara. Dikembangkan bersama KKN-PPM UGM.
            </p>
          </div>

          {/* Kolom link + kontak + sosmed */}
          <div className="grid flex-1 grid-cols-2 gap-8 lg:grid-cols-4">
            {/* Navigasi internal */}
            {NAV_COLS.map((col) => (
              <nav
                key={col.title}
                aria-label={col.title}
                className="flex flex-col gap-3.5"
              >
                <span className="font-body text-xl font-bold text-white">
                  {col.title}
                </span>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className={`font-body text-sm no-underline motion-safe:transition-colors hover:text-white ${
                      l.active ? "font-bold text-white" : "text-white/60"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            ))}

            {/* Kontak: perangkat desa (WA) + email */}
            <nav aria-label="Kontak" className="flex flex-col gap-3.5">
              <span className="font-body text-xl font-bold text-white">
                Kontak
              </span>
              {PERANGKAT.map((p) => (
                <a
                  key={p.name + p.jabatan}
                  href={`https://wa.me/${p.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 no-underline"
                >
                  <WhatsAppIcon className="mt-0.5 shrink-0 text-white/60 motion-safe:transition-colors group-hover:text-white" />
                  <span className="font-body text-sm leading-tight text-white/60 motion-safe:transition-colors group-hover:text-white">
                    <span className="block font-bold text-white">{p.name}</span>
                    {p.jabatan}
                  </span>
                </a>
              ))}
              <a
                href={`mailto:${EMAIL_DESA}`}
                className="group flex items-center gap-2.5 no-underline"
              >
                <MailIcon className="shrink-0 text-white/60 motion-safe:transition-colors group-hover:text-white" />
                <span className="font-body text-sm text-white/60 motion-safe:transition-colors group-hover:text-white">
                  Email Desa
                </span>
              </a>
            </nav>

            {/* Sosmed */}
            <nav aria-label="Ikuti Kami" className="flex flex-col gap-3.5">
              <span className="font-body text-xl font-bold text-white">
                Ikuti Kami
              </span>
              {SOSMED.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 no-underline"
                >
                  <span className="shrink-0 text-white/60 motion-safe:transition-colors group-hover:text-white">
                    {s.icon}
                  </span>
                  <span className="font-body text-sm text-white/60 motion-safe:transition-colors group-hover:text-white">
                    {s.label}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Tagline + divider + copyright, semua di tengah */}
        <div className="flex flex-col items-center gap-7">
          <p className="text-center font-body text-base font-bold italic text-white">
            “Melangkah Bersama, Gaya Baru Sejahtera”
          </p>
          <hr className="w-full border-t border-white/40" />
          <p className="text-center font-body text-sm text-white">
            © {new Date().getFullYear()} Pemerintah Desa Gaya Baru. Powered by
            KKN-PPM UGM Cahea Busel 2026.
          </p>
        </div>
      </div>
    </footer>
  );
}

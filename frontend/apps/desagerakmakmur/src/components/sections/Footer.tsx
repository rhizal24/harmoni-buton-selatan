import Link from "next/link";

/* ── Kolom navigasi (link internal) ───────────────────────────────── */
const NAV_COLS: {
  title: string;
  links: { label: string; href: string; active?: boolean }[];
}[] = [
  {
    title: "Jelajah",
    links: [
      { label: "Beranda", href: "/", active: true },
      { label: "Karamba", href: "/karamba" },
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
      { label: "UMKM", href: "/informasi/umkm" },
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

const EMAIL_DESA = "desagerakmakmur@butonselatan.go.id";

/* ── Sosial media ─────────────────────────────────────────────────────
 * TODO(data): ganti href dengan link/username asli.                     */
const SOSMED: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Instagram", href: "#", icon: <InstagramIcon /> },
  { label: "TikTok", href: "#", icon: <TikTokIcon /> },
  { label: "Facebook", href: "#", icon: <FacebookIcon /> },
];

/**
 * Footer — brand kiri lebar, kolom navigasi, kolom kontak perangkat desa
 * (direct WhatsApp + email), kolom sosmed. Semua kontak diberi icon.
 * Tagline italik di tengah, divider, copyright. Background tosca solid.
 */
export function Footer() {
  return (
    <footer className="bg-[#006572] px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-16">
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
              Bergerak bersama menuju kemakmuran — Kecamatan Sampolawa, Buton
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
            “Gerak Bersama, Makmur Berkelanjutan”
          </p>
          <hr className="w-full border-t border-white/40" />
          <p className="text-center font-body text-sm text-white">
            © {new Date().getFullYear()} Pemerintah Desa Gerak Makmur. Powered by
            KKN-PPM UGM Cahea Busel 2026.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Icon (inline SVG, ikut pola ProfileIcon.tsx) ─────────────────── */
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={18}
      height={18}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.72c0 4.47-3.64 8.1-8.11 8.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.19-.31a8.05 8.05 0 0 1-1.24-4.3c0-4.47 3.64-8.1 8.11-8.1Zm-2.6 4.34c-.14 0-.36.05-.55.26-.19.21-.72.71-.72 1.72s.74 1.99.84 2.13c.1.14 1.45 2.22 3.52 3.11.49.21.87.34 1.17.44.49.16.94.13 1.29.08.39-.06 1.21-.49 1.38-.97.17-.48.17-.89.12-.97-.05-.08-.19-.14-.4-.24-.21-.11-1.21-.6-1.4-.66-.19-.07-.32-.11-.46.1-.14.21-.53.66-.65.8-.12.14-.24.16-.44.05-.21-.11-.87-.32-1.66-1.02-.61-.55-1.03-1.22-1.15-1.43-.12-.21-.01-.32.09-.43.09-.09.21-.24.31-.36.1-.12.14-.21.21-.35.07-.14.03-.26-.02-.37-.05-.1-.46-1.11-.63-1.52-.17-.4-.34-.35-.46-.35Z" />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={18}
      height={18}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16.5 2h-2.8v12.3a2.6 2.6 0 1 1-2.1-2.55V8.9a5.6 5.6 0 1 0 4.9 5.55V8.7a6.8 6.8 0 0 0 3.9 1.23V7.1a3.9 3.9 0 0 1-3.8-3.9V2Z" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={18}
      height={18}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

import {
  WhatsAppIcon,
  MailIcon,
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
} from "@/components/ui";
import { getFooterContacts, getVillage } from "@/lib/desa";
import { FooterNavLink } from "./FooterNavLink";

/* ── Kolom navigasi (link internal) — mengikuti menu Navbar ─────────── */
const NAV_COLS: {
  title: string;
  links: { label: string; href: string; exact?: boolean }[];
}[] = [
  {
    title: "Jelajah",
    links: [
      { label: "Beranda", href: "/", exact: true },
      { label: "Wisata", href: "/wisata" },
      { label: "Peta Infografis", href: "/peta" },
      { label: "Galeri", href: "/galeri" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Profil Desa", href: "/profil" },
      { label: "Berita & UMKM", href: "/informasi" },
    ],
  },
];

/* ── Fallback — dipakai HANYA bila admin belum mengisi info kontak lewat
 * dashboard (menu "Kontak Footer") atau Supabase tak terjangkau. ────── */
const PERANGKAT_FALLBACK = [
  { name: "La Ode …", jabatan: "Kepala Desa", phone: "6281234567890" },
  { name: "Wa Ode …", jabatan: "Sekretaris Desa", phone: "6281234567890" },
];
const EMAIL_FALLBACK = "desagerakmakmur@butonselatan.go.id";

/**
 * Footer — brand kiri lebar, kolom navigasi, kolom kontak perangkat desa
 * (direct WhatsApp + email), kolom sosmed. Semua kontak diberi icon.
 * Tagline italik di tengah, divider, copyright. Background tosca solid.
 *
 * Server Component: kontak & sosmed diambil dari `villages` +
 * `footer_contacts` (dikelola admin di /admin/kontak), fallback ke data
 * contoh bila belum diisi. Link navigasi (butuh usePathname) dipisah ke
 * `FooterNavLink` (Client Component).
 */
export async function Footer() {
  const [village, contacts] = await Promise.all([
    getVillage().catch(() => null),
    getFooterContacts().catch(() => []),
  ]);

  const perangkat = contacts.length > 0 ? contacts : PERANGKAT_FALLBACK;
  const email = village?.email || EMAIL_FALLBACK;

  const sosmed: { label: string; href: string; icon: React.ReactNode }[] = [];
  if (village?.instagram_url) {
    sosmed.push({ label: "Instagram", href: village.instagram_url, icon: <InstagramIcon /> });
  }
  if (village?.tiktok_url) {
    sosmed.push({ label: "TikTok", href: village.tiktok_url, icon: <TikTokIcon /> });
  }
  if (village?.facebook_url) {
    sosmed.push({ label: "Facebook", href: village.facebook_url, icon: <FacebookIcon /> });
  }

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
                  <FooterNavLink key={l.label} href={l.href} exact={l.exact}>
                    {l.label}
                  </FooterNavLink>
                ))}
              </nav>
            ))}

            {/* Kontak: perangkat desa (WA) + email */}
            <nav aria-label="Kontak" className="flex flex-col gap-3.5">
              <span className="font-body text-xl font-bold text-white">
                Kontak
              </span>
              {perangkat.map((p) => (
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
                href={`mailto:${email}`}
                className="group flex items-center gap-2.5 no-underline"
              >
                <MailIcon className="shrink-0 text-white/60 motion-safe:transition-colors group-hover:text-white" />
                <span className="font-body text-sm text-white/60 motion-safe:transition-colors group-hover:text-white">
                  Email Desa
                </span>
              </a>
            </nav>

            {/* Sosmed — kosong sepenuhnya bila belum ada satu pun diisi admin */}
            {sosmed.length > 0 && (
              <nav aria-label="Ikuti Kami" className="flex flex-col gap-3.5">
                <span className="font-body text-xl font-bold text-white">
                  Ikuti Kami
                </span>
                {sosmed.map((s) => (
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
            )}
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

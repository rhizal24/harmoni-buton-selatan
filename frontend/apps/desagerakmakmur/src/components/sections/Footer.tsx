import Link from "next/link";

const COLS: {
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
  {
    title: "Kontak",
    links: [
      { label: "WhatsApp", href: "https://wa.me/6281234567890" },
      { label: "Instagram", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "Email", href: "mailto:desagerakmakmur@butonselatan.go.id" },
    ],
  },
];

/**
 * Footer — layout & tipografi mengikuti Figma (node 96:187):
 * brand kiri lebar, kolom link 20px bold + link putih 60%, tagline italik
 * di tengah, divider, copyright di tengah. Background tosca solid.
 */
export function Footer() {
  return (
    <footer className="bg-[#006572] px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-16">
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Bagian atas: brand + kolom */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* Brand */}
          <div className="flex max-w-[324px] flex-col gap-5">
            <span className="font-body text-2xl font-bold italic text-white">
              Desa Gerak Makmur
            </span>
            <p className="font-body text-base leading-relaxed text-white">
              Bergerak bersama menuju kemakmuran — Kecamatan Sampolawa, Buton
              Selatan, Sulawesi Tenggara. Dikembangkan bersama KKN-PPM UGM.
            </p>
          </div>

          {/* Kolom link */}
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((col) => (
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

import type { Metadata } from "next";
import "../styles/globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { getVillage } from "@/lib/desa";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gayabaru.caheabusel.com";

export const metadata: Metadata = {
  title: {
    template: "%s | Desa Gaya Baru",
    default: "Desa Gaya Baru, Buton Selatan | Cahea Busel",
  },
  description:
    "Website resmi Desa Gaya Baru, Kecamatan Buton Selatan, Sulawesi Tenggara. Jelajahi wisata Buton Selatan, profil desa, berita, dan galeri Cahea Busel.",
  keywords: [
    "Desa Gaya Baru",
    "Cahea Busel",
    "Wisata Buton Selatan",
    "Buton Selatan",
    "Sulawesi Tenggara",
    "KKN-PPM UGM",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Desa Gaya Baru",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

/**
 * Data terstruktur (schema.org GovernmentOrganization) — bukan tampilan
 * visual, murni sinyal buat mesin pencari (Google, Bing) supaya memahami
 * situs ini sebagai situs resmi pemerintah desa: nama, lokasi, dan tautan
 * ke akun sosmed + situs desa saudara (`sameAs`) yang membantu Google
 * mengaitkan kedua situs Cahea Busel sebagai satu kesatuan.
 */
async function JsonLd() {
  const village = await getVillage().catch(() => null);
  const sameAs = [
    village?.instagram_url,
    village?.tiktok_url,
    village?.facebook_url,
    "https://gerakmakmur.caheabusel.com",
  ].filter((v): v is string => Boolean(v));

  const data = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: "Pemerintah Desa Gaya Baru",
    alternateName: ["Desa Gaya Baru", "Cahea Busel"],
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo-caheabusel.avif`,
    image: `${SITE_URL}/opengraph-image.png`,
    description:
      "Website resmi Desa Gaya Baru, Kecamatan Buton Selatan, Sulawesi Tenggara.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Desa Gaya Baru",
      addressRegion: "Sulawesi Tenggara",
      addressCountry: "ID",
    },
    areaServed: "Kabupaten Buton Selatan",
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON-LD statis, bukan HTML dari input pengguna
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLd />
      </head>
      <body>
        <SiteChrome />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  );
}

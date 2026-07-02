import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Desa Gayabaru",
    default: "Desa Gayabaru — Buton Selatan",
  },
  description:
    "Website resmi Desa Gayabaru, Kecamatan Buton Selatan, Sulawesi Tenggara.",
  keywords: ["Desa Gayabaru", "Buton Selatan", "Sulawesi Tenggara"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://desagayabaru.butonselatan.com"
  ),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Desa Gayabaru",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

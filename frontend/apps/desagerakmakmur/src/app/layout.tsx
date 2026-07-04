import type { Metadata } from "next";
import "../styles/globals.css";
import { Navbar } from "@/components/sections/Navbar";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

export const metadata: Metadata = {
  title: {
    template: "%s | Desa Gerak Makmur",
    default: "Desa Gerak Makmur — Buton Selatan",
  },
  description:
    "Website resmi Desa Gerak Makmur, Kecamatan Buton Selatan, Sulawesi Tenggara.",
  keywords: ["Desa Gerak Makmur", "Buton Selatan", "Sulawesi Tenggara"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://desagerakmakmur.butonselatan.com"
  ),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Desa Gerak Makmur",
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SmoothScroll />
        <Navbar />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  );
}

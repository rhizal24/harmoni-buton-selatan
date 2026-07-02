/**
 * Konstanta aplikasi — Desa Gerak Makmur
 */

export const SITE_NAME = "Desa Gerak Makmur";
export const SITE_URL = "https://desagerakmakmur.butonselatan.com";
export const SITE_DESCRIPTION =
  "Website resmi Desa Gerak Makmur, Kecamatan Buton Selatan, Sulawesi Tenggara.";

/** Navigasi utama */
export const NAV_LINKS = [
  { label: "Beranda",  href: "/" },
  { label: "Tentang",  href: "/tentang" },
  { label: "Berita",   href: "/berita" },
  { label: "Layanan",  href: "/layanan" },
  { label: "Galeri",   href: "/galeri" },
  { label: "Kontak",   href: "/kontak" },
] as const;

/** Informasi kontak desa */
export const CONTACT_INFO = {
  email:   process.env.NEXT_PUBLIC_DESA_EMAIL   ?? "info@desagerakmakmur.butonselatan.com",
  phone:   process.env.NEXT_PUBLIC_DESA_PHONE   ?? "-",
  address: process.env.NEXT_PUBLIC_DESA_ADDRESS ?? "Desa Gerak Makmur, Buton Selatan, Sulawesi Tenggara",
};

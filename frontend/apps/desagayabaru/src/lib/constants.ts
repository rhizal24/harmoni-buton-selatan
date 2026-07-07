/**
 * Konstanta aplikasi — Desa Gaya Baru
 */

export const SITE_NAME = "Desa Gaya Baru";
export const SITE_URL = "https://desagayabaru.butonselatan.com";
export const SITE_DESCRIPTION =
  "Website resmi Desa Gaya Baru, Kecamatan Buton Selatan, Sulawesi Tenggara.";

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
  email:   process.env.NEXT_PUBLIC_DESA_EMAIL   ?? "info@desagayabaru.butonselatan.com",
  phone:   process.env.NEXT_PUBLIC_DESA_PHONE   ?? "-",
  address: process.env.NEXT_PUBLIC_DESA_ADDRESS ?? "Desa Gaya Baru, Buton Selatan, Sulawesi Tenggara",
};

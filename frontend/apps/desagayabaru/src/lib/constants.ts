/**
 * Konstanta aplikasi, Desa Gaya Baru
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

/**
 * Titik tengah default peta WebGIS (/peta), perkiraan area Kecamatan
 * Buton Selatan, Buton Selatan. Hanya menentukan sudut pandang awal peta, bukan
 * data presisi; marker sebenarnya memakai koordinat tiap `tourism_spots`.
 */
export const VILLAGE_MAP_CENTER: [number, number] = [-5.665, 122.722];
export const VILLAGE_MAP_DEFAULT_ZOOM = 12;

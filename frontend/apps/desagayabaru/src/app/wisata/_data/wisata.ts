/**
 * Data destinasi wisata Desa Gaya Baru (route-spesifik, dikonsumsi oleh
 * `../_components/DaftarWisata`).
 *
 * CATATAN — masih PLACEHOLDER: kontak, akun sosmed, titik Google Maps, dan
 * `imgs` perlu diganti dengan data & foto resmi tiap wisata (kini pakai aset
 * sementara di `/public/images`). Teks deskripsi bisa disesuaikan.
 */
export interface Wisata {
  nama: string;
  tagline: string;
  deskripsi: string;
  tags: string[];
  /** Nomor untuk ditampilkan, mis. "+62 812-3456-7890". */
  telepon: string;
  /** Link WhatsApp (wa.me), tanpa "+"/spasi, mis. "6281234567890". */
  wa: string;
  instagram?: string; // URL profil
  tiktok?: string; // URL profil
  facebook?: string; // URL profil
  /** Deep-link Google Maps ke titik lokasi. */
  maps: string;
  /** Beberapa foto untuk slideshow auto-fade (loop). Foto pertama juga dipakai
   *  sebagai thumbnail panel accordion. */
  imgs: string[];
  alt: string;
}

export const WISATA: Wisata[] = [
  {
    nama: "Pantai Gaya Baru",
    tagline: "Pasir putih & senja pesisir",
    deskripsi:
      "Hamparan pasir putih dengan air jernih yang landai — cocok untuk berenang, bermain air, dan menikmati matahari terbenam khas pesisir Buton Selatan. Ikon wisata unggulan Desa Gaya Baru.",
    tags: ["Pantai", "Pasir putih", "Spot sunset", "Area piknik"],
    telepon: "+62 812-0000-0001",
    wa: "6281200000001",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Pantai+Gaya+Baru+Buton+Selatan",
    imgs: ["/images/wisata-pantai.jpg", "/images/hero-bg.jpg", "/images/wisata-diving.jpg"],
    alt: "Pantai Gaya Baru berpasir putih dengan air laut jernih",
  },
  {
    nama: "Taman Terumbu",
    tagline: "Snorkeling di taman karang",
    deskripsi:
      "Gugusan terumbu karang berwarna dengan air laut sebening kaca — surga bagi penyelam dan pencinta snorkeling yang ingin menyapa kehidupan bawah laut Buton Selatan dari dekat.",
    tags: ["Snorkeling", "Terumbu karang", "Diving", "Bawah laut"],
    telepon: "+62 812-0000-0002",
    wa: "6281200000002",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Taman+Terumbu+Gaya+Baru+Buton+Selatan",
    imgs: ["/images/wisata-diving.jpg", "/images/wisata-pantai.jpg", "/images/hero-bg.jpg"],
    alt: "Terumbu karang berwarna di perairan Desa Gaya Baru",
  },
  {
    nama: "Hutan Mangrove",
    tagline: "Susur ekowisata pesisir yang teduh",
    deskripsi:
      "Jalur susur hutan mangrove yang asri dan teduh — ruang belajar ekosistem pesisir sekaligus tempat menikmati ketenangan, jauh dari keramaian, ditemani suara alam dan air yang tenang.",
    tags: ["Ekowisata", "Mangrove", "Jalur susur", "Suasana tenang"],
    telepon: "+62 812-0000-0003",
    wa: "6281200000003",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Hutan+Mangrove+Gaya+Baru+Buton+Selatan",
    imgs: ["/images/wisata-mangrove.jpg", "/images/wisata-diving.jpg", "/images/wisata-pantai.jpg"],
    alt: "Jalur susur hutan mangrove Desa Gaya Baru",
  },
  {
    nama: "Bukit Cakrawala",
    tagline: "Panorama laut dari ketinggian",
    deskripsi:
      "Bukit dengan pandangan luas ke laut lepas — titik terbaik memandang cakrawala dan mengabadikan foto dari ketinggian. Sensasi panorama pesisir yang megah dan berbeda.",
    tags: ["Bukit", "View ketinggian", "Spot foto", "Laut lepas"],
    telepon: "+62 812-0000-0004",
    wa: "6281200000004",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Bukit+Cakrawala+Gaya+Baru+Buton+Selatan",
    imgs: ["/images/hero-bg.jpg", "/images/wisata-pantai.jpg", "/images/wisata-diving.jpg"],
    alt: "Pemandangan laut lepas dari Bukit Cakrawala",
  },
];

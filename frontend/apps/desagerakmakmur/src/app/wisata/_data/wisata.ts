/**
 * Data destinasi wisata Desa Gerak Makmur (route-spesifik, dikonsumsi oleh
 * `../_components/DaftarWisata`).
 *
 * CATATAN — masih PLACEHOLDER: kontak, akun sosmed, titik Google Maps, dan
 * `imgs` perlu diganti dengan data & foto resmi tiap wisata (kini pakai aset
 * sementara di `/public/images`). Teks deskripsi bisa disesuaikan.
 */
import type { Wisata } from "@/types/wisata";
export type { Wisata };

export const WISATA: Wisata[] = [
  {
    nama: "Lasoka",
    latitude: -5.671729,
    longitude: 122.729551,
    tagline: "Kuliner laut di atas keramba apung",
    deskripsi:
      "Restoran apung di atas keramba budi daya — menikmati hidangan hasil laut segar yang diangkat langsung dari kolam di bawah meja, ditemani panorama teluk yang tenang. Ikon wisata unggulan Desa Gerak Makmur.",
    tags: ["Kuliner", "Seafood segar", "Panggung apung", "Ramah keluarga"],
    telepon: "+62 812-3456-7890",
    wa: "6281234567890",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Lasoka+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/wisata-diving.jpg", "/images/hero-bg.jpg", "/images/wisata-pantai.jpg"],
    alt: "Suasana Lasoka di atas perairan Desa Gerak Makmur",
  },
  {
    nama: "La Mancariadi",
    latitude: -5.666321,
    longitude: 122.732958,
    tagline: "Pasir putih & air jernih",
    deskripsi:
      "Hamparan pasir putih dengan air jernih yang landai — cocok untuk berenang, bermain air, dan menikmati matahari terbenam khas pesisir Buton Selatan. Ruang santai terbaik di penghujung hari.",
    tags: ["Pantai", "Pasir putih", "Spot sunset", "Area piknik"],
    telepon: "+62 812-3456-7890",
    wa: "6281234567890",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=La+Mancariadi+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/wisata-pantai.jpg", "/images/wisata-mangrove.jpg", "/images/hero-bg.jpg"],
    alt: "La Mancariadi berpasir putih dengan air laut jernih",
  },
  {
    nama: "Karamba Resto",
    latitude: -5.651176,
    longitude: 122.741252,
    tagline: "Pasir lembut & air jernih untuk snorkeling",
    deskripsi:
      "Hamparan pasir putih yang lembut, air laut jernih, serta deretan pohon kelapa yang rindang — jelajahi keindahan bawah laut lewat snorkeling atau bersantai di bawah teduhnya pepohonan sambil menikmati panorama pesisir yang masih alami.",
    tags: ["Pantai", "Snorkeling", "Pohon kelapa", "Suasana alami"],
    telepon: "+62 812-3456-7890",
    wa: "6281234567890",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Karamba+Resto+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/wisata-mangrove.jpg", "/images/wisata-diving.jpg", "/images/wisata-pantai.jpg"],
    alt: "Karamba Resto berpasir putih dengan pohon kelapa di tepiannya",
  },
  {
    nama: "Sabana",
    latitude: -5.637839,
    longitude: 122.756571,
    tagline: "Tebing tinggi menghadap laut lepas",
    deskripsi:
      "Tebing kokoh dengan pandangan luas ke laut lepas — titik terbaik memandang cakrawala dan mengabadikan foto dari ketinggian. Sensasi panorama pesisir yang megah dan berbeda.",
    tags: ["Tebing", "View ketinggian", "Spot foto", "Laut lepas"],
    telepon: "+62 812-3456-7890",
    wa: "6281234567890",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Sabana+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/hero-bg.jpg", "/images/wisata-pantai.jpg", "/images/wisata-diving.jpg"],
    alt: "Sabana yang menghadap laut lepas",
  },
  {
    nama: "Pantai Singku",
    latitude: -5.643132,
    longitude: 122.758418,
    tagline: "Pasir putih & ombak tenang",
    deskripsi:
      "Pantai berpasir putih dengan ombak tenang — cocok untuk berenang santai maupun sekadar menikmati suasana pesisir Buton Selatan.",
    tags: ["Pantai", "Pasir putih", "Air tenang", "Area piknik"],
    telepon: "+62 812-3456-7890",
    wa: "6281234567890",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Pantai+Singku+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/wisata-pantai.jpg", "/images/wisata-mangrove.jpg", "/images/hero-bg.jpg"],
    alt: "Pantai Singku berpasir putih dengan ombak tenang",
  },
];

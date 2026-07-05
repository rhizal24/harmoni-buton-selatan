/**
 * Data destinasi wisata Desa Gerak Makmur (route-spesifik, dikonsumsi oleh
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
    nama: "Karamba Resto",
    tagline: "Kuliner laut di atas keramba apung",
    deskripsi:
      "Restoran apung di atas keramba budi daya — menikmati hidangan hasil laut segar yang diangkat langsung dari kolam di bawah meja, ditemani panorama teluk yang tenang. Ikon wisata unggulan Desa Gerak Makmur.",
    tags: ["Kuliner", "Seafood segar", "Panggung apung", "Ramah keluarga"],
    telepon: "+62 812-0000-0001",
    wa: "6281200000001",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Karamba+Resto+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/wisata-diving.jpg", "/images/hero-bg.jpg", "/images/wisata-pantai.jpg"],
    alt: "Suasana Karamba Resto di atas perairan Desa Gerak Makmur",
  },
  {
    nama: "Pantai Singku",
    tagline: "Pasir putih & air jernih",
    deskripsi:
      "Hamparan pasir putih dengan air jernih yang landai — cocok untuk berenang, bermain air, dan menikmati matahari terbenam khas pesisir Buton Selatan. Ruang santai terbaik di penghujung hari.",
    tags: ["Pantai", "Pasir putih", "Spot sunset", "Area piknik"],
    telepon: "+62 812-0000-0002",
    wa: "6281200000002",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Pantai+Singku+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/wisata-pantai.jpg", "/images/wisata-mangrove.jpg", "/images/hero-bg.jpg"],
    alt: "Pantai Singku berpasir putih dengan air laut jernih",
  },
  {
    nama: "La Mancariadi",
    tagline: "Panorama alam pesisir yang tersembunyi",
    deskripsi:
      "Kawasan alam yang masih asri dengan bentang hijau dan udara sejuk — destinasi bagi yang mencari ketenangan, susur jalur alam, dan pemandangan lepas yang jarang tersentuh keramaian.",
    tags: ["Alam", "Bentang hijau", "Jalur susur", "Suasana tenang"],
    telepon: "+62 812-0000-0003",
    wa: "6281200000003",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=La+Mancariadi+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/wisata-mangrove.jpg", "/images/wisata-diving.jpg", "/images/wisata-pantai.jpg"],
    alt: "Panorama alam kawasan La Mancariadi",
  },
  {
    nama: "Tebing Lande",
    tagline: "Tebing tinggi menghadap laut lepas",
    deskripsi:
      "Tebing kokoh dengan pandangan luas ke laut lepas — titik terbaik memandang cakrawala dan mengabadikan foto dari ketinggian. Sensasi panorama pesisir yang megah dan berbeda.",
    tags: ["Tebing", "View ketinggian", "Spot foto", "Laut lepas"],
    telepon: "+62 812-0000-0004",
    wa: "6281200000004",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    maps: "https://www.google.com/maps/search/?api=1&query=Tebing+Lande+Gerak+Makmur+Buton+Selatan",
    imgs: ["/images/hero-bg.jpg", "/images/wisata-pantai.jpg", "/images/wisata-diving.jpg"],
    alt: "Tebing Lande yang menghadap laut lepas",
  },
];

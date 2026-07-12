import type { Umkm } from "@/types/umkm";

/**
 * SEED UMKM — placeholder DUMMY sampai data usaha warga asli terkumpul
 * (tampil selama artikel Supabase kategori `umkm` masih kosong).
 * Nomor WA & link toko daring masih contoh — ganti dengan yang asli.
 */
export const UMKM_SEED: Umkm[] = [
  {
    nama: "Abon Ikan Bahari",
    kategori: "Kuliner",
    pemilik: "Kelompok Ibu Nelayan Lande",
    deskripsi:
      "Abon ikan tuna asap hasil laut segar, diolah kelompok ibu nelayan dengan pengasapan tradisional beraroma khas.",
    foto: "/images/wisata-pantai.jpg",
    lokasi: "Dusun Lande, dekat dermaga Karamba",
    wa: "6281200000010",
    olshop: { label: "Shopee", url: "https://shopee.co.id/abonikanbahari" },
    produk: ["Abon tuna 100 g", "Abon tuna 250 g", "Abon pedas"],
    harga: "Rp25.000–Rp60.000",
  },
  {
    nama: "Kerajinan Kerang Lande",
    kategori: "Kriya",
    pemilik: "Karang Taruna Gerak Makmur",
    deskripsi:
      "Suvenir dan aksesori dari kerang pantai Lande: gantungan kunci, bingkai foto, sampai hiasan dinding pesanan.",
    foto: "/images/wisata-mangrove.jpg",
    lokasi: "Balai Karang Taruna, pusat desa",
    wa: "6281200000011",
    olshop: { label: "Tokopedia", url: "https://tokopedia.com/keranglande" },
    produk: ["Gantungan kunci", "Bingkai foto", "Hiasan dinding"],
    harga: "Rp10.000–Rp150.000",
  },
  {
    nama: "Keripik Rumput Laut Wa Ode",
    kategori: "Kuliner",
    pemilik: "Wa Ode Sitti",
    deskripsi:
      "Keripik dan dodol rumput laut dari panen budidaya perairan Karamba — camilan renyah oleh-oleh khas pesisir.",
    foto: "/images/wisata-diving.jpg",
    lokasi: "Dusun Bahari, jalur menuju Karamba",
    wa: "6281200000012",
    produk: ["Keripik original", "Keripik balado", "Dodol rumput laut"],
    harga: "Rp10.000–Rp35.000",
  },
  {
    nama: "Tenun Buton Karya Ina",
    kategori: "Fashion",
    pemilik: "Ina Mariati",
    deskripsi:
      "Kain tenun motif khas Buton ditenun manual dengan alat tradisional; tersedia sarung, selendang, dan kain meteran.",
    foto: "/images/hero-bg.jpg",
    lokasi: "RT 02, samping masjid desa",
    wa: "6281200000013",
    olshop: { label: "Shopee", url: "https://shopee.co.id/tenunkaryaina" },
    produk: ["Sarung tenun", "Selendang", "Kain meteran"],
    harga: "Rp150.000–Rp750.000",
  },
  {
    nama: "Mete Gurih Lande",
    kategori: "Kuliner",
    pemilik: "Kelompok Tani Mete Makmur",
    deskripsi:
      "Kacang mete goreng dan mete mentah dari kebun jambu mete warga — gurih, dipanggang tanpa pengawet.",
    foto: "/images/wisata-pantai.jpg",
    lokasi: "Dusun Wakoko, kebun mete warga",
    wa: "6281200000014",
    olshop: { label: "Tokopedia", url: "https://tokopedia.com/metegurihlande" },
    produk: ["Mete goreng 250 g", "Mete mentah 1 kg", "Mete madu"],
    harga: "Rp35.000–Rp120.000",
  },
  {
    nama: "Ikan Asap Pak La Ode",
    kategori: "Kuliner",
    pemilik: "La Ode Rahmat",
    deskripsi:
      "Cakalang dan tongkol asap langsung dari tangkapan harian, diasap kayu bakau — tahan dibawa perjalanan jauh.",
    foto: "/images/wisata-mangrove.jpg",
    lokasi: "Tepi dermaga lama, Dusun Lande",
    wa: "6281200000015",
    produk: ["Cakalang asap", "Tongkol asap", "Sambal ikan asap"],
    harga: "Rp20.000–Rp80.000",
  },
  {
    nama: "Anyaman Pandan PKK",
    kategori: "Kriya",
    pemilik: "PKK Desa Gerak Makmur",
    deskripsi:
      "Tikar, tas, dan topi anyaman daun pandan buatan ibu-ibu PKK; motif bisa dipesan untuk suvenir acara.",
    foto: "/images/wisata-diving.jpg",
    lokasi: "Balai desa (sekretariat PKK)",
    wa: "6281200000016",
    produk: ["Tikar pandan", "Tas anyaman", "Topi pantai"],
    harga: "Rp15.000–Rp200.000",
  },
  {
    nama: "Warung Dermaga",
    kategori: "Kuliner",
    pemilik: "Keluarga Bapak Samsul",
    deskripsi:
      "Warung kopi dan kudapan di bibir dermaga Karamba — kopi hitam, pisang goreng, dan es kelapa muda sambil menikmati laut.",
    foto: "/images/hero-bg.jpg",
    lokasi: "Kawasan wisata Karamba",
    wa: "6281200000017",
    produk: ["Kopi hitam", "Pisang goreng", "Es kelapa muda"],
    harga: "Rp5.000–Rp25.000",
  },
];

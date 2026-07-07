/**
 * Data Profil Desa Gerak Makmur (route-spesifik, dikonsumsi oleh
 * `../_components/*`).
 *
 * CATATAN — visi-misi, angka statistik, dan susunan perangkat desa masih
 * PLACEHOLDER; ganti dengan data resmi desa (beserta foto di
 * `/public/images`). Deskripsi (TENTANG) dan sejarah sudah konten final.
 */

/** Deskripsi singkat desa — pembuka halaman Profil. */
export const TENTANG: string[] = [
  "Desa Gerak Makmur adalah desa pesisir di Kecamatan Sampolawa, Kabupaten Buton Selatan, Sulawesi Tenggara. Berada di tepi Teluk Lande yang berair jernih dan dikelilingi perbukitan asri, sebagian besar warganya hidup sebagai nelayan dan petani dengan komoditas unggulan ikan budidaya dan bawang merah.",
  "Kehidupan desa diwarnai budaya lokal yang kental — bahasa Cia-Cia dan semangat gotong royong yang masih terjaga. Beberapa tahun terakhir, desa mulai tumbuh sebagai kawasan wisata berbasis masyarakat lewat Karamba Resto, tebing-tebing eksotis, dan spot sunset yang menawan. Bagi warganya, desa ini lebih akrab disapa dengan satu nama: Lande.",
];

/** Paragraf sejarah singkat desa. */
export const SEJARAH: string[] = [
  "Gerak Makmur semula satu kesatuan wilayah dengan Windu Makmur dan Lapandewa Makmur di Kecamatan Sampolawa, sebelum pemekaran memisahkan keduanya. Gerak Makmur tetap di Sampolawa sebagai desa induk — titik awal perkembangan seluruh kawasan.",
  "Meski terbagi secara administratif, warganya tetap terikat pada satu nama warisan turun-temurun: Lande. Nama ini tak tercantum di peta resmi, namun hidup dalam tutur sehari-hari — konon berasal dari wisatawan yang menyamakan lanskapnya dengan London, atau pesawat Jepang yang mencoba mendarat (landing) di kawasan berbatu ini semasa Perang Dunia II.",
];

/** Pernyataan visi desa. */
export const VISI =
  "Placeholder — tuliskan visi Desa Gerak Makmur di sini, mis. mewujudkan desa bahari yang maju, mandiri, dan berkelanjutan.";

/** Poin-poin misi desa. */
export const MISI: string[] = [
  "Placeholder misi pertama — mis. mengembangkan potensi wisata bahari berbasis masyarakat.",
  "Placeholder misi kedua — mis. meningkatkan kualitas layanan publik dan infrastruktur desa.",
  "Placeholder misi ketiga — mis. memberdayakan UMKM dan ekonomi kreatif warga pesisir.",
  "Placeholder misi keempat — mis. menjaga kelestarian lingkungan laut dan pesisir.",
];

import type { StatItem, StatGroup } from "@/types/profil";
export type { StatItem, StatGroup };

/**
 * Statistik desa, dikelompokkan per sub judul (format monografi desa).
 * SEMUA ANGKA masih placeholder — ganti dengan data resmi desa.
 */
export const STATISTIK: StatGroup[] = [
  {
    judul: "Kependudukan",
    items: [
      { label: "Jumlah Penduduk", value: "±2.500" },
      { label: "Penduduk Laki-laki", value: "±1.270" },
      { label: "Penduduk Perempuan", value: "±1.230" },
      { label: "Kepala Keluarga", value: "±680" },
    ],
  },
  {
    judul: "Wilayah & Administrasi",
    items: [
      { label: "Luas Wilayah", value: "12,4 km²" },
      { label: "Jumlah Dusun", value: "4" },
      { label: "Jumlah RT", value: "12" },
      { label: "Jarak ke Pusat Kecamatan", value: "±8 km" },
    ],
  },
  {
    judul: "Mata Pencaharian",
    items: [
      { label: "Nelayan", value: "±450" },
      { label: "Pembudidaya Ikan", value: "±150" },
      { label: "Petani", value: "±380" },
      { label: "Wiraswasta & Pedagang", value: "±120" },
      { label: "PNS & Honorer", value: "±40" },
      { label: "Buruh & Tukang", value: "±90" },
      { label: "Rumah Tangga Nelayan", value: "±320" },
      { label: "Lainnya", value: "±70" },
    ],
  },
];

// Susunan perangkat desa kini berupa bagan hierarki → lihat `./struktur.ts`
// (dirender oleh `../_components/StrukturOrganisasi`).

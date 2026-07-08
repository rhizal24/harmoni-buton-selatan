/**
 * Data Profil Desa Gaya Baru (route-spesifik, dikonsumsi oleh
 * `../_components/*`).
 *
 * CATATAN — SEMUA konten masih PLACEHOLDER (deskripsi, sejarah, visi-misi,
 * angka statistik). Ganti dengan data resmi desa lewat dashboard admin
 * (/admin/profil) atau langsung di file ini.
 */

/** Deskripsi singkat desa — pembuka halaman Profil. */
export const TENTANG: string[] = [
  "Desa Gaya Baru adalah desa pesisir di Kabupaten Buton Selatan, Sulawesi Tenggara. Dikelilingi laut jernih dan perbukitan asri, sebagian besar warganya hidup sebagai nelayan dan petani dengan hasil laut dan kebun sebagai penopang utama ekonomi desa.",
  "Kehidupan desa diwarnai budaya lokal dan semangat gotong royong yang masih terjaga. Beberapa tahun terakhir, desa mulai mengembangkan potensi wisata bahari berbasis masyarakat — dari pantai berpasir putih hingga jalur ekowisata mangrove.",
];

/** Paragraf sejarah singkat desa. */
export const SEJARAH: string[] = [
  "Placeholder — tuliskan asal-usul Desa Gaya Baru di sini: kapan desa berdiri, dari wilayah mana dimekarkan, dan tonggak-tonggak penting perkembangannya.",
  "Placeholder — lanjutkan dengan cerita atau warisan turun-temurun yang melekat pada desa: asal nama, tradisi, atau peristiwa bersejarah yang membentuk identitas warganya.",
];

/** Pernyataan visi desa. */
export const VISI =
  "Placeholder — tuliskan visi Desa Gaya Baru di sini, mis. mewujudkan desa bahari yang maju, mandiri, dan berkelanjutan.";

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
      { label: "Jumlah Penduduk", value: "±2.000" },
      { label: "Penduduk Laki-laki", value: "±1.020" },
      { label: "Penduduk Perempuan", value: "±980" },
      { label: "Kepala Keluarga", value: "±550" },
    ],
  },
  {
    judul: "Wilayah & Administrasi",
    items: [
      { label: "Luas Wilayah", value: "±10 km²" },
      { label: "Jumlah Dusun", value: "3" },
      { label: "Jumlah RT", value: "9" },
      { label: "Jarak ke Pusat Kecamatan", value: "±6 km" },
    ],
  },
  {
    judul: "Mata Pencaharian",
    items: [
      { label: "Nelayan", value: "±380" },
      { label: "Petani", value: "±320" },
      { label: "Wiraswasta & Pedagang", value: "±100" },
      { label: "PNS & Honorer", value: "±35" },
      { label: "Buruh & Tukang", value: "±80" },
      { label: "Lainnya", value: "±60" },
    ],
  },
];

// Susunan perangkat desa kini berupa bagan hierarki → lihat `./struktur.ts`
// (dirender oleh `../_components/StrukturOrganisasi`).

/**
 * Data Profil Desa Gaya Baru (route-spesifik, dikonsumsi oleh
 * `../_components/*`).
 *
 * CATATAN, SEMUA konten masih PLACEHOLDER (deskripsi, sejarah, visi-misi,
 * angka statistik). Ganti dengan data resmi desa lewat dashboard admin
 * (/admin/profil) atau langsung di file ini.
 */

/** Deskripsi singkat desa, pembuka halaman Profil. */
export const TENTANG: string[] = [
  "Desa Gaya Baru adalah desa pesisir di Kabupaten Buton Selatan, Sulawesi Tenggara. Dikelilingi laut jernih dan perbukitan asri, sebagian besar warganya hidup sebagai nelayan dan petani dengan hasil laut dan kebun sebagai penopang utama ekonomi desa.",
  "Kehidupan desa diwarnai budaya lokal dan semangat gotong royong yang masih terjaga. Beberapa tahun terakhir, desa mulai mengembangkan potensi wisata bahari berbasis masyarakat, dari pantai berpasir putih hingga jalur ekowisata mangrove.",
];

/** Paragraf sejarah singkat desa. */
export const SEJARAH: string[] = [
  "Placeholder, tuliskan asal-usul Desa Gaya Baru di sini: kapan desa berdiri, dari wilayah mana dimekarkan, dan tonggak-tonggak penting perkembangannya.",
  "Placeholder, lanjutkan dengan cerita atau warisan turun-temurun yang melekat pada desa: asal nama, tradisi, atau peristiwa bersejarah yang membentuk identitas warganya.",
];

/** Pernyataan visi desa. */
export const VISI =
  "Placeholder, tuliskan visi Desa Gaya Baru di sini, mis. mewujudkan desa bahari yang maju, mandiri, dan berkelanjutan.";

/** Poin-poin misi desa. */
export const MISI: string[] = [
  "Placeholder misi pertama, mis. mengembangkan potensi wisata bahari berbasis masyarakat.",
  "Placeholder misi kedua, mis. meningkatkan kualitas layanan publik dan infrastruktur desa.",
  "Placeholder misi ketiga, mis. memberdayakan UMKM dan ekonomi kreatif warga pesisir.",
  "Placeholder misi keempat, mis. menjaga kelestarian lingkungan laut dan pesisir.",
];

import type { StatItem, StatGroup } from "@/types/profil";
export type { StatItem, StatGroup };

/**
 * Statistik desa untuk section "Desa dalam Angka" (infografis kependudukan,
 * struktur mengikuti gayabaru-desa.com/infografis). Nama kelompok JANGAN
 * diubah, dipakai komponen StatistikDesa untuk memilih jenis chart.
 * Angka penduduk/pekerjaan/agama dari situs resmi; umur/dusun/pendidikan
 * masih PLACEHOLDER proporsional, ubah lewat /admin/statistik.
 */
export const STATISTIK: StatGroup[] = [
  {
    judul: "Penduduk & Kepala Keluarga",
    items: [
      { label: "Total Penduduk", value: "1.678" },
      { label: "Laki-laki", value: "896" },
      { label: "Perempuan", value: "782" },
      { label: "Kepala Keluarga", value: "380" },
    ],
  },
  {
    judul: "Kelompok Umur",
    items: [
      { label: "0-1 Tahun", value: "35" },
      { label: "1-3 Tahun", value: "78" },
      { label: "3-6 Tahun", value: "120" },
      { label: "6-15 Tahun", value: "295" },
      { label: "15-45 Tahun", value: "730" },
      { label: "45-54 Tahun", value: "180" },
      { label: "54-60 Tahun", value: "120" },
      { label: ">60 Tahun", value: "120" },
    ],
  },
  {
    judul: "Populasi per Dusun",
    items: [
      { label: "Dusun Jaya", value: "640" },
      { label: "Lakaliba", value: "560" },
      { label: "Dusun Lantai Dua", value: "478" },
    ],
  },
  {
    judul: "KK per Dusun",
    items: [
      { label: "Dusun Jaya", value: "145" },
      { label: "Lakaliba", value: "127" },
      { label: "Dusun Lantai Dua", value: "108" },
    ],
  },
  {
    judul: "Tingkat Pendidikan",
    items: [
      { label: "Tidak Sekolah", value: "210" },
      { label: "SD", value: "520" },
      { label: "SMP", value: "340" },
      { label: "SMA", value: "380" },
      { label: "Diploma", value: "45" },
      { label: "S1", value: "95" },
      { label: "S2", value: "8" },
      { label: "S3", value: "2" },
      { label: "Lainnya", value: "78" },
    ],
  },
  {
    judul: "Mata Pencaharian",
    items: [
      { label: "Petani Pemilik Lahan", value: "9" },
      { label: "Petani Penyewa", value: "3" },
      { label: "Buruh Tani", value: "5" },
      { label: "Nelayan Pemilik Kapal", value: "118" },
      { label: "Nelayan Penyewa Perahu", value: "4" },
      { label: "Buruh Nelayan", value: "158" },
      { label: "Guru Non PNS", value: "2" },
      { label: "Pedagang", value: "7" },
      { label: "PNS/ASN", value: "4" },
      { label: "TNI", value: "3" },
      { label: "Perangkat Desa", value: "7" },
      { label: "Lainnya", value: "98" },
    ],
  },
  {
    judul: "Agama",
    items: [
      { label: "Islam", value: "1.678" },
      { label: "Kristen", value: "0" },
      { label: "Katolik", value: "0" },
      { label: "Hindu", value: "0" },
      { label: "Buddha", value: "0" },
      { label: "Konghucu", value: "0" },
      { label: "Lainnya", value: "0" },
    ],
  },
];


// Susunan perangkat desa kini berupa bagan hierarki → lihat `./struktur.ts`
// (dirender oleh `../_components/StrukturOrganisasi`).

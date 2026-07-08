/**
 * Daftar dokumen publik Desa Gaya Baru — dikonsumsi oleh
 * `../_components/DokumenDesa`.
 *
 * CATATAN: `file` menunjuk berkas PDF di `/public/docs`. Folder & berkasnya
 * masih PLACEHOLDER — unggah PDF asli ke `public/docs/` lalu sesuaikan path,
 * judul, kategori, dan tanggalnya.
 */
import type { Dokumen } from "@/types/profil";
export type { Dokumen };

export const DOKUMEN: Dokumen[] = [
  {
    judul: "Profil Desa Gaya Baru",
    kategori: "Profil",
    tanggal: "2025",
    file: "/docs/profil-desa.pdf",
  },
  {
    judul: "RPJMDes 2021–2027",
    kategori: "Perencanaan",
    tanggal: "2021",
    file: "/docs/rpjmdes-2021-2027.pdf",
  },
  {
    judul: "APBDes Tahun Anggaran 2025",
    kategori: "Anggaran",
    tanggal: "2025",
    file: "/docs/apbdes-2025.pdf",
  },
  {
    judul: "Laporan Realisasi APBDes 2024",
    kategori: "Laporan",
    tanggal: "2024",
    file: "/docs/realisasi-apbdes-2024.pdf",
  },
  {
    judul: "Peraturan Desa No. 1 Tahun 2025",
    kategori: "Regulasi",
    tanggal: "2025",
    file: "/docs/perdes-01-2025.pdf",
  },
];

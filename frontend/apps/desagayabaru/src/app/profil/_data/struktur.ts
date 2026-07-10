/**
 * Struktur organisasi Desa Gaya Baru, hierarki perangkat desa. Dikonsumsi
 * oleh `../_components/StrukturOrganisasi` (React Flow). `parent` menunjuk id
 * atasan langsung; node tanpa `parent` = puncak (Kepala Desa).
 *
 * CATATAN: SEMUA NAMA masih PLACEHOLDER, ganti dengan perangkat desa asli
 * (lewat dashboard admin atau file ini). `foto` kosong → node tampil inisial.
 */
import type { Anggota } from "@/types/profil";
export type { Anggota };

export const STRUKTUR: Anggota[] = [
  { id: "kepala", jabatan: "Kepala Desa", nama: "Nama Kepala Desa" },
  {
    id: "sekretaris",
    jabatan: "Sekretaris Desa",
    nama: "Nama Sekretaris",
    parent: "kepala",
  },
  {
    id: "kaur-keuangan",
    jabatan: "Kaur Keuangan",
    nama: "Nama Kaur Keuangan",
    parent: "sekretaris",
  },
  {
    id: "kaur-perencanaan",
    jabatan: "Kaur Perencanaan",
    nama: "Nama Kaur Perencanaan",
    parent: "sekretaris",
  },
  {
    id: "kasi-pemerintahan",
    jabatan: "Kasi Pemerintahan",
    nama: "Nama Kasi Pemerintahan",
    parent: "kepala",
  },
  {
    id: "kasi-kesejahteraan",
    jabatan: "Kasi Kesejahteraan",
    nama: "Nama Kasi Kesejahteraan",
    parent: "kepala",
  },
  { id: "kadus-1", jabatan: "Kadus 1", nama: "Nama Kadus 1", parent: "kepala" },
  { id: "kadus-2", jabatan: "Kadus 2", nama: "Nama Kadus 2", parent: "kepala" },
  { id: "kadus-3", jabatan: "Kadus 3", nama: "Nama Kadus 3", parent: "kepala" },
];

/**
 * Struktur organisasi Desa Gerak Makmur — hierarki perangkat desa. Dikonsumsi
 * oleh `../_components/StrukturOrganisasi` (React Flow). `parent` menunjuk id
 * atasan langsung; node tanpa `parent` = puncak (Kepala Desa).
 *
 * CATATAN: `foto` masih kosong → node menampilkan inisial. Tambahkan foto ke
 * `/public/images` lalu isi field `foto` tiap anggota.
 */
import type { Anggota } from "@/types/profil";
export type { Anggota };

export const STRUKTUR: Anggota[] = [
  { id: "kepala", jabatan: "Kepala Desa", nama: "La Ode Rismanton, S.H., NL.P" },
  {
    id: "sekretaris",
    jabatan: "Sekretaris Desa",
    nama: "Hamrin, A.Md. Komp.",
    parent: "kepala",
  },
  {
    id: "kaur-keuangan",
    jabatan: "Kaur Keuangan",
    nama: "Usrin",
    parent: "sekretaris",
  },
  {
    id: "kaur-perencanaan",
    jabatan: "Kaur Perencanaan",
    nama: "Ode. F. Sukun, S.K.M",
    parent: "sekretaris",
  },
  {
    id: "kasi-pemerintahan",
    jabatan: "Kasi Pemerintahan",
    nama: "La Ode Arlan",
    parent: "kepala",
  },
  {
    id: "kasi-kesejahteraan",
    jabatan: "Kasi Kesejahteraan",
    nama: "Nalda Havid",
    parent: "kepala",
  },
  { id: "kadus-1", jabatan: "Kadus Lande 1", nama: "Ardianton", parent: "kepala" },
  { id: "kadus-2", jabatan: "Kadus Lande 2", nama: "Suhidin", parent: "kepala" },
  { id: "kadus-3", jabatan: "Kadus Lande 3", nama: "Darmin, S.Pd.", parent: "kepala" },
  { id: "kadus-4", jabatan: "Kadus Lande 4", nama: "La Ode Asmin, S.E.", parent: "kepala" },
];

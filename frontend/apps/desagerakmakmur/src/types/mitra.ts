/**
 * Tipe domain Mitra Kolaborasi — logo/nama mitra pada section beranda.
 */
export interface Mitra {
  nama: string;
  /** Path logo di `/public/images`. Kosong = tampilkan nama sebagai teks. */
  logo?: string;
}

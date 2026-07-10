/**
 * Tipe domain Profil Desa, statistik, struktur organisasi, dan dokumen publik.
 * Sumber kebenaran tipe; data seed ada di `app/profil/_data/*`, disediakan ke
 * halaman lewat `@/data/profil`.
 */

/** Satu angka statistik desa (mis. jumlah penduduk). */
export interface StatItem {
  label: string;
  value: string;
}

/** Kelompok statistik dengan sub judul (mis. Kependudukan, Mata Pencaharian). */
export interface StatGroup {
  judul: string;
  items: StatItem[];
}

/** Satu anggota perangkat desa dalam bagan hierarki. */
export interface Anggota {
  id: string;
  jabatan: string;
  nama: string;
  /** Foto potret (aspek 4:3) di `/public/images`. Kosong = tampil inisial. */
  foto?: string;
  /** id atasan langsung. Kosong = puncak struktur. */
  parent?: string;
}

/** Satu dokumen publik desa (PDF). */
export interface Dokumen {
  judul: string;
  kategori: string;
  /** Tanggal/tahun terbit (teks bebas), mis. "2025". */
  tanggal: string;
  /** Path PDF di `/public/docs`, mis. "/docs/apbdes-2025.pdf". */
  file: string;
}

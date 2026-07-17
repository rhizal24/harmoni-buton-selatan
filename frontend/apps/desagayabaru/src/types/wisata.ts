/**
 * Tipe domain Wisata, sumber kebenaran tipe untuk destinasi wisata.
 * Data seed sementara ada di `app/wisata/_data/wisata.ts`; layer akses data
 * (`@/data/wisata`) yang menyediakannya ke halaman.
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
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  /** Deep-link Google Maps ke titik lokasi. */
  maps: string;
  /** Koordinat titik lokasi, dipakai marker di peta WebGIS (/peta). */
  latitude?: number | null;
  longitude?: number | null;
  /** Beberapa foto untuk slideshow auto-fade (loop). Foto pertama = thumbnail. */
  imgs: string[];
  alt: string;
}

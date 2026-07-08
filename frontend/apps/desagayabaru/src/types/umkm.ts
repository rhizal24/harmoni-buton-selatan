/**
 * Tipe domain UMKM — usaha mikro/kecil warga desa.
 */
export interface Umkm {
  nama: string;
  kategori: string;
  deskripsi: string;
  /** Path foto produk/usaha di `/public/images`. */
  foto: string;
  /** Nomor WhatsApp (wa.me), tanpa "+"/spasi. Opsional. */
  wa?: string;
}

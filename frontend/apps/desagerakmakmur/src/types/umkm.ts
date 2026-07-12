/**
 * Tipe domain UMKM — usaha mikro/kecil warga desa.
 * Sumber LIVE: artikel Supabase kategori `umkm` (lihat `@/data/umkm`);
 * field selain nama/deskripsi/foto baru terisi dari seed sampai kolomnya
 * tersedia di DB.
 */
export interface Umkm {
  nama: string;
  deskripsi: string;
  /** Path/URL foto produk atau usaha. */
  foto: string;
  /** Label kategori usaha (mis. "Kuliner"). Opsional. */
  kategori?: string;
  /** Nama pemilik / kelompok pengelola. Opsional. */
  pemilik?: string;
  /** Lokasi ringkas (dusun/patokan) untuk ditampilkan di kartu. Opsional. */
  lokasi?: string;
  /** Link Google Maps ke lokasi usaha. Opsional. */
  mapsUrl?: string;
  /** Nomor WhatsApp (wa.me), tanpa "+"/spasi. Opsional. */
  wa?: string;
  /** Toko daring (Shopee/Tokopedia/dsb). Opsional. */
  olshop?: { label: string; url: string };
  /** Produk unggulan untuk ditampilkan sebagai chip di detail. Opsional. */
  produk?: string[];
  /** Kisaran harga tampil, mis. "Rp15.000–Rp60.000". Opsional. */
  harga?: string;
  /** Slug artikel profil UMKM — tautan baca selengkapnya. Opsional. */
  slug?: string;
}

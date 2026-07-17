/**
 * Tipe baris tabel Supabase (schema `public`) — lihat
 * `arsitektur-deployment-vercel-supabase-imagekit.md` dan SQL schema di Supabase.
 * Kolom timestamp dikembalikan supabase-js sebagai string ISO.
 */

export type AdminRole = "super_admin" | "village_admin";

export type DocumentCategory =
  | "peraturan"
  | "laporan"
  | "formulir"
  | "lainnya";

export interface VillageRow {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  history: string | null;
  map_embed_url: string | null;
  video_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  /** Konten profil — lihat docs/supabase-migration-profil.sql.
   *  about/history = paragraf dipisah baris kosong. */
  about: string | null;
  vision: string | null;
  missions: string[];
  /** Foto hero per halaman — lihat docs/supabase-migration-hero.sql.
   *  null = pakai foto default bawaan (/images/*.jpg). */
  hero_beranda_url: string | null;
  hero_wisata_url: string | null;
  hero_profil_url: string | null;
  /** Gambar peta statis /peta — lihat docs/supabase-migration-peta.sql. */
  peta_wisata_url: string | null;
  peta_dusun_url: string | null;
  /** Nomor WA utama desa (wa.me, tanpa "+"/spasi), dipakai seragam di /wisata. */
  whatsapp: string | null;
  /** PDF guidebook wisata (upload /admin/wisata). */
  guidebook_url: string | null;
  /** Kontak & sosmed footer — lihat docs/supabase-migration-kontak.sql. */
  email: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfileRow {
  id: string;
  full_name: string | null;
  /** Username login (bisa diganti admin di /admin/akun); null = belum diset. */
  username?: string | null;
  role: AdminRole;
  village_id: string | null;
  created_at: string;
}

/** Kontak WhatsApp cepat di footer — lihat docs/supabase-migration-kontak.sql. */
export interface FooterContactRow {
  id: string;
  village_id: string;
  name: string;
  jabatan: string;
  /** Jenis kontak: WhatsApp atau email. */
  contact_type: "wa" | "email";
  /** Nomor wa.me (tanpa "+"/spasi) atau alamat email, sesuai jenisnya. */
  value: string;
  display_order: number;
  created_at: string;
}

export interface OrganizationStructureRow {
  id: string;
  village_id: string;
  position_name: string;
  person_name: string;
  photo_url: string | null;
  short_bio: string | null;
  period_start: string | null;
  period_end: string | null;
  /** id atasan langsung (bagan hierarki) — null = puncak struktur. */
  parent_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PopulationDataRow {
  id: string;
  village_id: string;
  year: number;
  category: string;
  sub_category: string | null;
  value: number;
  unit: string | null;
  notes: string | null;
  /** Teks tampilan bebas (mis. "±2.500", "12,4 km²") + urutan tampil —
   *  lihat docs/supabase-migration-profil.sql */
  value_label: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  village_id: string;
  title: string;
  description: string | null;
  /** Kategori bebas (teks) sejak docs/supabase-migration-profil.sql */
  category: string;
  file_url: string;
  file_size_kb: number | null;
  uploaded_by: string | null;
  /** Label tahun/tanggal terbit untuk tampilan, mis. "2025". */
  period_label: string | null;
  created_at: string;
}

export interface TourismSpotRow {
  id: string;
  village_id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  /** Kolom detail — lihat docs/supabase-migration-wisata-detail.sql */
  tagline: string | null;
  tags: string[];
  phone: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  maps_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourismSpotImageRow {
  id: string;
  tourism_spot_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

export interface TourismSpotWithImages extends TourismSpotRow {
  tourism_spot_images: TourismSpotImageRow[];
}

export interface TourismPackageRow {
  id: string;
  village_id: string;
  tourism_spot_id: string | null;
  name: string;
  description: string | null;
  price: number;
  price_unit: string | null;
  duration_hours: number | null;
  min_pax: number | null;
  max_pax: number | null;
  itinerary: unknown | null;
  facilities: string[] | null;
  includes: string[] | null;
  excludes: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type ArticleCategory = "berita" | "umkm";

export interface ArticleRow {
  id: string;
  village_id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  content: string;
  excerpt: string | null;
  author_id: string | null;
  /** Kolom tambahan — lihat docs/supabase-migration-galeri-artikel.sql */
  category: ArticleCategory;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Galeri foto desa — lihat docs/supabase-migration-galeri-artikel.sql dan
 * docs/supabase-migration-galeri-kiriman.sql (kolom moderasi kiriman warga).
 * Kolom moderasi opsional (`?`) agar kompatibel sebelum migrasi dijalankan.
 */
export interface GalleryImageRow {
  id: string;
  village_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
  /** 'pending' = kiriman warga menunggu verifikasi; default 'approved'. */
  status?: "pending" | "approved";
  /** Nama pengirim (kiriman warga), null untuk upload admin. */
  submitted_by?: string | null;
  /** fileId ImageKit — untuk menghapus file saat kiriman ditolak. */
  file_id?: string | null;
  /** Ukuran file (KB), kiriman warga; untuk kuota 500 MB. */
  file_size_kb?: number | null;
}

/**
 * UMKM usaha warga — lihat docs/supabase-migration-umkm.sql.
 * Kolom koordinat — lihat docs/supabase-migration-umkm-koordinat.sql.
 */
export interface UmkmRow {
  id: string;
  village_id: string;
  nama: string;
  deskripsi: string | null;
  foto_url: string | null;
  kategori: string | null;
  pemilik: string | null;
  lokasi: string | null;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  wa: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  produk: string[];
  harga_label: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

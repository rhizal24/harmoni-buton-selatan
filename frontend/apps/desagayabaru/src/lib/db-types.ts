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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfileRow {
  id: string;
  full_name: string | null;
  role: AdminRole;
  village_id: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  village_id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  file_url: string;
  file_size_kb: number | null;
  uploaded_by: string | null;
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

/** Galeri foto desa — lihat docs/supabase-migration-galeri-artikel.sql */
export interface GalleryImageRow {
  id: string;
  village_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

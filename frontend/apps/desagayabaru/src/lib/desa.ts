/**
 * Helper query konten desa ini dari Supabase.
 * Semua query otomatis ter-scope ke desa dengan slug VILLAGE_SLUG;
 * RLS di Supabase hanya mengizinkan read konten yang published.
 */
import { getSupabase } from "./supabase";
import type {
  UmkmRow,
  ArticleRow,
  GalleryImageRow,
  OrganizationStructureRow,
  PopulationDataRow,
  DocumentRow,
  TourismPackageRow,
  TourismSpotWithImages,
  VillageRow,
} from "./db-types";

export const VILLAGE_SLUG = "gayabaru";

export async function getVillage(): Promise<VillageRow | null> {
  const { data, error } = await getSupabase()
    .from("villages")
    .select("*")
    .eq("slug", VILLAGE_SLUG)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat data desa: ${error.message}`);
  return data as VillageRow | null;
}

async function requireVillageId(): Promise<string | null> {
  const village = await getVillage();
  return village?.id ?? null;
}

export async function getTourismSpots(): Promise<TourismSpotWithImages[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  const { data, error } = await getSupabase()
    .from("tourism_spots")
    .select("*, tourism_spot_images(*)")
    .eq("village_id", villageId)
    .eq("is_published", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Gagal memuat tourism_spots: ${error.message}`);
  return (data ?? []) as TourismSpotWithImages[];
}

export async function getTourismPackages(): Promise<TourismPackageRow[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  const { data, error } = await getSupabase()
    .from("tourism_packages")
    .select("*")
    .eq("village_id", villageId)
    .eq("is_published", true)
    .order("price", { ascending: true });
  if (error) throw new Error(`Gagal memuat tourism_packages: ${error.message}`);
  return (data ?? []) as TourismPackageRow[];
}

export async function getPublishedArticles(limit = 20): Promise<ArticleRow[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  const { data, error } = await getSupabase()
    .from("articles")
    .select("*")
    .eq("village_id", villageId)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Gagal memuat articles: ${error.message}`);
  return (data ?? []) as ArticleRow[];
}

export async function getArticleBySlug(slug: string): Promise<ArticleRow | null> {
  const villageId = await requireVillageId();
  if (!villageId) return null;
  const { data, error } = await getSupabase()
    .from("articles")
    .select("*")
    .eq("village_id", villageId)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(`Gagal memuat article: ${error.message}`);
  return data as ArticleRow | null;
}

export async function getDocuments(): Promise<DocumentRow[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  const { data, error } = await getSupabase()
    .from("documents")
    .select("*")
    .eq("village_id", villageId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat documents: ${error.message}`);
  return (data ?? []) as DocumentRow[];
}

export async function getOrganizationStructure(): Promise<OrganizationStructureRow[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  const { data, error } = await getSupabase()
    .from("organization_structure")
    .select("*")
    .eq("village_id", villageId)
    .order("display_order", { ascending: true });
  if (error) throw new Error(`Gagal memuat organization_structure: ${error.message}`);
  return (data ?? []) as OrganizationStructureRow[];
}

export async function getGalleryImages(): Promise<GalleryImageRow[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  const { data, error } = await getSupabase()
    .from("gallery_images")
    .select("*")
    .eq("village_id", villageId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Gagal memuat gallery_images: ${error.message}`);
  return (data ?? []) as GalleryImageRow[];
}

export async function getPopulationData(year?: number): Promise<PopulationDataRow[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  let query = getSupabase()
    .from("population_data")
    .select("*")
    .eq("village_id", villageId)
    .order("year", { ascending: false });
  if (year !== undefined) query = query.eq("year", year);
  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat population_data: ${error.message}`);
  return (data ?? []) as PopulationDataRow[];
}

export async function getUmkmRows(): Promise<UmkmRow[]> {
  const villageId = await requireVillageId();
  if (!villageId) return [];
  const { data, error } = await getSupabase()
    .from("umkm")
    .select("*")
    .eq("village_id", villageId)
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(`Gagal memuat umkm: ${error.message}`);
  return (data ?? []) as UmkmRow[];
}

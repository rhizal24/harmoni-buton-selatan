import { cache } from "react";
import { getUmkmRows } from "@/lib/desa";
import type { Umkm } from "@/types/umkm";
import { UMKM_SEED } from "./seeds/umkm";

/** Fallback foto saat profil UMKM belum punya foto. */
const FALLBACK_FOTO = "/images/hero-bg.jpg";

/**
 * Data-access UMKM — LIVE dari Supabase (tabel `umkm`, dikelola dashboard
 * /admin/umkm; RLS hanya meloloskan baris published). Bila tabel masih
 * kosong atau Supabase tak terjangkau, jatuh ke SEED placeholder agar
 * section tidak pernah tampil kosong (pola fallback `lib/konten.ts`).
 */
export const getUmkm = cache(async (): Promise<Umkm[]> => {
  try {
    const rows = await getUmkmRows();
    if (rows.length === 0) return UMKM_SEED;
    return rows.map((row) => ({
      nama: row.nama,
      deskripsi: row.deskripsi ?? "",
      foto: row.foto_url ?? FALLBACK_FOTO,
      kategori: row.kategori ?? undefined,
      pemilik: row.pemilik ?? undefined,
      lokasi: row.lokasi ?? undefined,
      mapsUrl: row.maps_url ?? undefined,
      wa: row.wa ?? undefined,
      instagram: row.instagram_url ?? undefined,
      tiktok: row.tiktok_url ?? undefined,
      produk: row.produk.length > 0 ? row.produk : undefined,
      harga: row.harga_label ?? undefined,
    }));
  } catch {
    return UMKM_SEED;
  }
});

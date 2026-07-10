import { cache } from "react";
import type { StatGroup, Anggota, Dokumen } from "@/types/profil";
import { TENTANG, SEJARAH, VISI, MISI, STATISTIK } from "@/app/profil/_data/profil";
import { STRUKTUR } from "@/app/profil/_data/struktur";
import { DOKUMEN } from "@/app/profil/_data/dokumen";
import {
  getDocuments,
  getOrganizationStructure,
  getPopulationData,
  getVillage,
} from "@/lib/desa";

/**
 * Data-access Profil Desa, ADAPTER.
 *
 * Sumber data: Supabase (dikelola lewat dashboard /admin). Bila kolom/tabel
 * masih kosong atau Supabase tidak terjangkau, otomatis fallback ke seed
 * statis (`_data/*`), pemanggil tidak perlu berubah.
 */

/** Pecah teks jadi paragraf (dipisah baris kosong). */
function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const getTentang = cache(async (): Promise<string[]> => {
  try {
    const village = await getVillage();
    const p = paragraphs(village?.about);
    return p.length > 0 ? p : TENTANG;
  } catch (err) {
    console.warn("[profil] Gagal memuat tentang, pakai placeholder:", err);
    return TENTANG;
  }
});

export const getSejarah = cache(async (): Promise<string[]> => {
  try {
    const village = await getVillage();
    const p = paragraphs(village?.history);
    return p.length > 0 ? p : SEJARAH;
  } catch (err) {
    console.warn("[profil] Gagal memuat sejarah, pakai placeholder:", err);
    return SEJARAH;
  }
});

export const getVisiMisi = cache(
  async (): Promise<{ visi: string; misi: string[] }> => {
    try {
      const village = await getVillage();
      return {
        visi: village?.vision?.trim() ? village.vision : VISI,
        misi: village?.missions && village.missions.length > 0 ? village.missions : MISI,
      };
    } catch (err) {
      console.warn("[profil] Gagal memuat visi-misi, pakai placeholder:", err);
      return { visi: VISI, misi: MISI };
    }
  },
);

export const getStatistik = cache(async (): Promise<StatGroup[]> => {
  try {
    const rows = await getPopulationData();
    if (rows.length === 0) return STATISTIK;

    // Urut per display_order, lalu kelompokkan per kategori (urutan kemunculan).
    const sorted = [...rows].sort((a, b) => a.display_order - b.display_order);
    const groups = new Map<string, StatGroup>();
    for (const row of sorted) {
      const group = groups.get(row.category) ?? { judul: row.category, items: [] };
      group.items.push({
        label: row.sub_category ?? row.category,
        value:
          row.value_label ??
          `${new Intl.NumberFormat("id-ID").format(row.value)}${row.unit ? ` ${row.unit}` : ""}`,
      });
      groups.set(row.category, group);
    }
    return [...groups.values()];
  } catch (err) {
    console.warn("[profil] Gagal memuat statistik, pakai placeholder:", err);
    return STATISTIK;
  }
});

export const getStruktur = cache(async (): Promise<Anggota[]> => {
  try {
    const rows = await getOrganizationStructure();
    if (rows.length === 0) return STRUKTUR;
    return rows.map((row) => ({
      id: row.id,
      jabatan: row.position_name,
      nama: row.person_name,
      foto: row.photo_url ?? undefined,
      parent: row.parent_id ?? undefined,
    }));
  } catch (err) {
    console.warn("[profil] Gagal memuat struktur, pakai placeholder:", err);
    return STRUKTUR;
  }
});

export const getDokumen = cache(async (): Promise<Dokumen[]> => {
  try {
    const rows = await getDocuments();
    if (rows.length === 0) return DOKUMEN;
    return rows.map((row) => ({
      judul: row.title,
      kategori: row.category,
      tanggal: row.period_label ?? String(new Date(row.created_at).getFullYear()),
      file: row.file_url,
    }));
  } catch (err) {
    console.warn("[profil] Gagal memuat dokumen, pakai placeholder:", err);
    return DOKUMEN;
  }
});

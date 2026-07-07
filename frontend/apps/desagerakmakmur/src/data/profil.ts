import { cache } from "react";
import type { StatGroup, Anggota, Dokumen } from "@/types/profil";
import { TENTANG, SEJARAH, VISI, MISI, STATISTIK } from "@/app/profil/_data/profil";
import { STRUKTUR } from "@/app/profil/_data/struktur";
import { DOKUMEN } from "@/app/profil/_data/dokumen";
// import { apiFetch } from "@/lib/api/http";
// import { VILLAGE, DEFAULT_REVALIDATE } from "@/lib/api/config";

/**
 * Data-access Profil Desa — ADAPTER.
 *
 * Sekarang mengembalikan seed static (`_data/*`). Ganti tiap fungsi ke
 * `apiFetch` saat endpoint backend (sejarah/visi-misi/statistik/struktur/
 * dokumen) tersedia — pemanggil tidak perlu berubah.
 */

export const getTentang = cache(async (): Promise<string[]> => TENTANG);

export const getSejarah = cache(async (): Promise<string[]> => SEJARAH);

export const getVisiMisi = cache(
  async (): Promise<{ visi: string; misi: string[] }> => ({ visi: VISI, misi: MISI }),
);

export const getStatistik = cache(async (): Promise<StatGroup[]> => STATISTIK);

export const getStruktur = cache(async (): Promise<Anggota[]> => STRUKTUR);

export const getDokumen = cache(async (): Promise<Dokumen[]> => DOKUMEN);

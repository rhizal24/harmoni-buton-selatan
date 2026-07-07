import { cache } from "react";
import type { Wisata } from "@/types/wisata";
import { WISATA } from "@/app/wisata/_data/wisata";
// import { apiFetch } from "@/lib/api/http";
// import { VILLAGE, DEFAULT_REVALIDATE } from "@/lib/api/config";

/**
 * Data-access Wisata — ADAPTER.
 *
 * Sekarang mengembalikan seed static (`_data/wisata`). Begitu tabel + endpoint
 * backend tersedia, cukup ganti isi fungsi dengan baris `apiFetch` di bawah —
 * pemanggil (halaman) tidak perlu berubah.
 */
export const getWisata = cache(async (): Promise<Wisata[]> => {
  // TODO(backend): return apiFetch<Wisata[]>(`/villages/${VILLAGE}/wisata`, {
  //   revalidate: DEFAULT_REVALIDATE,
  // });
  return WISATA;
});

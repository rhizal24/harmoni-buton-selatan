import { cache } from "react";
import type { Wisata } from "@/types/wisata";
import { fetchWisata } from "@/lib/konten";

/**
 * Data-access Wisata — ADAPTER.
 *
 * Sumber data: Supabase (`tourism_spots` via `@/lib/konten`). Bila tabel
 * kosong atau Supabase tidak terjangkau, `fetchWisata` otomatis fallback ke
 * seed statis (`_data/wisata`) — pemanggil (halaman) tidak perlu berubah.
 */
export const getWisata = cache(async (): Promise<Wisata[]> => {
  return fetchWisata();
});

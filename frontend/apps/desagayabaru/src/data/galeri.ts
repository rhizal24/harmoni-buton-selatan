import { cache } from "react";
import type { FotoGaleri } from "@/types/galeri";
import { GALERI_SEED } from "./seeds/galeri";

/**
 * Data-access Galeri (Lensa Gaya Baru), ADAPTER (seed → API menyusul).
 */
export const getGaleri = cache(async (): Promise<FotoGaleri[]> => GALERI_SEED);

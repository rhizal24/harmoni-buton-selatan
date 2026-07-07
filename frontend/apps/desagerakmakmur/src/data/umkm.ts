import { cache } from "react";
import type { Umkm } from "@/types/umkm";
import { UMKM_SEED } from "./seeds/umkm";

/**
 * Data-access UMKM — ADAPTER (seed → API menyusul).
 */
export const getUmkm = cache(async (): Promise<Umkm[]> => UMKM_SEED);

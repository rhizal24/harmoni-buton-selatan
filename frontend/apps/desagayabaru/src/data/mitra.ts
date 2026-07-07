import { cache } from "react";
import type { Mitra } from "@/types/mitra";
import { MITRA_SEED } from "./seeds/mitra";

/**
 * Data-access Mitra Kolaborasi — ADAPTER (seed → API menyusul).
 */
export const getMitra = cache(async (): Promise<Mitra[]> => MITRA_SEED);

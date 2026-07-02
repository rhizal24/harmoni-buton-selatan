export const VILLAGES = ["gayabaru", "gerakmakmur"] as const;

export type Village = (typeof VILLAGES)[number];

export function isVillage(value: unknown): value is Village {
  return typeof value === "string" && (VILLAGES as readonly string[]).includes(value);
}

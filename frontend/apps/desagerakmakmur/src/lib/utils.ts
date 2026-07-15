/**
 * Utility functions — Desa Gerak Makmur
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gabungkan class names, filter falsy values, dan resolve konflik
 * utility Tailwind (dipakai juga oleh komponen shadcn/ui)
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}

/**
 * Format tanggal ke format Indonesia
 * @example formatDate("2025-07-01") → "1 Juli 2025"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Truncate teks panjang dan tambah ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Slug URL dari teks bebas (anchor section, deep-link)
 * @example slugify("Karamba Resto") → "karamba-resto"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

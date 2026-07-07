/**
 * Konfigurasi akses API backend (Express + Postgres di `backend/`).
 *
 * Fetch data publik dilakukan di server (Server Components), jadi `API_URL`
 * server-only diutamakan agar base URL internal tidak ikut ter-bundle ke
 * client. `NEXT_PUBLIC_API_URL` dipakai sebagai fallback (mis. saat perlu
 * dipanggil dari Client Component).
 *
 * CATATAN PORT: dev server Next.js app ini jalan di :3001 (lihat package.json),
 * sama dengan default backend. Jalankan backend di port lain — mis. PORT=4000 —
 * dan set `API_URL` di `.env.local` sesuai itu.
 */
export const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

/** Slug desa untuk endpoint per-desa: `/villages/:village/...`. */
export const VILLAGE = "gerakmakmur" as const;

/**
 * Revalidate default (detik) untuk data publik yang jarang berubah.
 * Konten yang diedit dari dashboard admin akan tersegar maksimal setelah
 * rentang ini (atau instan jika endpoint mutasi memanggil revalidasi).
 */
export const DEFAULT_REVALIDATE = 300;

import type { Mitra } from "@/types/mitra";

/**
 * SEED Mitra Kolaborasi — logo asli di `/public/sponsor`. Varian `-fit`
 * adalah hasil crop margin transparan di sekeliling tiap logo (beberapa
 * file sumber punya padding kosong tidak seragam di dalam kanvasnya
 * sendiri) — tanpa crop ini, logo yang paddingnya lebih tebal tampil lebih
 * kecil/renggang walau kotaknya sama besar.
 */
export const MITRA_SEED: Mitra[] = [
  { nama: "Eksklusif Digital Printing", logo: "/sponsor/Eksklusif Digital Printing 1-fit.avif" },
  { nama: "Pacific Paint", logo: "/sponsor/pacific paint-fit.avif" },
  { nama: "PT Pupuk Kalimantan Timur", logo: "/sponsor/PT Pupuk Kalimantan Timur 1-fit.avif" },
  { nama: "Rexona", logo: "/sponsor/rexona-fit.avif" },
  { nama: "GIK UGM", logo: "/sponsor/gik-fit.avif" },
  { nama: "Pepsodent — PT Unilever Tbk", logo: "/sponsor/Pepsodent_PT Unilever Tbk 1-fit.avif" },
  { nama: "Kuning", logo: "/sponsor/Kuning-fit.avif" },
  { nama: "Dunia & Co Indonesia", logo: "/sponsor/dunia-fit.avif" },
];

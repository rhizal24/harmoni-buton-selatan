/**
 * Tipe domain Galeri (Lensa Lande) — foto bento/masonry.
 */
export interface FotoGaleri {
  src: string;
  alt: string;
  /** Ukuran tile bento; default "sm" (1×1). */
  span?: "sm" | "md" | "lg";
}

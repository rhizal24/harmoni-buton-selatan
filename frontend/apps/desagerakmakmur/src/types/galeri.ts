/**
 * Tipe domain Galeri (Lensa Lande) — foto bento/masonry.
 */
export interface FotoGaleri {
  src: string;
  alt: string;
  /** Ukuran tile masonry (rasio tinggi); default "sm" (4:3). */
  span?: "sm" | "md" | "lg";
}

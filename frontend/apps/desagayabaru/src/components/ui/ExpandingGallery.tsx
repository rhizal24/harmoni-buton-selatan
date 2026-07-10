interface GalleryImage {
  src: string;
  alt: string;
}

interface ExpandingGalleryProps {
  images: GalleryImage[];
  /** Jeda fade-in antar-tile (ms). 0 = tanpa animasi. */
  staggerMs?: number;
  className?: string;
}

/**
 * ExpandingGallery, strip foto horizontal yang melebar saat di-hover
 * (accordion). Desktop: strip interaktif; mobile: grid 2 kolom sederhana.
 * Bila `staggerMs > 0`, tiap tile fade-in bertahap kiri→kanan (opacity saja,
 * tanpa pergeseran); remount lewat `key` memutar ulang animasi ini.
 * Border tosca tipis mengikuti design system, animasi dijaga reduced-motion.
 */
export function ExpandingGallery({
  images,
  staggerMs = 0,
  className = "",
}: ExpandingGalleryProps) {
  const fade = staggerMs > 0 ? "motion-safe:animate-gallery-fade" : "";
  const delay = (i: number) =>
    staggerMs > 0 ? { animationDelay: `${i * staggerMs}ms` } : undefined;

  return (
    <div className={className}>
      {/* Mobile, grid sederhana (strip terlalu sempit di layar kecil) */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {images.map((img, i) => (
          <div
            key={i}
            style={delay(i)}
            className={`aspect-square overflow-hidden rounded-lg border border-[#31577F]/20 ${fade}`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Desktop, strip melebar saat hover */}
      <div className="hidden h-[400px] w-full items-center gap-2 md:flex">
        {images.map((img, i) => (
          <div
            key={i}
            style={delay(i)}
            className={`group relative h-full w-56 flex-grow overflow-hidden rounded-lg border border-[#31577F]/20 motion-safe:transition-all motion-safe:duration-500 hover:w-full ${fade}`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

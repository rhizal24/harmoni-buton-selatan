import Link from "next/link";
import type { ReactNode } from "react";

interface GlowButtonProps {
  href: string;
  children: ReactNode;
  /** Kelas warna latar tombol dalam, mis. "bg-[#31577F]" */
  innerClassName?: string;
  /** Buka di tab baru (link eksternal) */
  external?: boolean;
  className?: string;
}

/**
 * GlowButton, tombol pill dengan glow border putih berputar (::before).
 * Warna isi tombol dikontrol lewat `innerClassName`. Animasi dijaga
 * `prefers-reduced-motion`. Keyframes: `rotate-glow` (globals.css).
 */
export function GlowButton({
  href,
  children,
  innerClassName = "bg-[#31577F]",
  external = false,
  className = "",
}: GlowButtonProps) {
  return (
    <div
      className={`group relative z-0 inline-flex items-center justify-center overflow-hidden rounded-md bg-white/25 p-0.5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-105 active:scale-100 before:absolute before:left-[-50%] before:top-[-50%] before:-z-[2] before:h-[200%] before:w-[200%] before:content-[''] before:[background-image:linear-gradient(#fff,#fff)] before:[background-repeat:no-repeat] before:[background-position:100%_50%] before:[background-size:50%_30%] before:[filter:blur(6px)] motion-safe:before:animate-rotate-glow ${className}`}
    >
      <Link
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={`rounded-[10px] px-8 py-3 font-body text-sm font-semibold text-white no-underline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${innerClassName}`}
      >
        {children}
      </Link>
    </div>
  );
}

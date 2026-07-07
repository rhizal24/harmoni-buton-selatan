import type { ReactNode } from "react";

interface GlowPillProps {
  children: ReactNode;
  /** Warna titik indikator (ping). Default coral — sesuai badge hero. */
  dotClassName?: string;
  className?: string;
}

/**
 * GlowPill — badge pill dengan glow border putih berputar (::before) dan
 * titik indikator berdenyut (ping). Non-interaktif; dipakai untuk label
 * "website ini apa" di hero. Keyframes `rotate-glow` (globals.css).
 */
export function GlowPill({
  children,
  dotClassName = "bg-[#F45B69]",
  className = "",
}: GlowPillProps) {
  return (
    <div
      className={`relative z-0 inline-flex items-center justify-center overflow-hidden rounded-full bg-white/15 p-px before:absolute before:left-[-50%] before:top-[-50%] before:-z-[2] before:h-[200%] before:w-[200%] before:content-[''] before:[background-image:linear-gradient(#fff,#fff)] before:[background-repeat:no-repeat] before:[background-position:100%_50%] before:[background-size:50%_30%] before:[filter:blur(6px)] motion-safe:before:animate-rotate-glow ${className}`}
    >
      <div className="flex items-center gap-2.5 rounded-full bg-gray-900/65 px-3 py-3 font-body text-xs font-medium text-white backdrop-blur">
        <span className="relative flex size-3.5 items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping ${dotClassName}`}
          />
          <span
            className={`relative inline-flex size-2 rounded-full ${dotClassName}`}
          />
        </span>
        {children}
      </div>
    </div>
  );
}

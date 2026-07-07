"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import gsap from "gsap";

interface ParallaxHoverProps {
  children: ReactNode;
  /** Pergeseran maksimum konten dari pusat (px). */
  shift?: number;
  /** Skala konten saat hover. */
  zoom?: number;
  className?: string;
}

/**
 * ParallaxHover — konten bergeser halus mengikuti kursor + zoom ringan saat
 * hover (GSAP). Dipakai sebagai lapisan dalam di kartu ber-tilt (TiltCard)
 * agar teks terasa "mengambang" di atas kartu. Reset halus saat pointer
 * keluar. Nonaktif untuk reduced-motion / perangkat sentuh.
 */
export function ParallaxHover({
  children,
  shift = 8,
  zoom = 1.06,
  className = "",
}: ParallaxHoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const reduce = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner || reduce() || e.pointerType === "touch") return;
    const rect = wrap.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(inner, {
      x: px * 2 * shift,
      y: py * 2 * shift,
      scale: zoom,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    const inner = innerRef.current;
    if (!inner) return;
    gsap.to(inner, { x: 0, y: 0, scale: 1, duration: 0.7, ease: "power3.out" });
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={className}
    >
      <div ref={innerRef} className="h-full" style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

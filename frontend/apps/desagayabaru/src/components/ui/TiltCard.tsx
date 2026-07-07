"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";

interface TiltCardProps {
  children: ReactNode;
  /** Sudut rotasi maksimum (derajat) */
  max?: number;
  className?: string;
}

/**
 * TiltCard — memiringkan elemen dalam 3D mengikuti posisi pointer (GSAP).
 * rotateX/rotateY dihitung dari posisi kursor relatif terhadap kartu, reset
 * halus saat pointer keluar. Nonaktif untuk reduced-motion / perangkat sentuh.
 */
export function TiltCard({ children, max = 9, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const reduce = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduce() || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateY: px * 2 * max,
      rotateX: -py * 2 * max,
      transformPerspective: 900,
      transformOrigin: "center",
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={className}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

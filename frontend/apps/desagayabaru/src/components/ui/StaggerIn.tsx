"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";

interface StaggerInProps {
  children: ReactNode;
  /** Elemen yang dirender (default: div). */
  as?: ElementType;
  className?: string;
  /** Jarak geser awal (px) tiap anak. */
  y?: number;
  /** Jeda antar-anak (detik). */
  stagger?: number;
  /** Tunda mulai (detik). */
  delay?: number;
}

/**
 * StaggerIn, animasi "masuk" ber-stagger untuk ANAK-ANAK langsungnya: tiap
 * anak fade (opacity) + geser naik (posisi) berurutan saat komponen di-mount,
 * yakni ketika halaman baru dibuka dari halaman lain atau setelah reload.
 * Menghormati prefers-reduced-motion (konten langsung tampil tanpa animasi).
 */
export function StaggerIn({
  children,
  as: Tag = "div",
  className = "",
  y = 28,
  stagger = 0.12,
  delay = 0.05,
}: StaggerInProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y,
        duration: 0.8,
        ease: "power3.out",
        stagger,
        delay,
      });
    }, el);

    return () => ctx.revert();
  }, [y, stagger, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

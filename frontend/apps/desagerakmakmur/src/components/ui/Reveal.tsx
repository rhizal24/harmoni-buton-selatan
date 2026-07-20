"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** elemen HTML yang dirender (default: div) */
  as?: ElementType;
  /** delay animasi dalam ms untuk efek stagger */
  delay?: number;
  className?: string;
  /**
   * `translate-y-0` (state akhir animasi) tetap berupa `transform` non-`none`
   * secara CSS, jadi tetap membuat containing block baru untuk descendant
   * `position: fixed` — biasanya tidak masalah, tapi mematahkan konten yang
   * butuh escape ke viewport penuh (mis. mode layar-penuh peta). Set `true`
   * untuk melepas class transform begitu animasi selesai, supaya descendant
   * `position: fixed` bisa lolos dari ancestor ini tanpa perlu di-portal.
   */
  dropTransformWhenVisible?: boolean;
}

/**
 * Reveal — fade-up saat elemen masuk viewport.
 * Menghormati prefers-reduced-motion: bila user meminta minim gerak,
 * konten langsung tampil tanpa animasi.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  dropTransformWhenVisible = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`motion-safe:transition-all motion-safe:duration-[600ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible
          ? dropTransformWhenVisible
            ? "opacity-100"
            : "opacity-100 translate-y-0"
          : "motion-safe:opacity-0 motion-safe:translate-y-6"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

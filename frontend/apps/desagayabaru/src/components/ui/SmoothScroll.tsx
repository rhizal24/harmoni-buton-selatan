"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth/inertia scroll global (Lenis) + sinkron ke GSAP ScrollTrigger.
 * Lenis di-drive lewat gsap.ticker supaya animasi scroll-trigger presisi.
 * Dinonaktifkan otomatis bila user memilih "reduce motion".
 *
 * Karena Lenis di-mount sekali di root layout (persist antar-navigasi), posisi
 * scroll-nya harus di-reset manual tiap ganti route, jika tidak, kembali ke
 * halaman yang tadi ter-scroll akan "menarik" balik ke posisi lama. Reset
 * dilewati bila URL punya hash (#anchor) agar navigasi ke section tetap jalan.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset ke atas tiap pindah route (kecuali bila ada #anchor di URL).
  // Bukan lompat seketika: halaman baru mulai di posisi scroll halaman lama,
  // lalu meluncur halus ke atas, perpindahan terasa menyambung.
  useEffect(() => {
    if (window.location.hash) return;

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    // Recalc pin/scroll-trigger SETELAH posisi & layout halaman baru settle
    // (dua frame), kalau tidak, refresh terlalu dini bikin pin hero glitch.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname]);

  return null;
}

"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface MarqueeProps {
  children: ReactNode;
  /** Kecepatan auto-scroll (px per frame ~60fps) */
  speed?: number;
  /** Kelas jarak antar item (padding kanan tiap item), mis. "pr-6" */
  itemClassName?: string;
  /** Jeda gerak otomatis selama pointer berada di atas pita. */
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * Marquee, satu baris berjalan otomatis kiri→kanan tanpa henti (infinite,
 * via transform + GSAP ticker) dengan tepi fade. Auto TIDAK berhenti saat
 * diinteraksi (kecuali `pauseOnHover`); pengguna hanya menggeser posisinya
 * (drag pointer) sambil pita tetap jalan. Item digandakan agar loop mulus.
 * Hormati reduced-motion.
 */
export function Marquee({
  children,
  speed = 0.5,
  itemClassName = "pr-6",
  pauseOnHover = false,
  className = "",
}: MarqueeProps) {
  const track = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  // 4 salinan (genap) → "half" = 2 set, cukup lebar untuk layar besar
  const loop = [...items, ...items, ...items, ...items];

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    let half = el.scrollWidth / 2; // lebar 2 set = satu periode wrap
    let x = -half; // posisi translateX (px); band [-half, 0]

    const apply = () => {
      // wrap tak terlihat karena konten periodik
      if (x >= 0) x -= half;
      else if (x <= -half) x += half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    apply();

    // Drag pointer (mouse/touch/pen) = geser posisi di atas gerak otomatis
    let active = false;
    let lastX = 0;
    const onDown = (e: PointerEvent) => {
      active = true;
      lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      x += e.clientX - lastX;
      lastX = e.clientX;
      apply();
    };
    const onUp = () => (active = false);

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    // Jeda saat hover (opsional), hanya menahan gerak otomatis, drag tetap
    let hovered = false;
    const onEnter = () => (hovered = true);
    const onLeave = () => (hovered = false);
    if (pauseOnHover) {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
    }

    const onResize = () => {
      half = el.scrollWidth / 2;
    };
    window.addEventListener("resize", onResize);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      if (hovered) return;
      x += speed; // konten bergerak ke kanan, terus-menerus
      apply();
    };
    if (!reduce) gsap.ticker.add(tick);

    return () => {
      if (!reduce) gsap.ticker.remove(tick);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      if (pauseOnHover) {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      }
      window.removeEventListener("resize", onResize);
    };
  }, [speed, pauseOnHover]);

  return (
    <div
      className={`overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] ${className}`}
    >
      <div
        ref={track}
        className="flex w-max cursor-grab touch-pan-y select-none will-change-transform active:cursor-grabbing"
      >
        {loop.map((item, i) => (
          <div
            key={i}
            className={`shrink-0 ${itemClassName}`}
            aria-hidden={i >= items.length || undefined}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

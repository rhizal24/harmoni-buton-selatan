"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";

interface Layer {
  el: HTMLElement;
  strength: number;
  flip: number;
}

interface TiltCtxValue {
  register: (layer: Layer) => () => void;
}

const TiltContext = createContext<TiltCtxValue | null>(null);

/**
 * TiltScene — melacak posisi pointer di SELURUH viewport dan memiringkan
 * semua TiltLayer di dalamnya secara 3D (GSAP). Tiap layer punya intensitas
 * (`strength`) & arah (`flip`) sendiri sehingga geraknya tidak seragam.
 * Nonaktif untuk reduced-motion / input sentuh.
 */
export function TiltScene({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const layers = useRef<Set<Layer>>(new Set());

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const nx = e.clientX / window.innerWidth - 0.5; // -0.5..0.5
      const ny = e.clientY / window.innerHeight - 0.5;
      layers.current.forEach(({ el, strength, flip }) => {
        gsap.to(el, {
          rotateY: nx * 2 * strength * flip,
          rotateX: -ny * 2 * strength,
          transformPerspective: 1000,
          transformOrigin: "center",
          duration: 0.6,
          ease: "power2.out",
        });
      });
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const register = useCallback((layer: Layer) => {
    layers.current.add(layer);
    return () => {
      layers.current.delete(layer);
    };
  }, []);

  const value = useMemo(() => ({ register }), [register]);

  return (
    <TiltContext.Provider value={value}>
      <div className={className}>{children}</div>
    </TiltContext.Provider>
  );
}

/**
 * TiltLayer — satu elemen yang ikut dimiringkan oleh TiltScene.
 * `strength` = besar sudut, `flip` = arah (1 atau -1) untuk variasi.
 */
export function TiltLayer({
  children,
  strength = 8,
  flip = 1,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  flip?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useContext(TiltContext);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ctx) return;
    return ctx.register({ el, strength, flip });
  }, [ctx, strength, flip]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

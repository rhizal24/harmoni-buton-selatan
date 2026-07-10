"use client";

import { useEffect, useRef } from "react";
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";

/**
 * CircularGallery — adaptasi dari React Bits (reactbits.dev, MIT).
 * Carousel WebGL (ogl) dengan kurva melengkung.
 *
 * Perbedaan dari versi aslinya:
 * - TANPA infinite loop: item tidak diduplikasi dan scroll di-clamp ke
 *   rentang foto pertama–terakhir (permintaan desain galeri).
 * - Prop `startIndex`: carousel dibuka langsung di foto yang diklik.
 * - Prop `onActiveChange`: melaporkan indeks foto terdekat pusat (untuk
 *   counter di overlay).
 * - Label teks di bawah kartu DIHAPUS — judul tampil di bar overlay.
 * - Sudut membulat konsisten: radius dihitung dalam satuan dunia dari sisi
 *   terpendek kartu (aslinya di ruang UV sehingga melar ikut rasio kartu).
 * - Hover kartu: zoom halus ~5% (senada hover tile grid galeri).
 * - Styling container pakai utility Tailwind, bukan file CSS terpisah.
 */

export interface CircularGalleryItem {
  image: string;
}

interface Size {
  width: number;
  height: number;
}

interface ScrollState {
  ease: number;
  current: number;
  target: number;
  last: number;
  position: number;
}

/** Posisi pointer dalam koordinat dunia (viewport WebGL). */
interface PointerWorld {
  x: number;
  y: number;
}

function debounce<T extends (...args: never[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* ── Satu kartu foto di dalam scene ─────────────────────────────────── */
class Media {
  private geometry: Plane;
  private gl: OGLRenderingContext;
  private image: string;
  private index: number;
  private scene: Transform;
  private screen: Size;
  private viewport: Size;
  private bend: number;
  private borderRadius: number;
  private hoverZoom: number;
  private program!: Program;
  private baseScaleX = 0;
  private baseScaleY = 0;
  private hover = 1;
  plane!: Mesh;
  width = 0;
  private x = 0;

  constructor({
    geometry,
    gl,
    image,
    index,
    scene,
    screen,
    viewport,
    bend,
    borderRadius,
    hoverZoom,
  }: {
    geometry: Plane;
    gl: OGLRenderingContext;
    image: string;
    index: number;
    scene: Transform;
    screen: Size;
    viewport: Size;
    bend: number;
    borderRadius: number;
    hoverZoom: number;
  }) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.hoverZoom = hoverZoom;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  private createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          // SDF di ruang dunia (bukan UV) agar radius sudut seragam di
          // keempat sudut, tidak melar mengikuti rasio kartu.
          float radius = uBorderRadius * min(uPlaneSizes.x, uPlaneSizes.y);
          vec2 pos = (vUv - 0.5) * uPlaneSizes;
          float d = roundedBoxSDF(pos, uPlaneSizes * 0.5 - vec2(radius), radius);

          float edgeSmooth = 0.004 * min(uPlaneSizes.x, uPlaneSizes.y);
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ];
    };
  }

  private createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  update(scroll: ScrollState, pointer: PointerWorld | null) {
    // Tanpa wrap-around: posisi murni dari indeks — carousel berujung.
    this.plane.position.x = this.x - scroll.current;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    // Hover: zoom halus saat pointer di atas kartu (abaikan rotasi kecil).
    const hovered =
      pointer !== null &&
      Math.abs(pointer.x - this.plane.position.x) < this.baseScaleX / 2 &&
      Math.abs(pointer.y - this.plane.position.y) < this.baseScaleY / 2;
    this.hover = lerp(this.hover, hovered ? this.hoverZoom : 1, 0.12);
    this.plane.scale.x = this.baseScaleX * this.hover;
    this.plane.scale.y = this.baseScaleY * this.hover;

    const speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = speed;
  }

  onResize({ screen, viewport }: { screen?: Size; viewport?: Size } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    // Kartu potret dengan rasio tetap ~3:4, tinggi ±45% layar — cukup
    // kecil agar 4–5 kartu terlihat sekaligus (bukan 3 kartu raksasa).
    this.baseScaleY = this.viewport.height * 0.45;
    this.baseScaleX = this.baseScaleY * 0.74;
    this.plane.scale.set(this.baseScaleX, this.baseScaleY, 1);
    this.program.uniforms.uPlaneSizes.value = [
      this.baseScaleX,
      this.baseScaleY,
    ];
    const gap = this.baseScaleX * 0.28;
    this.width = this.baseScaleX + gap;
    this.x = this.width * this.index;
  }
}

/* ── Aplikasi WebGL: renderer, scroll clamped, event listener ───────── */
interface AppOptions {
  items: CircularGalleryItem[];
  bend: number;
  borderRadius: number;
  hoverZoom: number;
  scrollSpeed: number;
  scrollEase: number;
  startIndex: number;
  onActiveChange?: (index: number) => void;
}

class App {
  private container: HTMLElement;
  private scrollSpeed: number;
  private scroll: ScrollState;
  private onCheckDebounce: () => void;
  private renderer!: Renderer;
  private gl!: OGLRenderingContext;
  private camera!: Camera;
  private scene!: Transform;
  private planeGeometry!: Plane;
  private medias: Media[] = [];
  private screen!: Size;
  private viewport!: Size;
  private rect!: DOMRect;
  private raf = 0;
  private isDown = false;
  private start = 0;
  private maxScroll = 0;
  private activeIndex: number;
  private pointerClient: { x: number; y: number } | null = null;
  private onActiveChange?: (index: number) => void;

  constructor(container: HTMLElement, options: AppOptions) {
    this.container = container;
    this.scrollSpeed = options.scrollSpeed;
    this.scroll = {
      ease: options.scrollEase,
      current: 0,
      target: 0,
      last: 0,
      position: 0,
    };
    this.activeIndex = options.startIndex;
    this.onActiveChange = options.onActiveChange;
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(options);
    // Buka langsung di foto yang diklik.
    const startX = (this.medias[0]?.width ?? 0) * options.startIndex;
    this.scroll.current = this.scroll.target = this.scroll.last = clamp(
      startX,
      0,
      this.maxScroll,
    );
    this.update();
    this.addEventListeners();
  }

  private createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas as HTMLCanvasElement);
  }

  private createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  private createScene() {
    this.scene = new Transform();
  }

  private createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  private createMedias(options: AppOptions) {
    // Tanpa concat/duplikasi — jumlah kartu = jumlah foto asli.
    this.medias = options.items.map(
      (data, index) =>
        new Media({
          geometry: this.planeGeometry,
          gl: this.gl,
          image: data.image,
          index,
          scene: this.scene,
          screen: this.screen,
          viewport: this.viewport,
          bend: options.bend,
          borderRadius: options.borderRadius,
          hoverZoom: options.hoverZoom,
        }),
    );
    this.updateMaxScroll();
  }

  private updateMaxScroll() {
    const width = this.medias[0]?.width ?? 0;
    this.maxScroll = width * Math.max(this.medias.length - 1, 0);
  }

  private clampTarget() {
    this.scroll.target = clamp(this.scroll.target, 0, this.maxScroll);
  }

  private onTouchDown = (e: MouseEvent | TouchEvent) => {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  };

  private onTouchMove = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      this.pointerClient = null;
    } else {
      this.pointerClient = { x: e.clientX, y: e.clientY };
    }
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
    this.clampTarget();
  };

  private onTouchUp = () => {
    this.isDown = false;
    this.onCheck();
  };

  private onWheel = (e: WheelEvent) => {
    const delta = e.deltaY;
    this.scroll.target +=
      (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.clampTarget();
    this.onCheckDebounce();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        this.scroll.target += this.scrollSpeed * 5;
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.scroll.target -= this.scrollSpeed * 5;
        break;
      case "Home":
        e.preventDefault();
        this.scroll.target = 0;
        break;
      case "End":
        e.preventDefault();
        this.scroll.target = this.maxScroll;
        break;
      default:
        return;
    }
    this.clampTarget();
    this.onCheckDebounce();
  };

  /** Snap ke kartu terdekat, tetap dalam rentang. */
  private onCheck = () => {
    const width = this.medias[0]?.width;
    if (!width) return;
    const itemIndex = clamp(
      Math.round(this.scroll.target / width),
      0,
      this.medias.length - 1,
    );
    this.scroll.target = width * itemIndex;
  };

  private onResize = () => {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.rect = this.container.getBoundingClientRect();
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias.length) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport }),
      );
      this.updateMaxScroll();
      this.clampTarget();
    }
  };

  /** Konversi posisi pointer (px layar) → koordinat dunia WebGL. */
  private pointerWorld(): PointerWorld | null {
    // Saat drag, matikan hover-zoom agar tidak "berdenyut" ketika kartu
    // lewat di bawah kursor.
    if (!this.pointerClient || this.isDown) return null;
    const nx = (this.pointerClient.x - this.rect.left) / this.rect.width;
    const ny = (this.pointerClient.y - this.rect.top) / this.rect.height;
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
    return {
      x: (nx - 0.5) * this.viewport.width,
      y: -(ny - 0.5) * this.viewport.height,
    };
  }

  private update = () => {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    );
    const pointer = this.pointerWorld();
    this.medias.forEach((media) => media.update(this.scroll, pointer));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;

    // Laporkan foto yang sedang di tengah (untuk counter overlay).
    const width = this.medias[0]?.width;
    if (width && this.onActiveChange) {
      const index = clamp(
        Math.round(this.scroll.current / width),
        0,
        this.medias.length - 1,
      );
      if (index !== this.activeIndex) {
        this.activeIndex = index;
        this.onActiveChange(index);
      }
    }

    this.raf = window.requestAnimationFrame(this.update);
  };

  private addEventListeners() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("wheel", this.onWheel);
    window.addEventListener("mousedown", this.onTouchDown);
    window.addEventListener("mousemove", this.onTouchMove);
    window.addEventListener("mouseup", this.onTouchUp);
    window.addEventListener("touchstart", this.onTouchDown);
    window.addEventListener("touchmove", this.onTouchMove);
    window.addEventListener("touchend", this.onTouchUp);
    this.container.addEventListener("keydown", this.onKeyDown);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("mousedown", this.onTouchDown);
    window.removeEventListener("mousemove", this.onTouchMove);
    window.removeEventListener("mouseup", this.onTouchUp);
    window.removeEventListener("touchstart", this.onTouchDown);
    window.removeEventListener("touchmove", this.onTouchMove);
    window.removeEventListener("touchend", this.onTouchUp);
    this.container.removeEventListener("keydown", this.onKeyDown);
    const canvas = this.gl.canvas as HTMLCanvasElement;
    canvas.parentNode?.removeChild(canvas);
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  borderRadius = 0.07,
  hoverZoom = 1.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
  startIndex = 0,
  onActiveChange,
}: {
  items: CircularGalleryItem[];
  bend?: number;
  /** Radius sudut sebagai fraksi sisi terpendek kartu (0–0.5). */
  borderRadius?: number;
  /** Faktor zoom saat kartu di-hover (1 = mati). */
  hoverZoom?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  startIndex?: number;
  onActiveChange?: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const app = new App(el, {
      items,
      bend,
      borderRadius,
      hoverZoom,
      scrollSpeed,
      scrollEase,
      startIndex,
      onActiveChange: (i) => onActiveChangeRef.current?.(i),
    });
    return () => app.destroy();
  }, [items, bend, borderRadius, hoverZoom, scrollSpeed, scrollEase, startIndex]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Galeri melingkar. Gunakan panah kiri dan kanan untuk menjelajah."
      className="h-full w-full cursor-grab overflow-hidden active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    />
  );
}

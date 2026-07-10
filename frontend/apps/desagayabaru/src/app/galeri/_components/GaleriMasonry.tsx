"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { RowsPhotoAlbum, type Photo } from "react-photo-album";
import "react-photo-album/rows.css";
import { Reveal } from "@/components/ui/Reveal";
import { GaleriCarouselOverlay } from "./GaleriCarouselOverlay";
import type { FotoGaleri } from "@/types/galeri";

/** Pilihan rasio tile (w:h), dipilih pseudo-acak per foto. */
const RATIOS: readonly [number, number][] = [
  [4, 3],
  [3, 4],
  [1, 1],
  [3, 2],
  [2, 3],
  [4, 5],
  [5, 4],
  [16, 9],
];

/** Delay bounce maksimal (detik) untuk tile di tepi kanan viewport. */
const MAX_WAVE_DELAY = 0.65;

/** Photo react-photo-album + metadata label hover. */
interface GaleriPhoto extends Photo {
  /** Nomor urut foto untuk label hover. */
  nomor: number;
  judul: string;
}

/**
 * Hash FNV-1a deterministik dari src + alt + posisi → rasio tile terasa
 * acak tapi stabil antara server dan client (aman hydration).
 */
function ratioOf(foto: FotoGaleri, i: number): [number, number] {
  const s = `${foto.src}#${foto.alt}#${i}`;
  let h = 2166136261;
  for (let c = 0; c < s.length; c++) {
    h = Math.imul(h ^ s.charCodeAt(c), 16777619) >>> 0;
  }
  return RATIOS[h % RATIOS.length];
}

/**
 * Galeri (Lensa Gaya Baru), pembuka halaman Galeri (tanpa hero).
 * Layout rows (justified) react-photo-album: rasio foto pseudo-acak tapi
 * tiap baris di-justify sehingga tepi kiri-kanan rata dan keseluruhan
 * galeri membentuk kotak rapi. Semua foto tampil sekaligus; tiap tile
 * pop-bounce (spring, anchor atas) saat discroll masuk viewport dengan
 * delay bergelombang dari kiri ke kanan (dihitung dari posisi horizontal
 * tile). Hover: zoom halus + scrim + nomor & judul (pola DaftarWisata).
 * Klik tile → GaleriCarouselOverlay (viewer CircularGallery, tanpa loop)
 * mulai dari foto yang diklik.
 */
export function GaleriMasonry({
  data,
  header = true,
}: {
  data: FotoGaleri[];
  /** false = sembunyikan blok judul (dipakai saat GaleriHero jadi pembuka). */
  header?: boolean;
}) {
  const [aktif, setAktif] = useState<number | null>(null);

  const photos: GaleriPhoto[] = data.map((foto, i) => {
    const [w, h] = ratioOf(foto, i);
    return {
      src: foto.src,
      alt: foto.alt,
      width: 1200,
      height: Math.round((1200 * h) / w),
      nomor: i + 1,
      judul: foto.alt,
    };
  });

  return (
    <section
      id="galeri-masonry"
      aria-label="Galeri foto Desa Gaya Baru"
      className={`bg-white px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24 ${
        header ? "pt-32 lg:pt-36" : "pt-14 lg:pt-20"
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Header editorial rata kiri, pola sama dgn DaftarWisata/HeroWisata */}
        {header && (
          <Reveal>
            <div className="mb-10 flex flex-col items-start gap-4">
              <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
                <span className="h-[3px] w-[42px] bg-[#31577F]" aria-hidden />
                Galeri
              </span>
              <h1 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#31577F]">
                Lensa Gaya Baru
              </h1>
              <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#31577F]/80">
                Kumpulan dokumentasi kegiatan, alam, dan keseharian warga Desa
                Gaya Baru.
              </p>
            </div>
          </Reveal>
        )}

        <RowsPhotoAlbum
          photos={photos}
          spacing={16}
          targetRowHeight={(cw) => (cw < 640 ? 170 : cw < 1024 ? 220 : 280)}
          // Pengaman saat foto sangat sedikit (1–3 dari Supabase): satu
          // baris tunggal tidak boleh digelembungkan melebihi 480px.
          rowConstraints={{ singleRowMaxHeight: 480 }}
          defaultContainerWidth={1520}
          componentsProps={{
            image: {
              loading: "lazy",
              className:
                "object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105",
            },
          }}
          render={{
            // `ref` dikirim runtime tapi tak ada di tipe wrapper, ambil via cast.
            // Klik dipasang di BounceTile (bukan onClick album) agar
            // react-photo-album tetap memakai render.wrapper, kalau tidak,
            // tile dirender sebagai <button> polos tanpa rounded/border.
            wrapper: ({ style, className, children, ...rest }, context) => (
              <BounceTile
                forwardedRef={(rest as { ref?: Ref<HTMLDivElement> }).ref}
                style={style}
                className={className}
                label={`Perbesar foto: ${context.photo.judul}`}
                onOpen={() => setAktif(context.index)}
              >
                {children}
              </BounceTile>
            ),
            // Overlay hover: scrim + nomor & judul (pola DaftarWisata)
            extras: (_, { photo }) => (
              <div
                className="absolute inset-0 opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100"
                aria-hidden
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-5 text-white">
                  <span className="font-body text-xs font-semibold tracking-[0.2em] text-white/70">
                    {String(photo.nomor).padStart(2, "0")}
                  </span>
                  <span className="font-body text-lg font-semibold leading-tight">
                    {photo.judul}
                  </span>
                </div>
              </div>
            ),
          }}
        />
      </div>

      <AnimatePresence>
        {aktif !== null && (
          <GaleriCarouselOverlay
            data={data}
            startIndex={aktif}
            onClose={() => setAktif(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Tile pop-bounce, delay gelombang kiri→kanan dari posisi tile ──── */
function BounceTile({
  forwardedRef,
  style,
  className,
  label,
  onOpen,
  children,
}: {
  forwardedRef?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  className?: string;
  /** Label aksesibilitas aksi buka viewer. */
  label: string;
  /** Dipanggil saat tile diklik / Enter / Spasi. */
  onOpen: () => void;
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const localRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(localRef, {
    once: true,
    amount: 0.35,
    margin: "0px 0px -12% 0px",
  });
  const [delay, setDelay] = useState<number | null>(null);

  // Ukur posisi horizontal saat tile masuk viewport → delay kiri→kanan.
  // useLayoutEffect agar delay siap sebelum frame animasi pertama dilukis.
  useLayoutEffect(() => {
    if (!inView || delay !== null) return;
    const el = localRef.current;
    if (!el) return;
    const { left } = el.getBoundingClientRect();
    setDelay(
      Math.max(0, (left / Math.max(window.innerWidth, 1)) * MAX_WAVE_DELAY),
    );
  }, [inView, delay]);

  const shown = inView && (reduceMotion || delay !== null);

  return (
    <motion.div
      ref={(node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ ...style, transformOrigin: "top center" }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.82 }}
      animate={shown ? { opacity: 1, scale: 1 } : undefined}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              type: "spring",
              bounce: 0.28,
              duration: 0.65,
              delay: delay ?? 0,
            }
      }
      className={`${className ?? ""} group cursor-zoom-in overflow-hidden rounded-md border border-outline-variant motion-safe:transition-colors motion-safe:duration-200 hover:border-primary`}
    >
      {children}
    </motion.div>
  );
}

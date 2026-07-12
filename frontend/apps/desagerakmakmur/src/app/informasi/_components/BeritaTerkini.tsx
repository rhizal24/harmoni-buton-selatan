"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee, SearchIcon } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types/article";
import type { Umkm } from "@/types/umkm";

gsap.registerPlugin(ScrollTrigger);

/** Fallback cover saat artikel belum punya foto sampul. */
const FALLBACK_COVER = "/images/hero-bg.jpg";

/** Jumlah item daftar kanan per halaman — kolom tetap pendek saat berita banyak. */
const PER_HALAMAN = 5;

/** Estimasi lama baca (menit) — ±200 kata/menit, minimal 1. */
function menitBaca(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 200));
}

/** Varian stagger panel baca — tiap blok masuk berurutan (pola hero). */
const panelVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const blokVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * BeritaTerkini — portal berita halaman Informasi (pola Kompas/CNN "baca di
 * tempat"): strip ticker judul terkini, kotak pencarian, panel baca dengan
 * judul headline di atas foto (scrim), meta tanggal + lama baca, tombol
 * bagikan WhatsApp, dan daftar berita bernomor ber-thumbnail di kanan
 * (sticky). Pencarian menyaring judul/ringkasan/isi secara langsung; klik
 * item daftar / ticker mengganti isi panel tanpa pindah halaman. Route
 * detail `/informasi/berita/[slug]` tetap ada untuk tautan yang bisa
 * dibagikan. Di bawah lg daftar jadi kartu geser horizontal di atas panel.
 * Header, toolbar, dan kolom konten masuk ber-stagger saat halaman dibuka
 * (GSAP ScrollTrigger, pola HeroProfil) dengan guard reduced-motion.
 */
export function BeritaTerkini({
  articles,
  umkm = [],
}: {
  articles: Article[];
  /** Sorotan UMKM untuk blok pengisi kolom kanan (opsional). */
  umkm?: Umkm[];
}) {
  const [aktifId, setAktifId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [halaman, setHalaman] = useState(1);
  const readerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const kontenRef = useRef<HTMLDivElement>(null);

  // Animasi masuk saat halaman dibuka (GSAP ScrollTrigger, pola HeroProfil):
  // header ber-stagger, toolbar menyusul, lalu kolom konten berurutan.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const masuk = {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
      } as const;

      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          ...masuk,
          stagger: 0.12,
          scrollTrigger: { trigger: headerRef.current, start: "top 80%" },
        });
      }
      if (toolbarRef.current) {
        gsap.from(toolbarRef.current, {
          ...masuk,
          delay: 0.25,
          scrollTrigger: { trigger: toolbarRef.current, start: "top 85%" },
        });
      }
      if (kontenRef.current) {
        gsap.from(kontenRef.current.children, {
          ...masuk,
          y: 36,
          stagger: 0.15,
          delay: 0.35,
          scrollTrigger: { trigger: kontenRef.current, start: "top 85%" },
        });
      }
    });

    return () => ctx.revert();
    // Jalankan sekali saat konten pertama tersedia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.length]);

  const q = query.trim().toLowerCase();
  const hasil = q
    ? articles.filter((a) =>
        `${a.title} ${a.excerpt ?? ""} ${a.content}`.toLowerCase().includes(q),
      )
    : articles;
  // Artikel aktif: pilihan pengguna bila masih lolos filter, selain itu
  // hasil teratas. `undefined` hanya saat pencarian tak menemukan apa pun.
  const current = hasil.find((a) => a.id === aktifId) ?? hasil[0];

  // Daftar kanan dipotong per halaman; clamp bila hasil menyusut saat mencari.
  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const hal = Math.min(halaman, totalHalaman);
  const tampil = hasil.slice((hal - 1) * PER_HALAMAN, hal * PER_HALAMAN);

  const ubahQuery = (nilai: string) => {
    setQuery(nilai);
    setHalaman(1);
  };

  const pilih = (artikel: Article) => {
    setAktifId(artikel.id);
    // Di mobile daftar ada di atas panel baca — antar pembaca ke artikelnya.
    if (window.innerWidth < 1024) {
      readerRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  // Klik judul di ticker: bersihkan pencarian dulu agar artikelnya pasti
  // tampil, lompatkan daftar kanan ke halaman yang memuatnya, lalu aktifkan.
  const pilihDariTicker = (artikel: Article) => {
    setQuery("");
    const idx = articles.findIndex((a) => a.id === artikel.id);
    setHalaman(Math.floor(Math.max(0, idx) / PER_HALAMAN) + 1);
    pilih(artikel);
  };

  return (
    <section
      id="berita-terkini"
      aria-label="Berita terkini Desa Gerak Makmur"
      className="scroll-mt-24 bg-white px-5 pb-16 pt-32 sm:px-8 lg:pb-24 lg:pt-36"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-8">
        {/* Header editorial rata kiri — sekaligus pembuka halaman (tanpa
            hero), masuk ber-stagger via GSAP */}
        <div ref={headerRef} className="flex flex-col items-start gap-4">
          <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
            <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
            Kabar &amp; Karya Desa Gerak Makmur
          </span>
          <h1 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
            Berita Terkini
          </h1>
          <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#006572]/80">
            Kabar terbaru seputar kegiatan, pembangunan, dan kehidupan warga
            Desa Gerak Makmur — cari atau pilih judul, baca langsung di
            halaman ini.
          </p>
        </div>

        {articles.length === 0 ? (
          <Reveal>
            <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-6 py-14 text-center">
              <p className="font-body text-base text-on-surface-variant">
                Belum ada berita yang diterbitkan. Kabar terbaru desa akan
                tampil di sini.
              </p>
            </div>
          </Reveal>
        ) : (
          <>
            {/* ── Toolbar — ticker judul berjalan (kiri) + pencarian (kanan);
                   kolomnya mengikuti grid konten di bawah agar lurus ── */}
            <div ref={toolbarRef}>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-8">
                <Marquee
                  speed={0.4}
                  itemClassName="pr-10"
                  className="min-w-0 self-center py-2.5"
                >
                  {articles.map((artikel) => (
                    <button
                      key={artikel.id}
                      type="button"
                      onClick={() => pilihDariTicker(artikel)}
                      className="flex cursor-pointer items-center gap-3 font-body text-sm font-semibold text-on-surface-variant hover:text-[#006572]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#006572]/50"
                        aria-hidden
                      />
                      {artikel.title}
                    </button>
                  ))}
                </Marquee>

                <label className="relative block w-full">
                  <span className="sr-only">Cari berita</span>
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => ubahQuery(e.target.value)}
                    placeholder="Cari berita…"
                    className="min-h-11 w-full rounded-md border border-outline-variant bg-white py-2.5 pl-11 pr-4 font-body text-sm text-on-surface placeholder:text-on-surface-variant/70 motion-safe:transition-colors motion-safe:duration-200 focus:border-[#006572] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572]"
                  />
                </label>
              </div>

              {q && (
                <p
                  role="status"
                  className="mt-3 font-body text-sm text-on-surface-variant"
                >
                  {hasil.length > 0
                    ? `${hasil.length} berita ditemukan`
                    : "Tidak ada yang cocok"}
                  {" · "}
                  <button
                    type="button"
                    onClick={() => ubahQuery("")}
                    className="cursor-pointer font-semibold text-[#006572] hover:underline"
                  >
                    Hapus pencarian
                  </button>
                </p>
              )}
            </div>

            {!current ? (
              /* Pencarian tak menemukan apa pun */
              <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-6 py-14 text-center">
                <p className="font-body text-base text-on-surface-variant">
                  Tidak ada berita yang cocok dengan{" "}
                  <span className="font-semibold text-on-surface">
                    “{query.trim()}”
                  </span>
                  . Coba kata kunci lain.
                </p>
              </div>
            ) : (
              <div
                ref={kontenRef}
                className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]"
              >
                  {/* ── Daftar berita — mobile: kartu geser horizontal ── */}
                  <nav
                    aria-label="Daftar berita"
                    className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:hidden"
                  >
                    {hasil.map((artikel, i) => (
                      <button
                        key={artikel.id}
                        type="button"
                        onClick={() => pilih(artikel)}
                        aria-current={
                          current.id === artikel.id ? "true" : undefined
                        }
                        className={`group flex w-[248px] shrink-0 snap-start flex-col overflow-hidden rounded-lg border text-left motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572] ${
                          current.id === artikel.id
                            ? "border-[1.5px] border-[#006572] bg-[#006572]/5"
                            : "border-outline-variant bg-white"
                        }`}
                      >
                        <span className="relative block overflow-hidden">
                          <img
                            src={artikel.coverImageUrl ?? FALLBACK_COVER}
                            alt=""
                            loading="lazy"
                            className="h-24 w-full object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105"
                          />
                          <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#006572] font-body text-[11px] font-bold text-white">
                            {i + 1}
                          </span>
                        </span>
                        <span className="flex flex-col gap-1 p-3">
                          <span className="line-clamp-2 font-body text-sm font-semibold leading-snug text-on-surface">
                            {artikel.title}
                          </span>
                          <time
                            dateTime={artikel.publishedAt}
                            className="font-body text-xs text-on-surface-variant"
                          >
                            {formatDate(artikel.publishedAt)}
                          </time>
                        </span>
                      </button>
                    ))}
                  </nav>

                  {/* ── Panel baca — artikel aktif utuh ── */}
                  <div ref={readerRef} className="scroll-mt-28">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.article
                        key={current.id}
                        variants={reduceMotion ? undefined : panelVariants}
                        initial={reduceMotion ? false : "hidden"}
                        animate="show"
                        exit={
                          reduceMotion
                            ? undefined
                            : { opacity: 0, transition: { duration: 0.15 } }
                        }
                        className="flex flex-col"
                      >
                        {/* Headline — judul di atas foto, ala portal berita */}
                        <motion.div
                          variants={reduceMotion ? undefined : blokVariants}
                          className="group relative overflow-hidden rounded-lg"
                        >
                          <img
                            src={current.coverImageUrl ?? FALLBACK_COVER}
                            alt=""
                            className="aspect-video w-full object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105"
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                            aria-hidden
                          />
                          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-7">
                            <div className="flex flex-wrap items-center gap-2">
                              {current.id === articles[0].id && (
                                <span className="rounded-full bg-[#006572] px-3 py-1 font-body text-xs font-semibold text-white">
                                  Terbaru
                                </span>
                              )}
                              <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                                Kabar Desa
                              </span>
                            </div>
                            <h3 className="max-w-[36rem] font-body text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                              {current.title}
                            </h3>
                          </div>
                        </motion.div>

                        <div className="flex flex-col gap-4 pt-6">
                          {/* Meta — tanggal • lama baca • penulis */}
                          <motion.div
                            variants={reduceMotion ? undefined : blokVariants}
                            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-xs font-semibold text-on-surface-variant"
                          >
                            <time dateTime={current.publishedAt}>
                              {formatDate(current.publishedAt)}
                            </time>
                            <span aria-hidden>•</span>
                            <span>{menitBaca(current.content)} menit baca</span>
                            <span aria-hidden>•</span>
                            <span>Pemerintah Desa Gerak Makmur</span>
                          </motion.div>

                          {current.excerpt && (
                            <motion.p
                              variants={reduceMotion ? undefined : blokVariants}
                              className="border-l-2 border-[#006572] pl-4 font-body text-base leading-relaxed text-on-surface-variant lg:text-lg"
                            >
                              {current.excerpt}
                            </motion.p>
                          )}

                          <motion.div
                            variants={reduceMotion ? undefined : blokVariants}
                            className="flex flex-col gap-4 border-t border-outline-variant pt-4"
                          >
                            {current.content
                              .split(/\n+/)
                              .map((p) => p.trim())
                              .filter(Boolean)
                              .map((p, i) => (
                                <p
                                  key={i}
                                  className="font-body text-base leading-relaxed text-on-surface"
                                >
                                  {p}
                                </p>
                              ))}
                          </motion.div>

                          <motion.div
                            variants={reduceMotion ? undefined : blokVariants}
                            className="flex justify-end border-t border-outline-variant pt-4"
                          >
                            <Link
                              href={`/informasi/berita/${current.slug}`}
                              className="font-body text-sm font-semibold text-[#006572] no-underline hover:underline"
                            >
                              Buka halaman berita ini <span aria-hidden>→</span>
                            </Link>
                          </motion.div>
                        </div>
                      </motion.article>
                    </AnimatePresence>
                  </div>

                  {/* ── Kolom kanan — daftar polos gaya portal (tanpa kartu,
                         tidak sticky) + blok pengisi: tag, UMKM, ajakan ── */}
                  <aside className="hidden lg:flex lg:flex-col lg:gap-6">
                    {/* Daftar berita bernomor #1 #2 … */}
                    <nav aria-label="Daftar berita">
                      <h3 className="font-body text-base font-bold text-[#006572]">
                        {q ? "Hasil Pencarian" : "Berita Terkini"}
                      </h3>
                      <ol className="mt-4 flex flex-col gap-4">
                        {tampil.map((artikel, i) => (
                          <li key={artikel.id}>
                            <button
                              type="button"
                              onClick={() => pilih(artikel)}
                              aria-current={
                                current.id === artikel.id ? "true" : undefined
                              }
                              className="group flex w-full gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572]"
                            >
                              <span
                                className={`shrink-0 font-body text-sm font-semibold ${
                                  current.id === artikel.id
                                    ? "text-[#006572]"
                                    : "text-on-surface-variant/60"
                                }`}
                              >
                                #{(hal - 1) * PER_HALAMAN + i + 1}
                              </span>
                              <span className="flex min-w-0 flex-col gap-0.5">
                                <span
                                  className={`line-clamp-2 font-body text-sm font-bold leading-snug motion-safe:transition-colors motion-safe:duration-150 ${
                                    current.id === artikel.id
                                      ? "text-[#006572]"
                                      : "text-on-surface group-hover:text-[#006572]"
                                  }`}
                                >
                                  {artikel.title}
                                </span>
                                <time
                                  dateTime={artikel.publishedAt}
                                  className="font-body text-xs text-on-surface-variant"
                                >
                                  {formatDate(artikel.publishedAt)}
                                </time>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ol>

                      {/* Pager mini — daftar tetap 5 item berapa pun beritanya */}
                      {totalHalaman > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3">
                          <button
                            type="button"
                            aria-label="Berita sebelumnya"
                            onClick={() => setHalaman(hal - 1)}
                            disabled={hal <= 1}
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-md bg-[#006572]/10 font-body text-base font-bold text-[#006572] motion-safe:transition-colors hover:bg-[#006572]/20 disabled:pointer-events-none disabled:opacity-40"
                          >
                            <span aria-hidden>‹</span>
                          </button>
                          <span className="font-body text-xs font-semibold text-on-surface-variant">
                            Halaman {hal} dari {totalHalaman}
                          </span>
                          <button
                            type="button"
                            aria-label="Berita berikutnya"
                            onClick={() => setHalaman(hal + 1)}
                            disabled={hal >= totalHalaman}
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-md bg-[#006572]/10 font-body text-base font-bold text-[#006572] motion-safe:transition-colors hover:bg-[#006572]/20 disabled:pointer-events-none disabled:opacity-40"
                          >
                            <span aria-hidden>›</span>
                          </button>
                        </div>
                      )}
                    </nav>

                    {/* Sorotan UMKM — pengisi kolom, menaut ke section UMKM */}
                    {umkm.length > 0 && (
                      <div className="border-t border-outline-variant pt-5">
                        <h3 className="font-body text-base font-bold text-[#006572]">
                          UMKM Desa
                        </h3>
                        <ul className="mt-4 flex flex-col gap-4">
                          {umkm.slice(0, 4).map((usaha) => (
                            <li key={usaha.nama}>
                              <a
                                href="#umkm-desa"
                                className="group flex flex-col gap-0.5 no-underline"
                              >
                                <span className="line-clamp-1 font-body text-sm font-bold text-on-surface group-hover:text-[#006572]">
                                  {usaha.nama}
                                </span>
                                <span className="line-clamp-1 font-body text-xs text-on-surface-variant">
                                  {usaha.deskripsi}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                        <a
                          href="#umkm-desa"
                          className="mt-4 inline-block rounded-md bg-surface-container-low px-4 py-2 font-body text-sm font-semibold text-[#006572] no-underline hover:bg-[#006572]/10"
                        >
                          Lihat Selengkapnya <span aria-hidden>→</span>
                        </a>
                      </div>
                    )}

                    {/* Ajakan warga — pengisi penutup kolom */}
                    <div className="border-t border-outline-variant pt-5">
                      <div className="rounded-lg bg-surface-container-low p-5">
                        <h3 className="font-body text-base font-bold text-[#006572]">
                          Punya Momen Menarik?
                        </h3>
                        <p className="mt-2 font-body text-sm leading-relaxed text-on-surface-variant">
                          Kirimkan foto kegiatan atau keseharianmu di desa —
                          momen terbaik tampil di galeri Lensa Lande.
                        </p>
                        <Link
                          href="/galeri"
                          className="mt-3 inline-block font-body text-sm font-semibold text-[#006572] no-underline hover:underline"
                        >
                          Buka Galeri <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </div>
                  </aside>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

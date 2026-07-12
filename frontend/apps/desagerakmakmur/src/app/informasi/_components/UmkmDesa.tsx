"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/ui/Reveal";
import {
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/ui";
import type { Umkm } from "@/types/umkm";

gsap.registerPlugin(ScrollTrigger);

/** Ambil handle "@nama" dari URL profil sosmed untuk teks tautan. */
function handleSosmed(url: string): string {
  const segmen = url.split("/").filter(Boolean).pop() ?? url;
  return segmen.startsWith("@") ? segmen : `@${segmen}`;
}

/** Varian stagger panel detail — tiap blok masuk berurutan (pola BeritaTerkini). */
const panelVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
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
 * UmkmDesa — etalase UMKM halaman Informasi, pola dua kolom BeritaTerkini
 * dibalik: daftar teks bernomor tanpa gambar di KIRI (#1 nama + cuplikan
 * deskripsi, semua usaha memanjang tanpa pagination) dan panel detail usaha
 * terpilih di KANAN — nama di atas foto ber-scrim, lalu rata kiri pengelola,
 * lokasi, deskripsi, produk, harga + aksi (WhatsApp, koordinat, telepon).
 * Klik item daftar mengganti detail tanpa pindah halaman; di mobile daftar
 * tampil di atas panel. Elemen section masuk ber-stagger saat di-scroll
 * (GSAP ScrollTrigger, pola HeroProfil) dengan guard reduced-motion. Data
 * dari `@/data/umkm` (artikel Supabase kategori `umkm`, fallback seed).
 */
export function UmkmDesa({ umkm }: { umkm: Umkm[] }) {
  const [aktifIdx, setAktifIdx] = useState(0);
  const reduceMotion = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const detailWrapRef = useRef<HTMLDivElement>(null);

  const aktif = umkm[Math.min(aktifIdx, umkm.length - 1)];

  // Animasi masuk saat di-scroll (GSAP ScrollTrigger, pola HeroProfil):
  // header ber-stagger, item daftar berurutan, panel detail fade-up.
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
      if (listRef.current) {
        gsap.from(listRef.current.children, {
          ...masuk,
          y: 22,
          duration: 0.6,
          stagger: 0.08,
          scrollTrigger: { trigger: listRef.current, start: "top 80%" },
        });
      }
      if (detailWrapRef.current) {
        gsap.from(detailWrapRef.current, {
          ...masuk,
          y: 36,
          scrollTrigger: { trigger: detailWrapRef.current, start: "top 80%" },
        });
      }
    });

    return () => ctx.revert();
  }, [umkm.length]);

  return (
    <section
      id="umkm-desa"
      aria-label="UMKM Desa Gerak Makmur"
      className="scroll-mt-24 bg-[#f6fafb] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Header editorial rata kiri — masuk ber-stagger via GSAP */}
        <div ref={headerRef} className="flex flex-col items-start gap-4">
          <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
            <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
            Karya Warga
          </span>
          <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
            UMKM Desa
          </h2>
          <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#006572]/80">
            Usaha mikro dan kecil warga Gerak Makmur — pilih usaha dari daftar,
            detail lengkap dan kontak pemesanannya tampil di sampingnya.
          </p>
        </div>

        {umkm.length === 0 || !aktif ? (
          <Reveal>
            <div className="rounded-lg border border-dashed border-outline-variant bg-white px-6 py-14 text-center">
              <p className="font-body text-base text-on-surface-variant">
                Daftar UMKM sedang disusun. Profil usaha warga akan tampil di
                sini.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-10">
            {/* ── Daftar kiri — teks bernomor tanpa gambar, pola daftar
                     BeritaTerkini: #N nama + cuplikan deskripsi ── */}
            <nav aria-label="Daftar UMKM">
              <h3 className="font-body text-base font-bold text-[#006572]">
                Daftar UMKM
              </h3>
              <ol ref={listRef} className="mt-4 flex flex-col gap-4">
                {umkm.map((usaha, idx) => {
                  const isActive = idx === aktifIdx;
                  return (
                    <li key={usaha.nama}>
                      <button
                        type="button"
                        onClick={() => setAktifIdx(idx)}
                        aria-current={isActive ? "true" : undefined}
                        className="group flex w-full cursor-pointer gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572]"
                      >
                        <span
                          className={`shrink-0 font-body text-sm font-semibold ${
                            isActive
                              ? "text-[#006572]"
                              : "text-on-surface-variant/60"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span
                            className={`line-clamp-1 font-body text-sm font-bold leading-snug motion-safe:transition-colors motion-safe:duration-150 ${
                              isActive
                                ? "text-[#006572]"
                                : "text-on-surface group-hover:text-[#006572]"
                            }`}
                          >
                            {usaha.nama}
                          </span>
                          <span className="line-clamp-1 font-body text-xs text-on-surface-variant">
                            {usaha.deskripsi}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* ── Panel detail kanan — nama di atas foto ber-scrim lalu
                     isi rata kiri (desain sebelumnya) ── */}
            <div ref={detailWrapRef}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={aktif.nama}
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
                  {/* Headline — nama usaha di atas foto, ala panel berita */}
                  <motion.div
                    variants={reduceMotion ? undefined : blokVariants}
                    className="group relative overflow-hidden rounded-lg"
                  >
                    <img
                      src={aktif.foto}
                      alt={`Produk ${aktif.nama}`}
                      className="aspect-video w-full object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                      aria-hidden
                    />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        {aktif.kategori && (
                          <span className="rounded-full bg-[#006572] px-3 py-1 font-body text-xs font-semibold text-white">
                            {aktif.kategori}
                          </span>
                        )}
                        <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                          Karya Warga
                        </span>
                      </div>
                      <h3 className="max-w-[36rem] font-body text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                        {aktif.nama}
                      </h3>
                    </div>
                  </motion.div>

                  {/* Isi — satu kolom rata kiri, tanpa kartu/kotak */}
                  <div className="flex flex-col gap-5 pt-6">
                    {/* Pengelola & lokasi — highlight besar, polos */}
                    <motion.div
                      variants={reduceMotion ? undefined : blokVariants}
                      className="flex flex-wrap gap-x-14 gap-y-4"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                          Dikelola Oleh
                        </span>
                        <p className="font-body text-lg font-bold leading-snug text-[#006572] sm:text-xl">
                          {aktif.pemilik ?? "UMKM warga"}
                        </p>
                      </div>
                      {aktif.lokasi && (
                        <div className="flex flex-col gap-1">
                          <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                            Lokasi
                          </span>
                          <p className="flex items-start gap-2 font-body text-lg font-bold leading-snug text-on-surface sm:text-xl">
                            <MapPinIcon className="mt-1.5 h-4 w-4 shrink-0 text-[#006572]" />
                            {aktif.lokasi}
                          </p>
                        </div>
                      )}
                    </motion.div>

                    <motion.p
                      variants={reduceMotion ? undefined : blokVariants}
                      className="max-w-[46rem] border-l-2 border-[#006572] pl-4 font-body text-base leading-relaxed text-on-surface-variant lg:text-lg"
                    >
                      {aktif.deskripsi}
                    </motion.p>

                    {/* Kisaran harga — di bawah deskripsi */}
                    <motion.div
                      variants={reduceMotion ? undefined : blokVariants}
                      className="flex flex-col gap-1"
                    >
                      <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                        Kisaran Harga
                      </span>
                      <p className="font-body text-2xl font-bold text-[#006572]">
                        {aktif.harga ?? "Hubungi penjual"}
                      </p>
                    </motion.div>

                    {aktif.produk && aktif.produk.length > 0 && (
                      <motion.div
                        variants={reduceMotion ? undefined : blokVariants}
                        className="flex flex-col gap-3 border-t border-outline-variant pt-5"
                      >
                        <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                          Produk Unggulan
                        </span>
                        <ul className="flex flex-wrap gap-2">
                          {aktif.produk.map((p) => (
                            <li
                              key={p}
                              className="rounded-full bg-[#006572]/10 px-3 py-1 font-body text-xs font-semibold text-[#006572]"
                            >
                              {p}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {/* Ajakan & aksi — kalimat minat, telepon ber-ikon,
                        lalu tombol Pesan via WA + Buka Lokasi di Gmaps */}
                    <motion.div
                      variants={reduceMotion ? undefined : blokVariants}
                      className="flex flex-col items-start gap-3 border-t border-outline-variant pt-5"
                    >
                      <p className="font-body text-base font-semibold text-on-surface">
                        Berminat? Hubungi langsung pelaku usahanya — sebutkan
                        produk yang kamu mau.
                      </p>
                      {aktif.wa && (
                        <a
                          href={`tel:+${aktif.wa}`}
                          className="inline-flex items-center gap-2 font-body text-lg font-bold text-[#006572] no-underline hover:underline"
                        >
                          <PhoneIcon className="h-5 w-5 shrink-0" />+{aktif.wa}
                        </a>
                      )}
                      {aktif.instagram && (
                        <a
                          href={aktif.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-body text-lg font-bold text-[#006572] no-underline hover:underline"
                        >
                          <InstagramIcon className="h-5 w-5 shrink-0" />
                          {handleSosmed(aktif.instagram)}
                        </a>
                      )}
                      {aktif.tiktok && (
                        <a
                          href={aktif.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-body text-lg font-bold text-[#006572] no-underline hover:underline"
                        >
                          <TikTokIcon className="h-5 w-5 shrink-0" />
                          {handleSosmed(aktif.tiktok)}
                        </a>
                      )}
                      <div className="flex flex-wrap gap-3 pt-1">
                        {aktif.wa && (
                          <a
                            href={`https://wa.me/${aktif.wa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#006572] px-5 py-2 font-body text-sm font-semibold text-white no-underline motion-safe:transition-colors motion-safe:duration-200 hover:bg-[#00525c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572]"
                          >
                            <WhatsAppIcon className="h-4 w-4" />
                            Pesan via WhatsApp
                          </a>
                        )}
                        {aktif.mapsUrl && (
                          <a
                            href={aktif.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#006572]/10 px-5 py-2 font-body text-sm font-semibold text-[#006572] no-underline motion-safe:transition-colors motion-safe:duration-200 hover:bg-[#006572]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572]"
                          >
                            <MapPinIcon className="h-4 w-4" />
                            Buka Lokasi di Gmaps
                          </a>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

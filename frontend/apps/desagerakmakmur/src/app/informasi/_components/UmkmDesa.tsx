"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { MapPinIcon, Pagination, WhatsAppIcon } from "@/components/ui";
import type { Umkm } from "@/types/umkm";

/**
 * UmkmDesa — etalase UMKM halaman Informasi, pola kartu produk/properti:
 * foto dengan badge kategori menindih tepi bawah, harga tebal tosca +
 * tombol WhatsApp bundar, nama, lokasi, dan footer jumlah produk. Deretan
 * kartu digeser horizontal (swipe, snap per kartu) dengan Pagination galeri
 * di bawahnya yang tersinkron posisi geser. Klik kartu membuka overlay
 * detail lengkap (pemilik, produk, harga, WA, toko daring). Data dari
 * `@/data/umkm` (artikel Supabase kategori `umkm`, fallback seed).
 */
export function UmkmDesa({ umkm }: { umkm: Umkm[] }) {
  const [aktif, setAktif] = useState<Umkm | null>(null);
  const [halaman, setHalaman] = useState(1);
  const [totalHalaman, setTotalHalaman] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Sinkronkan pagination dengan posisi geser: satu "halaman" = satu lebar
  // viewport deretan kartu.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const total = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
      setTotalHalaman(total);
      setHalaman(
        Math.min(total, Math.round(el.scrollLeft / el.clientWidth) + 1),
      );
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [umkm.length]);

  const keHalaman = (p: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({
      left: (p - 1) * el.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  // Overlay terbuka: kunci scroll halaman + tutup dengan Esc.
  useEffect(() => {
    if (!aktif) return;
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAktif(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = sebelumnya;
      window.removeEventListener("keydown", onKey);
    };
  }, [aktif]);

  return (
    <section
      id="umkm-desa"
      aria-label="UMKM Desa Gerak Makmur"
      className="scroll-mt-24 bg-[#f6fafb] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        {/* Header editorial rata kiri — pola sama dgn BeritaTerkini */}
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
              <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
              Karya Warga
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
              UMKM Desa
            </h2>
            <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#006572]/80">
              Usaha mikro dan kecil warga Gerak Makmur — geser untuk
              menjelajah, klik kartu untuk detail lengkap dan kontak
              pemesanannya.
            </p>
          </div>
        </Reveal>

        {umkm.length === 0 ? (
          <Reveal>
            <div className="rounded-lg border border-dashed border-outline-variant bg-white px-6 py-14 text-center">
              <p className="font-body text-base text-on-surface-variant">
                Daftar UMKM sedang disusun. Profil usaha warga akan tampil di
                sini.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal>
            {/* Deretan kartu — geser horizontal, snap per kartu, tanpa
                scrollbar; bleed ke tepi layar agar terasa bisa digeser */}
            <div
              ref={trackRef}
              className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {umkm.map((usaha) => (
                <div
                  key={usaha.nama}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat detail ${usaha.nama}`}
                  onClick={() => setAktif(usaha)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAktif(usaha);
                    }
                  }}
                  className="group flex w-[280px] shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-lg border border-outline-variant bg-white text-left motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-200 hover:-translate-y-1 hover:border-[#006572] hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572]"
                >
                  {/* Foto + badge kategori menindih tepi bawah (ala "POPULAR") */}
                  <div className="relative">
                    <div className="overflow-hidden">
                      <img
                        src={usaha.foto}
                        alt={`Produk ${usaha.nama}`}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-105"
                      />
                    </div>
                    {usaha.kategori && (
                      <span className="absolute bottom-0 left-4 translate-y-1/2 rounded-md bg-[#006572] px-3 py-1 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                        {usaha.kategori}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 p-4 pt-6">
                    {/* Harga tebal + aksi WhatsApp bundar (pola kartu properti) */}
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-body text-lg font-bold text-[#006572]">
                        {usaha.harga ?? "Hubungi penjual"}
                      </p>
                      {usaha.wa && (
                        <a
                          href={`https://wa.me/${usaha.wa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${usaha.nama}`}
                          onClick={(e) => e.stopPropagation()}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-outline-variant text-[#006572] motion-safe:transition-colors motion-safe:duration-200 hover:border-[#006572] hover:bg-[#006572]/10"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <h3 className="line-clamp-1 font-body text-base font-bold text-on-surface">
                      {usaha.nama}
                    </h3>

                    {usaha.lokasi && (
                      <p className="flex items-center gap-1.5 font-body text-xs text-on-surface-variant">
                        <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#006572]" />
                        <span className="line-clamp-1">{usaha.lokasi}</span>
                      </p>
                    )}

                    {/* Footer spesifikasi — dipisah hairline (pola referensi) */}
                    <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3 font-body text-xs font-semibold text-on-surface-variant">
                      <span>
                        {usaha.produk?.length
                          ? `${usaha.produk.length} produk unggulan`
                          : (usaha.pemilik ?? "UMKM warga")}
                      </span>
                      <span className="text-[#006572]">
                        Detail{" "}
                        <span
                          aria-hidden
                          className="inline-block motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination — sinkron dengan posisi geser (komponen galeri) */}
            {totalHalaman > 1 && (
              <Pagination
                page={halaman}
                count={totalHalaman}
                onChange={keHalaman}
                className="mt-6"
              />
            )}
          </Reveal>
        )}
      </div>

      {/* ── Overlay detail UMKM ── */}
      <AnimatePresence>
        {aktif && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setAktif(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Detail ${aktif.nama}`}
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white md:grid-cols-[5fr_6fr]"
            >
              <button
                type="button"
                aria-label="Tutup detail"
                onClick={() => setAktif(null)}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 font-body text-base font-bold text-on-surface shadow-sm hover:bg-white"
              >
                <span aria-hidden>✕</span>
              </button>

              <img
                src={aktif.foto}
                alt={`Produk ${aktif.nama}`}
                className="aspect-video w-full object-cover md:aspect-auto md:h-full"
              />

              <div className="flex flex-col gap-4 p-6 md:p-7">
                <div className="flex flex-col gap-1.5">
                  {aktif.kategori && (
                    <span className="self-start rounded-full bg-[#006572]/10 px-3 py-1 font-body text-xs font-semibold text-[#006572]">
                      {aktif.kategori}
                    </span>
                  )}
                  <h3 className="font-body text-2xl font-bold leading-snug text-on-surface">
                    {aktif.nama}
                  </h3>
                  {aktif.pemilik && (
                    <p className="font-body text-xs font-semibold text-on-surface-variant">
                      oleh {aktif.pemilik}
                    </p>
                  )}
                </div>

                <p className="font-body text-sm leading-relaxed text-on-surface">
                  {aktif.deskripsi}
                </p>

                {aktif.lokasi && (
                  <p className="flex items-start gap-2 font-body text-sm text-on-surface-variant">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#006572]" />
                    <span>
                      {aktif.lokasi}
                      {aktif.mapsUrl && (
                        <>
                          {" · "}
                          <a
                            href={aktif.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#006572] hover:underline"
                          >
                            Buka peta
                          </a>
                        </>
                      )}
                    </span>
                  </p>
                )}

                {aktif.produk && aktif.produk.length > 0 && (
                  <div className="flex flex-col gap-2">
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
                  </div>
                )}

                {aktif.harga && (
                  <p className="font-body text-sm text-on-surface-variant">
                    Kisaran harga{" "}
                    <span className="font-bold text-[#006572]">
                      {aktif.harga}
                    </span>
                  </p>
                )}

                <div className="mt-auto flex flex-wrap gap-3 pt-2">
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
                  {aktif.olshop && (
                    <a
                      href={aktif.olshop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border-[1.5px] border-[#006572] px-5 py-2 font-body text-sm font-semibold text-[#006572] no-underline motion-safe:transition-colors motion-safe:duration-200 hover:bg-[#006572]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006572]"
                    >
                      Belanja di {aktif.olshop.label}{" "}
                      <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

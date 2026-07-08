"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Reveal } from "@/components/ui/Reveal";
import type { Dokumen } from "@/types/profil";

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Dokumen Desa — daftar dokumen publik (PDF). Klik "Lihat" membuka PDF dalam
 * viewer pop-up (iframe); tersedia juga tautan buka di tab baru. Tutup viewer:
 * tombol ×, Esc, atau klik latar. Data via `@/data/profil` (prop dari page).
 */
export function DokumenDesa({ data }: { data: Dokumen[] }) {
  const [aktif, setAktif] = useState<Dokumen | null>(null);

  // Kunci scroll body + tutup dengan Esc selama viewer terbuka.
  useEffect(() => {
    if (!aktif) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAktif(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [aktif]);

  return (
    <section
      id="dokumen"
      aria-label="Dokumen desa"
      className="bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[1112px] flex-col gap-10">
        <Reveal>
          <div className="flex flex-col items-start gap-4">
            <span className="flex items-center gap-3 font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
              <span className="h-[3px] w-[42px] bg-[#006572]" aria-hidden />
              Transparansi
            </span>
            <h2 className="font-body text-[clamp(2rem,4vw,3rem)] font-semibold text-[#006572]">
              Dokumen Desa
            </h2>
            <p className="max-w-[46rem] font-body text-lg leading-relaxed text-[#006572]/80">
              Dokumen publik dan produk hukum Desa Gaya Baru — klik untuk
              melihat langsung, atau buka di tab baru.
            </p>
          </div>
        </Reveal>

        <ul className="flex flex-col gap-3">
          {data.map((d, i) => (
            <Reveal key={d.file} as="li" delay={i * 60}>
              <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#006572]/20 bg-white p-4 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-card-hover sm:p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#006572]/10 text-[#006572]">
                  <FileIcon />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-body text-base font-bold leading-tight text-[#006572]">
                    {d.judul}
                  </h3>
                  <p className="mt-0.5 font-body text-sm text-[#006572]/60">
                    {d.kategori} · {d.tanggal} · PDF
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAktif(d)}
                    className="inline-flex items-center rounded-md bg-[#006572] px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#006572] focus-visible:outline-offset-2"
                  >
                    Lihat
                  </button>
                  <a
                    href={d.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buka ${d.judul} di tab baru`}
                    title="Buka di tab baru"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#006572]/25 text-[#006572] no-underline motion-safe:transition-colors hover:bg-[#006572]/5 focus-visible:outline-2 focus-visible:outline-[#006572] focus-visible:outline-offset-2"
                  >
                    <ExternalIcon />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* Viewer PDF pop-up */}
      {aktif &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Pratinjau: ${aktif.judul}`}
            onClick={() => setAktif(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 pb-4 pt-[104px] backdrop-blur-sm motion-safe:animate-gallery-fade sm:px-6 sm:pb-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-[85vh] max-h-[calc(100dvh-8rem)] w-full max-w-[820px] flex-col overflow-hidden rounded-xl bg-white shadow-floating"
            >
              {/* Bilah judul */}
              <div className="flex items-center gap-3 border-b border-[#006572]/15 px-4 py-3">
                <span className="text-[#006572]">
                  <FileIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-bold text-[#006572]">
                    {aktif.judul}
                  </p>
                  <p className="font-body text-xs text-[#006572]/60">
                    {aktif.kategori} · {aktif.tanggal}
                  </p>
                </div>
                <a
                  href={aktif.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden items-center gap-1.5 rounded-md border border-[#006572]/25 px-3 py-2 font-body text-xs font-semibold text-[#006572] no-underline hover:bg-[#006572]/5 sm:inline-flex"
                >
                  <ExternalIcon />
                  Tab baru
                </a>
                <button
                  type="button"
                  onClick={() => setAktif(null)}
                  aria-label="Tutup pratinjau"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#006572] motion-safe:transition-colors hover:bg-[#006572] hover:text-white focus-visible:outline-2 focus-visible:outline-[#006572] focus-visible:outline-offset-2"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Isi PDF */}
              <iframe
                src={aktif.file}
                title={aktif.judul}
                className="min-h-0 w-full flex-1 bg-[#f6fafb]"
              />
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

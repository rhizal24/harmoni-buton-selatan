"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * UnggahFoto, tombol CTA + modal form kiriman foto warga.
 * Kirim ke POST /api/galeri/kirim (multipart): foto ≤ 5 MB, nama &
 * keterangan opsional, honeypot anti-bot. Foto tampil di galeri setelah
 * diverifikasi admin di /admin/galeri.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Transisi tombol halus, pola sama dengan CTA GaleriHero/HeroBeranda. */
const BUTTON_MOTION =
  "motion-safe:transition-[transform,filter] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0";

const INPUT_CLASS =
  "w-full rounded-md border border-outline-variant px-3 py-2.5 font-body text-sm text-on-surface outline-none motion-safe:transition-colors focus:border-[#31577F]";

export function UnggahFoto() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tutup dengan Esc + kunci scroll saat modal terbuka.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Bersihkan object URL preview saat berganti/di-unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function pickFile(f: File | null) {
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("Hanya menerima berkas gambar.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function resetForm() {
    pickFile(null);
    setNama("");
    setKeterangan("");
    setError(null);
    setDone(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData(e.currentTarget);
      body.set("file", file);
      const res = await fetch("/api/galeri/kirim", { method: "POST", body });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Gagal mengirim foto. Coba lagi.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        className={`inline-flex min-h-11 cursor-pointer items-center rounded-md bg-[#31577F] px-8 py-3 font-body text-sm font-semibold text-white shadow-sm hover:[filter:drop-shadow(0_0_16px_rgba(49,87,127,0.55))_drop-shadow(0_0_44px_rgba(49,87,127,0.30))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31577F] ${BUTTON_MOTION}`}
      >
        Unggah Foto
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Unggah foto untuk galeri"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-[#0b1d20]/70 p-5 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-outline-variant bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {done ? (
                /* ── Sukses ── */
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D9E4F1] text-[#31577F]"
                    aria-hidden
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <h3 className="font-body text-xl font-bold text-[#31577F]">
                    Terima kasih!
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                    Fotomu sudah kami terima dan sedang menunggu verifikasi
                    admin. Setelah disetujui, foto akan tampil di Lensa Gaya Baru.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-1 rounded-md bg-[#31577F] px-6 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#00525c] motion-safe:transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-body text-xl font-bold text-[#31577F]">
                        Unggah Foto
                      </h3>
                      <p className="mt-1 font-body text-xs leading-relaxed text-on-surface-variant">
                        Foto akan diverifikasi admin sebelum tampil di galeri.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Tutup"
                      onClick={() => setOpen(false)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:border-[#31577F] hover:text-[#31577F] motion-safe:transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Pemilih foto + preview */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-md border-[1.5px] border-dashed border-outline-variant bg-surface-container-low hover:border-[#31577F] motion-safe:transition-colors"
                  >
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt="Pratinjau foto yang dipilih"
                        className="max-h-64 w-full object-contain"
                      />
                    ) : (
                      <span className="flex flex-col items-center gap-2 p-6 font-body text-sm text-on-surface-variant group-hover:text-[#31577F] motion-safe:transition-colors">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M12 16V4m0 0L7 9m5-5l5 5M4 20h16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Pilih foto (JPG/PNG/WebP, maks 5 MB)
                      </span>
                    )}
                  </button>

                  <label className="flex flex-col gap-1.5 font-body text-xs font-semibold text-on-surface">
                    Nama (opsional)
                    <input
                      type="text"
                      name="nama"
                      value={nama}
                      maxLength={80}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Nama kamu"
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 font-body text-xs font-semibold text-on-surface">
                    Keterangan foto (opsional)
                    <textarea
                      name="keterangan"
                      value={keterangan}
                      maxLength={200}
                      rows={2}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Misal: Senja di dermaga Karamba"
                      className={`${INPUT_CLASS} resize-none`}
                    />
                  </label>

                  {/* Honeypot anti-bot, tersembunyi dari manusia */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="hidden"
                  />

                  {error && (
                    <p
                      role="alert"
                      className="rounded-md border border-[#FFDAD6] bg-[#FFF4F3] px-3 py-2 font-body text-xs text-[#93000A]"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!file || busy}
                    className="min-h-11 rounded-md bg-[#31577F] px-6 py-3 font-body text-sm font-semibold text-white hover:bg-[#00525c] disabled:cursor-not-allowed disabled:opacity-40 motion-safe:transition-colors"
                  >
                    {busy ? "Mengirim…" : "Kirim Foto"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

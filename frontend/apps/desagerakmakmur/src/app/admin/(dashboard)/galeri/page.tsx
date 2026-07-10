"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { GalleryImageRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

/**
 * CRUD Galeri — foto desa untuk section "Lensa" di beranda.
 * Upload multi-file ke ImageKit, caption (deskripsi singkat) bisa diedit
 * per foto, urutan mengikuti display_order (angka kecil tampil dulu).
 *
 * Kiriman warga (via /api/galeri/kirim) masuk berstatus 'pending' dan
 * tampil di antrean "Menunggu Verifikasi": Terima → approved (tampil di
 * galeri publik), Tolak → hapus. Lihat
 * docs/supabase-migration-galeri-kiriman.sql.
 */

/** Status default 'approved' — kompatibel sebelum migrasi kolom status. */
const statusOf = (row: GalleryImageRow) => row.status ?? "approved";

export default function AdminGaleriPage() {
  const admin = useAdmin();
  const [rows, setRows] = useState<GalleryImageRow[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("gallery_images")
      .select("*")
      .eq("village_id", admin.village.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat galeri: ${error.message}` });
      return;
    }
    const list = (data ?? []) as GalleryImageRow[];
    setRows(list);
    setCaptions(Object.fromEntries(list.map((r) => [r.id, r.caption ?? ""])));
  }, [admin.village.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleUpload(files: FileList) {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = getSupabase();
      const startOrder = rows.length;
      for (const [i, file] of Array.from(files).entries()) {
        const url = await uploadFile(file, admin.accessToken);
        const { error } = await supabase.from("gallery_images").insert({
          village_id: admin.village.id,
          image_url: url,
          display_order: startOrder + i,
        });
        if (error) throw new Error(error.message);
      }
      setMsg({ kind: "ok", text: `${files.length} foto ditambahkan.` });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload gagal." });
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveCaption(row: GalleryImageRow) {
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase()
        .from("gallery_images")
        .update({ caption: captions[row.id]?.trim() || null })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      setMsg({ kind: "ok", text: "Deskripsi disimpan." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  /** Terima kiriman warga: status → approved, taruh di urutan paling akhir. */
  async function handleApprove(row: GalleryImageRow) {
    setBusy(true);
    setMsg(null);
    try {
      const approvedCount = rows.filter((r) => statusOf(r) === "approved").length;
      const { error } = await getSupabase()
        .from("gallery_images")
        .update({ status: "approved", display_order: approvedCount })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      setMsg({ kind: "ok", text: "Kiriman diterima — foto kini tampil di galeri." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menerima kiriman." });
    } finally {
      setBusy(false);
    }
  }

  /** Tolak kiriman warga: hapus row.
   * TODO(file): file ImageKit (row.file_id) belum ikut dihapus — sama
   * dengan perilaku hapus foto admin; butuh endpoint delete berotorisasi. */
  async function handleReject(row: GalleryImageRow) {
    if (!window.confirm("Tolak dan hapus kiriman ini?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase().from("gallery_images").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      setMsg({ kind: "ok", text: "Kiriman ditolak." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menolak kiriman." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row: GalleryImageRow) {
    if (!window.confirm("Hapus foto ini dari galeri?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase().from("gallery_images").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      void deleteUploadedFile(row.image_url, admin.accessToken);
      setMsg({ kind: "ok", text: "Foto dihapus." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setBusy(false);
    }
  }

  const pending = rows.filter((r) => statusOf(r) === "pending");
  const approved = rows.filter((r) => statusOf(r) === "approved");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Galeri Foto</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">
            Foto section “Lensa” di beranda. Tiap 6 foto menjadi satu halaman galeri.
          </p>
        </div>
        <label className="cursor-pointer rounded-md bg-[#006572] px-4 py-2 font-body text-sm font-semibold text-white hover:bg-[#026F7D]">
          + Upload Foto
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={busy}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </header>

      {msg && (
        <p
          role="status"
          className={`rounded-md border px-3 py-2 font-body text-sm ${
            msg.kind === "ok"
              ? "border-[#CFF1F4] bg-[#EFFBFC] text-[#00434B]"
              : "border-[#FFDAD6] bg-[#FFF4F3] text-[#93000A]"
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* ── Antrean kiriman warga menunggu verifikasi ── */}
      {pending.length > 0 && (
        <section
          aria-label="Kiriman menunggu verifikasi"
          className="rounded-xl border border-[#CFF1F4] bg-[#EFFBFC] p-4"
        >
          <h2 className="font-body text-base font-bold text-[#00434B]">
            Menunggu Verifikasi ({pending.length})
          </h2>
          <p className="mt-0.5 font-body text-xs text-[#00434B]/70">
            Kiriman foto dari warga. Terima untuk menampilkannya di galeri,
            atau tolak untuk menghapusnya.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pending.map((row) => (
              <div key={row.id} className="rounded-xl border border-[#D0D0D0] bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.image_url}
                  alt={row.caption ?? "Kiriman foto warga"}
                  className="aspect-[4/3] w-full rounded-md border border-[#EEEEEE] object-cover"
                  loading="lazy"
                />
                <p className="mt-2 font-body text-xs text-[#2E2E2E]">
                  {row.caption ?? <span className="text-[#5A5A5A]">Tanpa keterangan</span>}
                </p>
                <p className="mt-1 font-body text-[11px] text-[#5A5A5A]">
                  Dari: {row.submitted_by ?? "Anonim"} ·{" "}
                  {new Date(row.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleApprove(row)}
                    className="flex-1 rounded-md bg-[#006572] px-2 py-1.5 font-body text-xs font-semibold text-white hover:bg-[#026F7D] disabled:opacity-40"
                  >
                    Terima
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleReject(row)}
                    className="rounded-md border border-[#FFDAD6] px-3 py-1.5 font-body text-xs font-semibold text-[#93000A] hover:bg-[#FFF4F3] disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {approved.length === 0 ? (
        <p className="rounded-xl border border-[#D0D0D0] bg-white px-4 py-10 text-center font-body text-sm text-[#5A5A5A]">
          Belum ada foto. Klik “Upload Foto” untuk menambahkan.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {approved.map((row) => (
            <div key={row.id} className="rounded-xl border border-[#D0D0D0] bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.image_url}
                alt={row.caption ?? "Foto galeri"}
                className="aspect-[4/3] w-full rounded-md border border-[#EEEEEE] object-cover"
                loading="lazy"
              />
              <textarea
                rows={2}
                placeholder="Deskripsi singkat foto…"
                value={captions[row.id] ?? ""}
                onChange={(e) =>
                  setCaptions((c) => ({ ...c, [row.id]: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-[#D0D0D0] px-2.5 py-1.5 font-body text-xs text-[#2E2E2E] outline-none focus:border-[#006572]"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy || (captions[row.id] ?? "") === (row.caption ?? "")}
                  onClick={() => void handleSaveCaption(row)}
                  className="flex-1 rounded-md border border-[#006572] px-2 py-1.5 font-body text-xs font-semibold text-[#006572] hover:bg-[#CFF1F4] disabled:opacity-40"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDelete(row)}
                  className="rounded-md border border-[#FFDAD6] px-3 py-1.5 font-body text-xs font-semibold text-[#93000A] hover:bg-[#FFF4F3] disabled:opacity-50"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

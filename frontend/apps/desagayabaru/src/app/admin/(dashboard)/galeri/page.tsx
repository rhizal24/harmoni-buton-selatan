"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { GalleryImageRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

/**
 * CRUD Galeri, foto desa untuk section "Lensa" di beranda.
 * Upload multi-file ke ImageKit, caption (deskripsi singkat) bisa diedit
 * per foto, urutan mengikuti display_order (angka kecil tampil dulu).
 */
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

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Galeri Foto</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">
            Foto section “Lensa” di beranda. Tiap 6 foto menjadi satu halaman galeri.
          </p>
        </div>
        <label className="cursor-pointer rounded-md bg-[#31577F] px-4 py-2 font-body text-sm font-semibold text-white hover:bg-[#27466A]">
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
              ? "border-[#D9E4F1] bg-[#F2F6FB] text-[#1F3A59]"
              : "border-[#FFDAD6] bg-[#FFF4F3] text-[#93000A]"
          }`}
        >
          {msg.text}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-[#D0D0D0] bg-white px-4 py-10 text-center font-body text-sm text-[#5A5A5A]">
          Belum ada foto. Klik “Upload Foto” untuk menambahkan.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((row) => (
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
                className="mt-2 w-full rounded-md border border-[#D0D0D0] px-2.5 py-1.5 font-body text-xs text-[#2E2E2E] outline-none focus:border-[#31577F]"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy || (captions[row.id] ?? "") === (row.caption ?? "")}
                  onClick={() => void handleSaveCaption(row)}
                  className="flex-1 rounded-md border border-[#31577F] px-2 py-1.5 font-body text-xs font-semibold text-[#31577F] hover:bg-[#D9E4F1] disabled:opacity-40"
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

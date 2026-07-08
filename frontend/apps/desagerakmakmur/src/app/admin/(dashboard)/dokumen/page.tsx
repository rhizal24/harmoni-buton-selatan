"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/admin";
import type { DocumentRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

interface DokumenForm {
  id: string | null;
  title: string;
  category: string;
  period_label: string;
  description: string;
  file_url: string;
  file_size_kb: number | null;
}

const EMPTY_FORM: DokumenForm = {
  id: null,
  title: "",
  category: "Lainnya",
  period_label: "",
  description: "",
  file_url: "",
  file_size_kb: null,
};

const KATEGORI_SARAN = ["Profil", "Perencanaan", "Anggaran", "Laporan", "Regulasi", "Lainnya"];

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";

/**
 * Dokumen Desa — CRUD dokumen publik (PDF) di halaman /profil.
 * File di-upload ke ImageKit; URL + ukurannya tersimpan di tabel documents.
 */
export default function AdminDokumenPage() {
  const admin = useAdmin();
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [form, setForm] = useState<DokumenForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("documents")
      .select("*")
      .eq("village_id", admin.village.id)
      .order("created_at", { ascending: false });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat dokumen: ${error.message}` });
      return;
    }
    setRows((data ?? []) as DocumentRow[]);
  }, [admin.village.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (!form.file_url) {
        throw new Error("Upload dulu file PDF-nya sebelum menyimpan.");
      }
      const payload = {
        village_id: admin.village.id,
        title: form.title.trim(),
        category: form.category.trim() || "Lainnya",
        period_label: form.period_label.trim() || null,
        description: form.description.trim() || null,
        file_url: form.file_url,
        file_size_kb: form.file_size_kb,
        uploaded_by: admin.profile.id,
      };
      const supabase = getSupabase();
      const { error } = form.id
        ? await supabase.from("documents").update(payload).eq("id", form.id)
        : await supabase.from("documents").insert(payload);
      if (error) throw new Error(error.message);
      setMsg({ kind: "ok", text: form.id ? "Perubahan disimpan." : "Dokumen ditambahkan." });
      if (!form.id) setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row: DocumentRow) {
    if (!window.confirm(`Hapus dokumen "${row.title}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase().from("documents").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      if (form.id === row.id) setForm(EMPTY_FORM);
      setMsg({ kind: "ok", text: "Dokumen dihapus." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setBusy(false);
    }
  }

  async function handleFileUpload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken);
      setForm((f) => ({
        ...f,
        file_url: url,
        file_size_kb: Math.round(file.size / 1024),
        title: f.title || file.name.replace(/\.pdf$/i, ""),
      }));
      setMsg({ kind: "ok", text: "File ter-upload. Jangan lupa klik Simpan." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload gagal." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Dokumen Desa</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">
            Dokumen publik (PDF) yang bisa diunduh dari halaman /profil.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setMsg(null);
          }}
          className="rounded-md bg-[#006572] px-4 py-2 font-body text-sm font-semibold text-white hover:bg-[#026F7D]"
        >
          + Dokumen Baru
        </button>
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

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        {/* Daftar */}
        <section className="overflow-hidden rounded-xl border border-[#D0D0D0] bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#D0D0D0] bg-[#F6F6F6] text-left">
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Dokumen
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Kategori
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center font-body text-sm text-[#5A5A5A]">
                    Belum ada dokumen. Tambahkan lewat form di samping.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#EEEEEE] last:border-0">
                  <td className="px-4 py-3">
                    <a
                      href={row.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-sm font-semibold text-[#006572] no-underline hover:underline"
                    >
                      {row.title}
                    </a>
                    <p className="font-body text-xs text-[#5A5A5A]">
                      {row.period_label ?? new Date(row.created_at).getFullYear()}
                      {row.file_size_kb != null && ` • ${row.file_size_kb} KB`}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#CFF1F4] px-2.5 py-0.5 font-body text-xs font-semibold text-[#00434B]">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          id: row.id,
                          title: row.title,
                          category: row.category,
                          period_label: row.period_label ?? "",
                          description: row.description ?? "",
                          file_url: row.file_url,
                          file_size_kb: row.file_size_kb,
                        });
                        setMsg(null);
                      }}
                      className="rounded-md border border-[#006572] px-3 py-1.5 font-body text-xs font-semibold text-[#006572] hover:bg-[#CFF1F4]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row)}
                      disabled={busy}
                      className="ml-2 rounded-md border border-[#FFDAD6] px-3 py-1.5 font-body text-xs font-semibold text-[#93000A] hover:bg-[#FFF4F3] disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Form */}
        <section className="h-fit rounded-xl border border-[#D0D0D0] bg-white p-5">
          <h2 className="font-body text-lg font-bold text-[#2E2E2E]">
            {form.id ? "Edit Dokumen" : "Dokumen Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>File PDF *</span>
              {form.file_url && (
                <a
                  href={form.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-body text-xs text-[#006572] underline"
                >
                  {form.file_url}
                </a>
              )}
              <input
                type="file"
                accept="application/pdf"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file);
                  e.target.value = "";
                }}
                className="font-body text-sm text-[#5A5A5A] file:mr-3 file:rounded-md file:border file:border-[#006572] file:bg-white file:px-3 file:py-1.5 file:font-body file:text-xs file:font-semibold file:text-[#006572]"
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Judul *</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Kategori</span>
                <input
                  list="dok-kategori"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputCls}
                />
                <datalist id="dok-kategori">
                  {KATEGORI_SARAN.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Tahun terbit</span>
                <input
                  placeholder="mis. 2025"
                  value={form.period_label}
                  onChange={(e) => setForm((f) => ({ ...f, period_label: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Deskripsi (opsional)</span>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls}
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-[#006572] px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
              >
                {busy ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Dokumen"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm(EMPTY_FORM)}
                  className="rounded-md border border-[#D0D0D0] px-4 py-2.5 font-body text-sm font-semibold text-[#5A5A5A] hover:bg-[#F6F6F6]"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { ArticleCategory, ArticleRow } from "@/lib/db-types";
import { useAdmin } from "./admin-context";

interface ArtikelForm {
  id: string | null;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  is_published: boolean;
}

const EMPTY_FORM: ArtikelForm = {
  id: null,
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  is_published: false,
};

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * CRUD artikel (dipakai halaman Berita & UMKM — kategori berbeda,
 * tabel sama: articles). Slug dibuat otomatis dari judul, unik per desa;
 * published_at terisi saat pertama kali ditayangkan.
 */
export function ArtikelManager({
  category,
  judul,
  deskripsi,
}: {
  category: ArticleCategory;
  judul: string;
  deskripsi: string;
}) {
  const admin = useAdmin();
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [form, setForm] = useState<ArtikelForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const editing = rows.find((r) => r.id === form.id) ?? null;

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("articles")
      .select("*")
      .eq("village_id", admin.village.id)
      .eq("category", category)
      .order("created_at", { ascending: false });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat artikel: ${error.message}` });
      return;
    }
    setRows((data ?? []) as ArticleRow[]);
  }, [admin.village.id, category]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Slug unik per desa: tambah -2, -3, … bila judul sama sudah dipakai.
  async function uniqueSlug(title: string, ignoreId: string | null): Promise<string> {
    const seed = slugify(title) || category;
    const { data, error } = await getSupabase()
      .from("articles")
      .select("id, slug")
      .eq("village_id", admin.village.id)
      .like("slug", `${seed}%`);
    if (error) throw new Error(error.message);
    const taken = new Set(
      ((data ?? []) as { id: string; slug: string }[])
        .filter((r) => r.id !== ignoreId)
        .map((r) => r.slug),
    );
    if (!taken.has(seed)) return seed;
    let n = 2;
    while (taken.has(`${seed}-${n}`)) n += 1;
    return `${seed}-${n}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const supabase = getSupabase();
      const slug = await uniqueSlug(form.title, form.id);
      const wasPublished = editing?.published_at != null;
      const payload = {
        village_id: admin.village.id,
        category,
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        author_id: admin.profile.id,
        is_published: form.is_published,
        // published_at terisi sekali, saat pertama kali tayang
        published_at:
          form.is_published && !wasPublished
            ? new Date().toISOString()
            : (editing?.published_at ?? null),
        updated_at: new Date().toISOString(),
      };
      const { error } = form.id
        ? await supabase.from("articles").update(payload).eq("id", form.id)
        : await supabase.from("articles").insert(payload);
      if (error) throw new Error(error.message);

      if (form.id && editing?.cover_image_url && editing.cover_image_url !== (form.cover_image_url || null)) {
        void deleteUploadedFile(editing.cover_image_url, admin.accessToken);
      }
      setMsg({ kind: "ok", text: form.id ? "Perubahan disimpan." : "Artikel ditambahkan." });
      if (!form.id) setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row: ArticleRow) {
    if (!window.confirm(`Hapus artikel "${row.title}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase().from("articles").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      if (form.id === row.id) setForm(EMPTY_FORM);
      void deleteUploadedFile(row.cover_image_url, admin.accessToken);
      setMsg({ kind: "ok", text: "Artikel dihapus." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setBusy(false);
    }
  }

  async function handleCoverUpload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken);
      setForm((f) => ({ ...f, cover_image_url: url }));
      setMsg({ kind: "ok", text: "Cover ter-upload. Jangan lupa klik Simpan." });
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
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">{judul}</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">{deskripsi}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setMsg(null);
          }}
          className="rounded-md bg-[#006572] px-4 py-2 font-body text-sm font-semibold text-white hover:bg-[#026F7D]"
        >
          + Artikel Baru
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

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        {/* Daftar */}
        <section className="overflow-hidden rounded-xl border border-[#D0D0D0] bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#D0D0D0] bg-[#F6F6F6] text-left">
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Judul
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center font-body text-sm text-[#5A5A5A]">
                    Belum ada artikel. Tambahkan lewat form di samping.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#EEEEEE] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-body text-sm font-semibold text-[#2E2E2E]">{row.title}</p>
                    <p className="font-body text-xs text-[#5A5A5A]">
                      /{row.slug}
                      {row.published_at &&
                        ` • ${new Date(row.published_at).toLocaleDateString("id-ID")}`}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-body text-xs font-semibold ${
                        row.is_published
                          ? "bg-[#CFF1F4] text-[#00434B]"
                          : "bg-[#E2E2E2] text-[#5A5A5A]"
                      }`}
                    >
                      {row.is_published ? "Tayang" : "Draf"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          id: row.id,
                          title: row.title,
                          excerpt: row.excerpt ?? "",
                          content: row.content,
                          cover_image_url: row.cover_image_url ?? "",
                          is_published: row.is_published,
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
            {form.id ? `Edit: ${editing?.title ?? ""}` : "Artikel Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Judul *</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Ringkasan (excerpt)</span>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                className="w-full rounded-md border border-[#D0D0D0] px-3 py-2 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Isi artikel *</span>
              <textarea
                required
                rows={10}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="w-full rounded-md border border-[#D0D0D0] px-3 py-2 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20"
              />
            </label>

            {/* Cover */}
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Foto cover</span>
              {form.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.cover_image_url}
                  alt="Cover artikel"
                  className="aspect-video w-full rounded-md border border-[#D0D0D0] object-cover"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleCoverUpload(file);
                  e.target.value = "";
                }}
                className="font-body text-sm text-[#5A5A5A] file:mr-3 file:rounded-md file:border file:border-[#006572] file:bg-white file:px-3 file:py-1.5 file:font-body file:text-xs file:font-semibold file:text-[#006572]"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                className="h-4 w-4 accent-[#006572]"
              />
              <span className="font-body text-sm text-[#2E2E2E]">Tayangkan di situs</span>
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-[#006572] px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
              >
                {busy ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Artikel"}
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

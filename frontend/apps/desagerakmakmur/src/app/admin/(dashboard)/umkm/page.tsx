"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { UmkmRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

interface UmkmForm {
  id: string | null;
  nama: string;
  kategori: string;
  pemilik: string;
  lokasi: string;
  deskripsi: string;
  produk: string; // dipisah koma
  harga_label: string;
  wa: string;
  instagram_url: string;
  tiktok_url: string;
  maps_url: string;
  latitude: string;
  longitude: string;
  foto_url: string;
  display_order: string;
  is_published: boolean;
}

const EMPTY_FORM: UmkmForm = {
  id: null,
  nama: "",
  kategori: "",
  pemilik: "",
  lokasi: "",
  deskripsi: "",
  produk: "",
  harga_label: "",
  wa: "",
  instagram_url: "",
  tiktok_url: "",
  maps_url: "",
  latitude: "",
  longitude: "",
  foto_url: "",
  display_order: "0",
  is_published: true,
};

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";

/**
 * CRUD UMKM — etalase usaha warga di halaman /informasi (section UmkmDesa).
 * Field mengikuti persis yang dirender frontend: nama, kategori, pemilik,
 * lokasi, deskripsi, produk (chip), harga, WA, Instagram, TikTok, link Maps,
 * dan foto (upload ImageKit). Tabel: `umkm`
 * (docs/supabase-migration-umkm.sql).
 */
export default function AdminUmkmPage() {
  const admin = useAdmin();
  const [rows, setRows] = useState<UmkmRow[]>([]);
  const [form, setForm] = useState<UmkmForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("umkm")
      .select("*")
      .eq("village_id", admin.village.id)
      .order("display_order", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat UMKM: ${error.message}` });
      return;
    }
    setRows((data ?? []) as UmkmRow[]);
  }, [admin.village.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const payload = {
        village_id: admin.village.id,
        nama: form.nama.trim(),
        kategori: form.kategori.trim() || null,
        pemilik: form.pemilik.trim() || null,
        lokasi: form.lokasi.trim() || null,
        deskripsi: form.deskripsi.trim() || null,
        produk: form.produk
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        harga_label: form.harga_label.trim() || null,
        wa: form.wa.replace(/[^0-9]/g, "") || null,
        instagram_url: form.instagram_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        maps_url: form.maps_url.trim() || null,
        latitude: form.latitude.trim() ? Number(form.latitude) : null,
        longitude: form.longitude.trim() ? Number(form.longitude) : null,
        foto_url: form.foto_url || null,
        display_order: Number(form.display_order) || 0,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      };
      const supabase = getSupabase();
      const { error } = form.id
        ? await supabase.from("umkm").update(payload).eq("id", form.id)
        : await supabase.from("umkm").insert(payload);
      if (error) throw new Error(error.message);
      const prev = form.id ? rows.find((r) => r.id === form.id) : null;
      if (prev?.foto_url && prev.foto_url !== (form.foto_url || null)) {
        void deleteUploadedFile(prev.foto_url, admin.accessToken);
      }
      setMsg({ kind: "ok", text: form.id ? "Perubahan disimpan." : "UMKM ditambahkan." });
      if (!form.id) setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row: UmkmRow) {
    if (!window.confirm(`Hapus UMKM "${row.nama}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase().from("umkm").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      if (form.id === row.id) setForm(EMPTY_FORM);
      void deleteUploadedFile(row.foto_url, admin.accessToken);
      setMsg({ kind: "ok", text: "UMKM dihapus." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setBusy(false);
    }
  }

  async function handleFotoUpload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken);
      setForm((f) => ({ ...f, foto_url: url }));
      setMsg({ kind: "ok", text: "Foto ter-upload. Jangan lupa klik Simpan." });
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
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">UMKM</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">
            Etalase usaha warga di halaman /informasi. Draf tidak tampil di situs.
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
          + UMKM Baru
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
                  Usaha
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
                    Belum ada UMKM. Tambahkan lewat form di samping.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#EEEEEE] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.foto_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.foto_url}
                          alt={row.nama}
                          className="h-10 w-10 rounded-md border border-[#EEEEEE] object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#CFF1F4] font-body text-xs font-bold text-[#00434B]">
                          {row.nama.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-body text-sm font-semibold text-[#2E2E2E]">{row.nama}</p>
                        <p className="font-body text-xs text-[#5A5A5A]">
                          {[row.kategori, row.pemilik].filter(Boolean).join(" · ") || "-"}
                        </p>
                      </div>
                    </div>
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
                          nama: row.nama,
                          kategori: row.kategori ?? "",
                          pemilik: row.pemilik ?? "",
                          lokasi: row.lokasi ?? "",
                          deskripsi: row.deskripsi ?? "",
                          produk: row.produk.join(", "),
                          harga_label: row.harga_label ?? "",
                          wa: row.wa ?? "",
                          instagram_url: row.instagram_url ?? "",
                          tiktok_url: row.tiktok_url ?? "",
                          maps_url: row.maps_url ?? "",
                          latitude: row.latitude != null ? String(row.latitude) : "",
                          longitude: row.longitude != null ? String(row.longitude) : "",
                          foto_url: row.foto_url ?? "",
                          display_order: String(row.display_order),
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
            {form.id ? "Edit UMKM" : "UMKM Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Nama usaha *</span>
              <input
                required
                value={form.nama}
                onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                className={inputCls}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Kategori</span>
                <input
                  placeholder="mis. Kuliner"
                  value={form.kategori}
                  onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Pemilik / pengelola</span>
                <input
                  value={form.pemilik}
                  onChange={(e) => setForm((f) => ({ ...f, pemilik: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Deskripsi</span>
              <textarea
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
                className="w-full rounded-md border border-[#D0D0D0] px-3 py-2 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Produk unggulan (pisahkan dengan koma)</span>
              <input
                placeholder="Keripik pisang, Abon ikan, Sambal roa"
                value={form.produk}
                onChange={(e) => setForm((f) => ({ ...f, produk: e.target.value }))}
                className={inputCls}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Kisaran harga</span>
                <input
                  placeholder="Rp15.000-Rp60.000"
                  value={form.harga_label}
                  onChange={(e) => setForm((f) => ({ ...f, harga_label: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Lokasi singkat</span>
                <input
                  placeholder="mis. Dusun 1, dekat dermaga"
                  value={form.lokasi}
                  onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>WhatsApp (angka saja)</span>
                <input
                  placeholder="6281234567890"
                  value={form.wa}
                  onChange={(e) => setForm((f) => ({ ...f, wa: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Link Google Maps</span>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/…"
                  value={form.maps_url}
                  onChange={(e) => setForm((f) => ({ ...f, maps_url: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Latitude</span>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Longitude</span>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>
            <p className="-mt-2 font-body text-xs text-[#5A5A5A]">
              Isi koordinat supaya usaha ini tampil sebagai titik di peta interaktif (/peta).
            </p>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Instagram (URL)</span>
                <input
                  type="url"
                  placeholder="https://instagram.com/namausaha"
                  value={form.instagram_url}
                  onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>TikTok (URL)</span>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@namausaha"
                  value={form.tiktok_url}
                  onChange={(e) => setForm((f) => ({ ...f, tiktok_url: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            {/* Foto */}
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Foto usaha / produk</span>
              {form.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.foto_url}
                  alt="Foto UMKM"
                  className="aspect-video w-full rounded-md border border-[#D0D0D0] object-cover"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFotoUpload(file);
                  e.target.value = "";
                }}
                className="font-body text-sm text-[#5A5A5A] file:mr-3 file:rounded-md file:border file:border-[#006572] file:bg-white file:px-3 file:py-1.5 file:font-body file:text-xs file:font-semibold file:text-[#006572]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Urutan tampil</span>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex items-center gap-2 self-end pb-2">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  className="h-4 w-4 accent-[#006572]"
                />
                <span className="font-body text-sm text-[#2E2E2E]">Tayangkan di situs</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-[#006572] px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
              >
                {busy ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah UMKM"}
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

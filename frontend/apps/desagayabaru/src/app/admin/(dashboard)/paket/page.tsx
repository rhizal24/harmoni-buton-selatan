"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import type { TourismPackageRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

interface PaketForm {
  id: string | null;
  name: string;
  description: string;
  price: string;
  price_unit: string;
  includes: string; // satu benefit per baris
  is_published: boolean;
}

const EMPTY_FORM: PaketForm = {
  id: null,
  name: "",
  description: "",
  price: "",
  price_unit: "per orang",
  includes: "",
  is_published: true,
};

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#31577F] focus:ring-2 focus:ring-[#31577F]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";

/**
 * CRUD Paket Wisata, tampil di kartu "Jelajah Desa" (beranda & /wisata).
 * Kolom `includes` dipakai sebagai daftar benefit kartu (satu per baris).
 */
export default function AdminPaketPage() {
  const admin = useAdmin();
  const [rows, setRows] = useState<TourismPackageRow[]>([]);
  const [form, setForm] = useState<PaketForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("tourism_packages")
      .select("*")
      .eq("village_id", admin.village.id)
      .order("price", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat data: ${error.message}` });
      return;
    }
    setRows((data ?? []) as TourismPackageRow[]);
  }, [admin.village.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function startEdit(row: TourismPackageRow) {
    setForm({
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      price: String(row.price),
      price_unit: row.price_unit ?? "per orang",
      includes: (row.includes ?? []).join("\n"),
      is_published: row.is_published,
    });
    setMsg(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const payload = {
        village_id: admin.village.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        price_unit: form.price_unit.trim() || "per orang",
        includes: form.includes
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        is_published: form.is_published,
      };
      if (!Number.isFinite(payload.price) || payload.price < 0) {
        throw new Error("Harga harus angka yang valid.");
      }
      const supabase = getSupabase();
      const { error } = form.id
        ? await supabase.from("tourism_packages").update(payload).eq("id", form.id)
        : await supabase.from("tourism_packages").insert(payload);
      if (error) throw new Error(error.message);

      setMsg({ kind: "ok", text: form.id ? "Perubahan disimpan." : "Paket ditambahkan." });
      if (!form.id) setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row: TourismPackageRow) {
    if (!window.confirm(`Hapus paket "${row.name}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase()
        .from("tourism_packages")
        .delete()
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      if (form.id === row.id) setForm(EMPTY_FORM);
      setMsg({ kind: "ok", text: "Paket dihapus." });
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
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Paket Wisata</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">
            Kartu paket di section “Jelajah Desa”. Benefit diambil dari kolom
            “Termasuk” (satu per baris).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setMsg(null);
          }}
          className="rounded-md bg-[#31577F] px-4 py-2 font-body text-sm font-semibold text-white hover:bg-[#27466A]"
        >
          + Paket Baru
        </button>
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

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Daftar */}
        <section className="overflow-hidden rounded-xl border border-[#D0D0D0] bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#D0D0D0] bg-[#F6F6F6] text-left">
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Paket
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Harga
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
                  <td colSpan={4} className="px-4 py-8 text-center font-body text-sm text-[#5A5A5A]">
                    Belum ada paket. Tambahkan lewat form di samping.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#EEEEEE] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-body text-sm font-semibold text-[#2E2E2E]">{row.name}</p>
                    {row.description && (
                      <p className="font-body text-xs text-[#5A5A5A]">{row.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-[#31577F]">
                    Rp {new Intl.NumberFormat("id-ID").format(row.price)}{" "}
                    <span className="text-xs text-[#5A5A5A]">{row.price_unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-body text-xs font-semibold ${
                        row.is_published
                          ? "bg-[#D9E4F1] text-[#1F3A59]"
                          : "bg-[#E2E2E2] text-[#5A5A5A]"
                      }`}
                    >
                      {row.is_published ? "Tayang" : "Draf"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="rounded-md border border-[#31577F] px-3 py-1.5 font-body text-xs font-semibold text-[#31577F] hover:bg-[#D9E4F1]"
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
            {form.id ? "Edit Paket" : "Paket Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Nama paket *</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Deskripsi singkat</span>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Harga (Rp) *</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Satuan</span>
                <input
                  value={form.price_unit}
                  onChange={(e) => setForm((f) => ({ ...f, price_unit: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Termasuk (satu per baris)</span>
              <textarea
                rows={4}
                placeholder={"Perahu privat\nPemandu lokal\nWelcome drink"}
                value={form.includes}
                onChange={(e) => setForm((f) => ({ ...f, includes: e.target.value }))}
                className="w-full rounded-md border border-[#D0D0D0] px-3 py-2 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#31577F] focus:ring-2 focus:ring-[#31577F]/20"
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                className="h-4 w-4 accent-[#31577F]"
              />
              <span className="font-body text-sm text-[#2E2E2E]">Tayangkan di situs</span>
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-[#31577F] px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#27466A] disabled:opacity-60"
              >
                {busy ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Paket"}
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

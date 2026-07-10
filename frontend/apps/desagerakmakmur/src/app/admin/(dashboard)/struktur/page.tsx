"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { OrganizationStructureRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

interface AnggotaForm {
  id: string | null;
  position_name: string;
  person_name: string;
  parent_id: string;
  photo_url: string;
  display_order: string;
}

const EMPTY_FORM: AnggotaForm = {
  id: null,
  position_name: "",
  person_name: "",
  parent_id: "",
  photo_url: "",
  display_order: "0",
};

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";

/**
 * Struktur Organisasi — CRUD perangkat desa untuk bagan hierarki di /profil.
 * `Atasan langsung` menentukan posisi node di bagan (kosong = puncak).
 * Foto di-upload ke ImageKit; tanpa foto, node menampilkan inisial.
 */
export default function AdminStrukturPage() {
  const admin = useAdmin();
  const [rows, setRows] = useState<OrganizationStructureRow[]>([]);
  const [form, setForm] = useState<AnggotaForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("organization_structure")
      .select("*")
      .eq("village_id", admin.village.id)
      .order("display_order", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat struktur: ${error.message}` });
      return;
    }
    setRows((data ?? []) as OrganizationStructureRow[]);
  }, [admin.village.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const byId = new Map(rows.map((r) => [r.id, r]));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const payload = {
        village_id: admin.village.id,
        position_name: form.position_name.trim(),
        person_name: form.person_name.trim(),
        parent_id: form.parent_id || null,
        photo_url: form.photo_url || null,
        display_order: Number(form.display_order) || 0,
        updated_at: new Date().toISOString(),
      };
      const supabase = getSupabase();
      const { error } = form.id
        ? await supabase.from("organization_structure").update(payload).eq("id", form.id)
        : await supabase.from("organization_structure").insert(payload);
      if (error) throw new Error(error.message);
      const prev = form.id ? rows.find((r) => r.id === form.id) : null;
      if (prev?.photo_url && prev.photo_url !== (form.photo_url || null)) {
        void deleteUploadedFile(prev.photo_url, admin.accessToken);
      }
      setMsg({ kind: "ok", text: form.id ? "Perubahan disimpan." : "Anggota ditambahkan." });
      if (!form.id) setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row: OrganizationStructureRow) {
    if (
      !window.confirm(
        `Hapus "${row.position_name} — ${row.person_name}"? Bawahannya otomatis naik jadi tanpa atasan.`,
      )
    )
      return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase()
        .from("organization_structure")
        .delete()
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      if (form.id === row.id) setForm(EMPTY_FORM);
      void deleteUploadedFile(row.photo_url, admin.accessToken);
      setMsg({ kind: "ok", text: "Anggota dihapus." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken);
      setForm((f) => ({ ...f, photo_url: url }));
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
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Struktur Organisasi</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">
            Bagan perangkat desa di halaman /profil. Atur hierarki lewat “Atasan langsung”.
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
          + Anggota Baru
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
                  Jabatan / Nama
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Atasan
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center font-body text-sm text-[#5A5A5A]">
                    Belum ada data. Tambahkan mulai dari Kepala Desa (tanpa atasan).
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#EEEEEE] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.photo_url}
                          alt={row.person_name}
                          className="h-9 w-9 rounded-md border border-[#EEEEEE] object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#CFF1F4] font-body text-xs font-bold text-[#00434B]">
                          {row.person_name
                            .split(" ")
                            .slice(0, 2)
                            .map((s) => s[0])
                            .join("")}
                        </span>
                      )}
                      <div>
                        <p className="font-body text-sm font-semibold text-[#2E2E2E]">
                          {row.position_name}
                        </p>
                        <p className="font-body text-xs text-[#5A5A5A]">{row.person_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-[#5A5A5A]">
                    {row.parent_id ? (byId.get(row.parent_id)?.position_name ?? "—") : "Puncak"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          id: row.id,
                          position_name: row.position_name,
                          person_name: row.person_name,
                          parent_id: row.parent_id ?? "",
                          photo_url: row.photo_url ?? "",
                          display_order: String(row.display_order),
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
            {form.id ? "Edit Anggota" : "Anggota Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Jabatan *</span>
              <input
                required
                placeholder="mis. Kepala Desa"
                value={form.position_name}
                onChange={(e) => setForm((f) => ({ ...f, position_name: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Nama *</span>
              <input
                required
                value={form.person_name}
                onChange={(e) => setForm((f) => ({ ...f, person_name: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Atasan langsung</span>
              <select
                value={form.parent_id}
                onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                className={inputCls}
              >
                <option value="">— Puncak struktur (tanpa atasan) —</option>
                {rows
                  .filter((r) => r.id !== form.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.position_name} — {r.person_name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Urutan tampil</span>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
                className={inputCls}
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Foto (opsional)</span>
              {form.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photo_url}
                  alt="Foto anggota"
                  className="aspect-[4/3] w-full max-w-[200px] rounded-md border border-[#D0D0D0] object-cover"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handlePhotoUpload(file);
                  e.target.value = "";
                }}
                className="font-body text-sm text-[#5A5A5A] file:mr-3 file:rounded-md file:border file:border-[#006572] file:bg-white file:px-3 file:py-1.5 file:font-body file:text-xs file:font-semibold file:text-[#006572]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-[#006572] px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
              >
                {busy ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Anggota"}
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

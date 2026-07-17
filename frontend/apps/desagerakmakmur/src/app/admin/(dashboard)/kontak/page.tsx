"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import type { FooterContactRow, VillageRow } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

interface SosmedForm {
  whatsapp: string; // nomor WA utama desa (dipakai seragam di /wisata)
  email: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
}

interface KontakForm {
  id: string | null;
  name: string;
  jabatan: string;
  contact_type: "wa" | "email";
  value: string; // nomor wa.me (tanpa "+"/spasi) atau alamat email
  display_order: string;
}

const EMPTY_KONTAK: KontakForm = {
  id: null,
  name: "",
  jabatan: "",
  contact_type: "wa",
  value: "",
  display_order: "0",
};

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";
const hintCls = "font-body text-xs text-[#5A5A5A]";

/**
 * Kontak Footer — kelola info kontak yang tampil di footer semua halaman:
 * email + sosmed desa (kolom `villages`), dan daftar kontak WhatsApp cepat
 * perangkat desa (tabel `footer_contacts`, CRUD dengan urutan tampil).
 * Lihat docs/supabase-migration-kontak.sql.
 */
export default function AdminKontakPage() {
  const admin = useAdmin();
  const [sosmed, setSosmed] = useState<SosmedForm | null>(null);
  const [savingSosmed, setSavingSosmed] = useState(false);

  const [rows, setRows] = useState<FooterContactRow[]>([]);
  const [form, setForm] = useState<KontakForm>(EMPTY_KONTAK);
  const [busy, setBusy] = useState(false);

  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const loadSosmed = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("villages")
      .select("whatsapp, email, instagram_url, tiktok_url, facebook_url")
      .eq("id", admin.village.id)
      .maybeSingle();
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat kontak: ${error.message}` });
      return;
    }
    const v = (data ?? {}) as Partial<VillageRow>;
    setSosmed({
      whatsapp: v.whatsapp ?? "",
      email: v.email ?? "",
      instagram_url: v.instagram_url ?? "",
      tiktok_url: v.tiktok_url ?? "",
      facebook_url: v.facebook_url ?? "",
    });
  }, [admin.village.id]);

  const loadKontak = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("footer_contacts")
      .select("*")
      .eq("village_id", admin.village.id)
      .order("display_order", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat kontak WhatsApp: ${error.message}` });
      return;
    }
    setRows((data ?? []) as FooterContactRow[]);
  }, [admin.village.id]);

  useEffect(() => {
    void loadSosmed();
    void loadKontak();
  }, [loadSosmed, loadKontak]);

  async function handleSaveSosmed(e: FormEvent) {
    e.preventDefault();
    if (!sosmed) return;
    setSavingSosmed(true);
    setMsg(null);
    try {
      const { error } = await getSupabase()
        .from("villages")
        .update({
          whatsapp: sosmed.whatsapp.replace(/[^0-9]/g, "") || null,
          email: sosmed.email.trim() || null,
          instagram_url: sosmed.instagram_url.trim() || null,
          tiktok_url: sosmed.tiktok_url.trim() || null,
          facebook_url: sosmed.facebook_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", admin.village.id);
      if (error) throw new Error(error.message);
      setMsg({ kind: "ok", text: "Kontak desa disimpan." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSavingSosmed(false);
    }
  }

  async function handleSubmitKontak(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const payload = {
        village_id: admin.village.id,
        name: form.name.trim(),
        jabatan: form.jabatan.trim(),
        contact_type: form.contact_type,
        value:
          form.contact_type === "wa"
            ? form.value.trim().replace(/[^0-9]/g, "")
            : form.value.trim(),
        display_order: Number(form.display_order) || 0,
      };
      const supabase = getSupabase();
      const { error } = form.id
        ? await supabase.from("footer_contacts").update(payload).eq("id", form.id)
        : await supabase.from("footer_contacts").insert(payload);
      if (error) throw new Error(error.message);
      setMsg({ kind: "ok", text: form.id ? "Kontak diperbarui." : "Kontak ditambahkan." });
      setForm(EMPTY_KONTAK);
      await loadKontak();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteKontak(row: FooterContactRow) {
    if (!window.confirm(`Hapus kontak "${row.name}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await getSupabase().from("footer_contacts").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      if (form.id === row.id) setForm(EMPTY_KONTAK);
      setMsg({ kind: "ok", text: "Kontak dihapus." });
      await loadKontak();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
          {admin.village.name}
        </p>
        <h1 className="mt-1 font-body text-2xl font-bold tracking-tight text-[#006572]">
          Kontak Footer
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Info kontak yang tampil di footer seluruh halaman: kontak WhatsApp
          perangkat desa, email, dan sosial media.
        </p>
      </header>

      {msg && (
        <p
          role="status"
          className={`rounded-md border px-3 py-2 font-body text-sm ${
            msg.kind === "ok"
              ? "border-primary-container bg-primary-container/40 text-on-primary-container"
              : "border-error-container bg-[#FFF4F3] text-on-error-container"
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* Email & sosmed */}
      {sosmed && (
        <form
          onSubmit={handleSaveSosmed}
          className="flex flex-col gap-5 rounded-lg border bg-card p-5"
        >
          <h2 className="font-body text-base font-bold tracking-tight text-[#006572]">
            Email &amp; Sosial Media
          </h2>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>WhatsApp utama desa</span>
            <input
              placeholder="6281234567890"
              value={sosmed.whatsapp}
              onChange={(e) => setSosmed({ ...sosmed, whatsapp: e.target.value })}
              className={inputCls}
            />
            <span className={hintCls}>
              Tanpa &quot;+&quot;/spasi. Dipakai SERAGAM di seluruh halaman /wisata:
              detail destinasi, paket wisata, dan guidebook.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Email desa</span>
            <input
              type="email"
              placeholder="desagerakmakmur@butonselatan.go.id"
              value={sosmed.email}
              onChange={(e) => setSosmed({ ...sosmed, email: e.target.value })}
              className={inputCls}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Instagram</span>
              <input
                type="url"
                placeholder="https://instagram.com/…"
                value={sosmed.instagram_url}
                onChange={(e) => setSosmed({ ...sosmed, instagram_url: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>TikTok</span>
              <input
                type="url"
                placeholder="https://tiktok.com/@…"
                value={sosmed.tiktok_url}
                onChange={(e) => setSosmed({ ...sosmed, tiktok_url: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Facebook</span>
              <input
                type="url"
                placeholder="https://facebook.com/…"
                value={sosmed.facebook_url}
                onChange={(e) => setSosmed({ ...sosmed, facebook_url: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>
          <span className={hintCls}>
            Kosongkan ketiganya untuk menyembunyikan kolom &quot;Ikuti Kami&quot; di footer.
          </span>

          <button
            type="submit"
            disabled={savingSosmed}
            className="self-start rounded-md bg-[#006572] px-6 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
          >
            {savingSosmed ? "Menyimpan…" : "Simpan Email & Sosmed"}
          </button>
        </form>
      )}

      {/* Kontak WhatsApp perangkat desa */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="font-body text-base font-bold tracking-tight text-[#006572]">
              Kontak Perangkat Desa (WhatsApp / Email)
            </h2>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-surface-container-low text-left">
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nama / Jabatan
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Kontak
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center font-body text-sm text-muted-foreground">
                    Belum ada kontak. Tambahkan minimal satu (mis. Kepala Desa).
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-body text-sm font-semibold text-foreground">{row.name}</p>
                    <p className="font-body text-xs text-muted-foreground">{row.jabatan}</p>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-foreground">
                    {row.contact_type === "email" ? row.value : `+${row.value}`}
                    <span className="ml-1.5 rounded-full bg-surface-container-low px-2 py-0.5 font-body text-[10px] font-semibold uppercase text-muted-foreground">
                      {row.contact_type === "email" ? "Email" : "WA"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: row.id,
                            name: row.name,
                            jabatan: row.jabatan,
                            contact_type: row.contact_type ?? "wa",
                            value: row.value,
                            display_order: String(row.display_order),
                          })
                        }
                        className="font-body text-xs font-semibold text-[#006572] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKontak(row)}
                        className="font-body text-xs font-semibold text-destructive hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Form tambah/edit kontak */}
        <form
          onSubmit={handleSubmitKontak}
          className="flex h-fit flex-col gap-4 rounded-lg border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-body text-sm font-bold tracking-tight text-[#006572]">
              {form.id ? "Edit Kontak" : "Tambah Kontak"}
            </h2>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(EMPTY_KONTAK)}
                className="font-body text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Batal
              </button>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Nama</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Jabatan</span>
            <input
              required
              placeholder="Kepala Desa"
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              className={inputCls}
            />
          </label>

          <fieldset className="flex flex-col gap-1.5">
            <span className={labelCls}>Jenis kontak</span>
            <div className="flex gap-4">
              {(
                [
                  { val: "wa", label: "WhatsApp" },
                  { val: "email", label: "Email" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.val}
                  className="flex items-center gap-2 font-body text-sm text-foreground"
                >
                  <input
                    type="radio"
                    name="contact_type"
                    checked={form.contact_type === opt.val}
                    onChange={() => setForm({ ...form, contact_type: opt.val })}
                    className="h-4 w-4 accent-[#006572]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>
              {form.contact_type === "wa" ? "Nomor WhatsApp" : "Alamat email"}
            </span>
            <input
              required
              type={form.contact_type === "email" ? "email" : "text"}
              placeholder={
                form.contact_type === "wa" ? "6281234567890" : "kades@contoh.desa.id"
              }
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className={inputCls}
            />
            {form.contact_type === "wa" && (
              <span className={hintCls}>Format internasional tanpa &quot;+&quot;/spasi.</span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Urutan tampil</span>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: e.target.value })}
              className={inputCls}
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[#006572] px-6 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
          >
            {busy ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Kontak"}
          </button>
        </form>
      </div>
    </div>
  );
}

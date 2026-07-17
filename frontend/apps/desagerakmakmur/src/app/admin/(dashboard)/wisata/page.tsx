"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { deleteUploadedFile, uploadFile } from "@/lib/admin";
import type { TourismSpotImageRow, TourismSpotWithImages } from "@/lib/db-types";
import { useAdmin } from "../admin-context";

interface SpotForm {
  id: string | null;
  name: string;
  tagline: string;
  description: string;
  tags: string; // dipisah koma
  address: string;
  latitude: string;
  longitude: string;
  maps_url: string;
  phone: string;
  whatsapp: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  cover_image_url: string;
  is_published: boolean;
}

const EMPTY_FORM: SpotForm = {
  id: null,
  name: "",
  tagline: "",
  description: "",
  tags: "",
  address: "",
  latitude: "",
  longitude: "",
  maps_url: "",
  phone: "",
  whatsapp: "",
  instagram_url: "",
  tiktok_url: "",
  facebook_url: "",
  cover_image_url: "",
  is_published: true,
};

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";

/**
 * CRUD Destinasi Wisata — daftar di kiri, form tambah/edit di kanan.
 * Foto (cover & galeri) di-upload ke ImageKit via /api/upload, lalu URL-nya
 * disimpan ke Supabase (tourism_spots / tourism_spot_images).
 */
export default function AdminWisataPage() {
  const admin = useAdmin();
  const [spots, setSpots] = useState<TourismSpotWithImages[]>([]);
  const [form, setForm] = useState<SpotForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const editing = spots.find((s) => s.id === form.id) ?? null;

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("tourism_spots")
      .select("*, tourism_spot_images(*)")
      .eq("village_id", admin.village.id)
      .order("created_at", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat data: ${error.message}` });
      return;
    }
    setSpots((data ?? []) as TourismSpotWithImages[]);
  }, [admin.village.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ── Guidebook wisata (PDF), tersimpan di villages.guidebook_url ──
  const [guidebook, setGuidebook] = useState<string | null>(null);

  useEffect(() => {
    void getSupabase()
      .from("villages")
      .select("guidebook_url")
      .eq("id", admin.village.id)
      .maybeSingle()
      .then(({ data }) =>
        setGuidebook((data as { guidebook_url: string | null } | null)?.guidebook_url ?? null),
      );
  }, [admin.village.id]);

  async function handleGuidebookUpload(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const url = await uploadFile(file, admin.accessToken);
      const { error } = await getSupabase()
        .from("villages")
        .update({ guidebook_url: url, updated_at: new Date().toISOString() })
        .eq("id", admin.village.id);
      if (error) throw new Error(error.message);
      if (guidebook && guidebook !== url) {
        void deleteUploadedFile(guidebook, admin.accessToken);
      }
      setGuidebook(url);
      setMsg({ kind: "ok", text: "Guidebook diperbarui, langsung dipakai halaman /wisata." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload gagal." });
    } finally {
      setBusy(false);
    }
  }

  function startEdit(spot: TourismSpotWithImages) {
    setForm({
      id: spot.id,
      name: spot.name,
      tagline: spot.tagline ?? "",
      description: spot.description ?? "",
      tags: (spot.tags ?? []).join(", "),
      address: spot.address ?? "",
      latitude: spot.latitude != null ? String(spot.latitude) : "",
      longitude: spot.longitude != null ? String(spot.longitude) : "",
      maps_url: spot.maps_url ?? "",
      phone: spot.phone ?? "",
      whatsapp: spot.whatsapp ?? "",
      instagram_url: spot.instagram_url ?? "",
      tiktok_url: spot.tiktok_url ?? "",
      facebook_url: spot.facebook_url ?? "",
      cover_image_url: spot.cover_image_url ?? "",
      is_published: spot.is_published,
    });
    setMsg(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const payload = {
        village_id: admin.village.id,
        name: form.name.trim(),
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        address: form.address.trim() || null,
        latitude: form.latitude.trim() ? Number(form.latitude) : null,
        longitude: form.longitude.trim() ? Number(form.longitude) : null,
        maps_url: form.maps_url.trim() || null,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.replace(/[^0-9]/g, "") || null,
        instagram_url: form.instagram_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        cover_image_url: form.cover_image_url || null,
        is_published: form.is_published,
      };
      const supabase = getSupabase();
      const { error } = form.id
        ? await supabase.from("tourism_spots").update(payload).eq("id", form.id)
        : await supabase.from("tourism_spots").insert(payload);
      if (error) throw new Error(error.message);

      if (form.id && editing?.cover_image_url && editing.cover_image_url !== (form.cover_image_url || null)) {
        void deleteUploadedFile(editing.cover_image_url, admin.accessToken);
      }
      setMsg({ kind: "ok", text: form.id ? "Perubahan disimpan." : "Destinasi ditambahkan." });
      if (!form.id) setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(spot: TourismSpotWithImages) {
    if (!window.confirm(`Hapus destinasi "${spot.name}" beserta fotonya?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = getSupabase();
      // Hapus foto galeri dulu (FK ke tourism_spots)
      const { error: imgError } = await supabase
        .from("tourism_spot_images")
        .delete()
        .eq("tourism_spot_id", spot.id);
      if (imgError) throw new Error(imgError.message);
      const { error } = await supabase.from("tourism_spots").delete().eq("id", spot.id);
      if (error) throw new Error(error.message);
      if (form.id === spot.id) setForm(EMPTY_FORM);
      void deleteUploadedFile(spot.cover_image_url, admin.accessToken);
      for (const img of spot.tourism_spot_images) {
        void deleteUploadedFile(img.image_url, admin.accessToken);
      }
      setMsg({ kind: "ok", text: "Destinasi dihapus." });
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

  async function handleGalleryUpload(files: FileList) {
    if (!form.id) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = getSupabase();
      const startOrder = editing?.tourism_spot_images.length ?? 0;
      for (const [i, file] of Array.from(files).entries()) {
        const url = await uploadFile(file, admin.accessToken);
        const { error } = await supabase.from("tourism_spot_images").insert({
          tourism_spot_id: form.id,
          image_url: url,
          display_order: startOrder + i,
        });
        if (error) throw new Error(error.message);
      }
      setMsg({ kind: "ok", text: `${files.length} foto ditambahkan ke galeri.` });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload gagal." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteImage(img: TourismSpotImageRow) {
    setBusy(true);
    try {
      const { error } = await getSupabase()
        .from("tourism_spot_images")
        .delete()
        .eq("id", img.id);
      if (error) throw new Error(error.message);
      void deleteUploadedFile(img.image_url, admin.accessToken);
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menghapus foto." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Guidebook wisata (PDF), tampil paling atas ── */}
      <section
        aria-label="Guidebook wisata"
        className="rounded-xl border border-[#D0D0D0] bg-white p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-body text-base font-bold text-[#2E2E2E]">
              Guidebook Wisata (PDF)
            </h2>
            <p className="mt-0.5 font-body text-xs text-[#5A5A5A]">
              Diunduh pengunjung dari section Guidebook di halaman /wisata.{" "}
              {guidebook ? (
                <a
                  href={guidebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#006572] underline"
                >
                  Lihat file saat ini
                </a>
              ) : (
                "Belum ada file; halaman memakai PDF contoh bawaan."
              )}
            </p>
          </div>
          <label className="cursor-pointer rounded-md border border-[#006572] px-4 py-2 font-body text-sm font-semibold text-[#006572] hover:bg-[#CFF1F4]">
            {guidebook ? "Ganti PDF" : "Upload PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleGuidebookUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </section>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Destinasi Wisata</h1>
          <p className="mt-1 font-body text-sm text-[#5A5A5A]">
            Konten halaman /wisata dan Wisata Unggulan di beranda.
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
          + Destinasi Baru
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

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Daftar */}
        <section className="overflow-hidden rounded-xl border border-[#D0D0D0] bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#D0D0D0] bg-[#F6F6F6] text-left">
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Nama
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Status
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                  Foto
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {spots.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center font-body text-sm text-[#5A5A5A]">
                    Belum ada destinasi. Tambahkan lewat form di samping.
                  </td>
                </tr>
              )}
              {spots.map((spot) => (
                <tr key={spot.id} className="border-b border-[#EEEEEE] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-body text-sm font-semibold text-[#2E2E2E]">{spot.name}</p>
                    {spot.address && (
                      <p className="font-body text-xs text-[#5A5A5A]">{spot.address}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-body text-xs font-semibold ${
                        spot.is_published
                          ? "bg-[#CFF1F4] text-[#00434B]"
                          : "bg-[#E2E2E2] text-[#5A5A5A]"
                      }`}
                    >
                      {spot.is_published ? "Tayang" : "Draf"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-[#5A5A5A]">
                    {(spot.cover_image_url ? 1 : 0) + spot.tourism_spot_images.length}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(spot)}
                      className="rounded-md border border-[#006572] px-3 py-1.5 font-body text-xs font-semibold text-[#006572] hover:bg-[#CFF1F4]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(spot)}
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
        <section
          ref={formRef}
          className="h-fit rounded-xl border border-[#D0D0D0] bg-white p-5"
        >
          <h2 className="font-body text-lg font-bold text-[#2E2E2E]">
            {form.id ? `Edit: ${editing?.name ?? ""}` : "Destinasi Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Nama destinasi *</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Tagline</span>
              <input
                placeholder="mis. Pasir putih & senja pesisir"
                value={form.tagline}
                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Deskripsi</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-md border border-[#D0D0D0] px-3 py-2 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Tag (pisahkan dengan koma)</span>
              <input
                placeholder="Pantai, Spot sunset, Area piknik"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Alamat / lokasi singkat</span>
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
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
              <span className="font-body text-xs text-[#5A5A5A]">
                Kosongkan untuk memakai koordinat / pencarian nama otomatis.
              </span>
            </label>

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

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Telepon (tampilan)</span>
                <input
                  placeholder="+62 812-3456-7890"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>WhatsApp (angka saja)</span>
                <input
                  placeholder="6281234567890"
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  className={inputCls}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Instagram (URL profil)</span>
              <input
                type="url"
                placeholder="https://instagram.com/namadestinasi"
                value={form.instagram_url}
                onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>TikTok (URL profil)</span>
              <input
                type="url"
                placeholder="https://tiktok.com/@namadestinasi"
                value={form.tiktok_url}
                onChange={(e) => setForm((f) => ({ ...f, tiktok_url: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Facebook (URL profil)</span>
              <input
                type="url"
                placeholder="https://facebook.com/namadestinasi"
                value={form.facebook_url}
                onChange={(e) => setForm((f) => ({ ...f, facebook_url: e.target.value }))}
                className={inputCls}
              />
            </label>

            {/* Cover */}
            <div className="flex flex-col gap-1.5">
              <span className={labelCls}>Foto cover</span>
              {form.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.cover_image_url}
                  alt="Cover destinasi"
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
                {busy ? "Menyimpan…" : form.id ? "Simpan Perubahan" : "Tambah Destinasi"}
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

          {/* Galeri — hanya saat edit */}
          {form.id && editing && (
            <div className="mt-6 border-t border-[#EEEEEE] pt-4">
              <span className={labelCls}>Galeri foto ({editing.tourism_spot_images.length})</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[...editing.tourism_spot_images]
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((img) => (
                    <div key={img.id} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.image_url}
                        alt={img.caption ?? "Foto galeri"}
                        className="aspect-square w-full rounded-md border border-[#D0D0D0] object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => void handleDeleteImage(img)}
                        disabled={busy}
                        aria-label="Hapus foto"
                        className="absolute right-1 top-1 rounded-md bg-black/60 px-1.5 py-0.5 font-body text-xs font-semibold text-white opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={busy}
                onChange={(e) => {
                  if (e.target.files?.length) void handleGalleryUpload(e.target.files);
                  e.target.value = "";
                }}
                className="mt-3 font-body text-sm text-[#5A5A5A] file:mr-3 file:rounded-md file:border file:border-[#006572] file:bg-white file:px-3 file:py-1.5 file:font-body file:text-xs file:font-semibold file:text-[#006572]"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

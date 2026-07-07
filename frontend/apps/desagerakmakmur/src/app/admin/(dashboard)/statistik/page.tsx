"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { PopulationDataRow } from "@/lib/db-types";
import { STATISTIK } from "@/app/profil/_data/profil";
import { useAdmin } from "../admin-context";

/** Angka mentah dari label tampilan, mis. "±2.500" → 2500, "12,4 km²" → 12.4 */
function parseNumeric(label: string): number {
  const cleaned = label.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Desa dalam Angka — HANYA angkanya yang bisa diubah. Kelompok dan label
 * mengikuti struktur yang sudah ada di database (di-seed lewat
 * docs/supabase-seed-profil.sql); tidak ada tambah/hapus/ubah label di sini.
 */
export default function AdminStatistikPage() {
  const admin = useAdmin();
  const [rows, setRows] = useState<PopulationDataRow[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("population_data")
      .select("*")
      .eq("village_id", admin.village.id)
      .order("display_order", { ascending: true });
    if (error) {
      setMsg({ kind: "err", text: `Gagal memuat statistik: ${error.message}` });
      return;
    }
    const list = (data ?? []) as PopulationDataRow[];
    setRows(list);
    setValues(
      Object.fromEntries(list.map((r) => [r.id, r.value_label ?? String(r.value)])),
    );
    setLoaded(true);
  }, [admin.village.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const groups = [...new Set(rows.map((r) => r.category))];
  const dirtyRows = rows.filter(
    (r) => (values[r.id] ?? "") !== (r.value_label ?? String(r.value)),
  );

  async function handleSaveAll() {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = getSupabase();
      for (const row of dirtyRows) {
        const label = (values[row.id] ?? "").trim();
        if (!label) throw new Error(`Angka "${row.sub_category ?? row.category}" tidak boleh kosong.`);
        const { error } = await supabase
          .from("population_data")
          .update({
            value_label: label,
            value: parseNumeric(label),
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        if (error) throw new Error(error.message);
      }
      setMsg({ kind: "ok", text: `${dirtyRows.length} angka diperbarui.` });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  /** Isi awal dari template seed app bila tabel masih kosong. */
  async function handleInit() {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = getSupabase();
      const year = new Date().getFullYear();
      let order = 0;
      for (const group of STATISTIK) {
        order = Math.ceil(order / 10) * 10; // beri jarak antar kelompok
        for (const item of group.items) {
          const { error } = await supabase.from("population_data").insert({
            village_id: admin.village.id,
            year,
            category: group.judul,
            sub_category: item.label,
            value: parseNumeric(item.value),
            value_label: item.value,
            display_order: order,
          });
          if (error) throw new Error(error.message);
          order += 1;
        }
      }
      setMsg({ kind: "ok", text: "Statistik awal dibuat — silakan ubah angkanya." });
      await refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal membuat data awal." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Desa dalam Angka</h1>
        <p className="mt-1 font-body text-sm text-[#5A5A5A]">
          Ubah angkanya saja — kelompok dan label mengikuti struktur yang sudah ada.
        </p>
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

      {loaded && rows.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-[#D0D0D0] bg-white p-5">
          <p className="font-body text-sm text-[#5A5A5A]">
            Belum ada data statistik untuk desa ini. Buat entri awal sesuai
            struktur yang tampil di situs (atau jalankan{" "}
            <code className="rounded bg-[#F6F6F6] px-1">docs/supabase-seed-profil.sql</code>{" "}
            di Supabase SQL Editor).
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleInit()}
            className="rounded-md bg-[#006572] px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
          >
            {busy ? "Membuat…" : "Buat Entri Statistik Awal"}
          </button>
        </div>
      ) : (
        <>
          {groups.map((group) => (
            <section
              key={group}
              className="overflow-hidden rounded-xl border border-[#D0D0D0] bg-white"
            >
              <p className="border-b border-[#D0D0D0] bg-[#F6F6F6] px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wide text-[#5A5A5A]">
                {group}
              </p>
              <div className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
                {rows
                  .filter((r) => r.category === group)
                  .map((row) => {
                    const dirty =
                      (values[row.id] ?? "") !== (row.value_label ?? String(row.value));
                    return (
                      <label key={row.id} className="flex flex-col gap-1">
                        <span className="font-body text-sm font-semibold text-[#2E2E2E]">
                          {row.sub_category ?? row.category}
                        </span>
                        <input
                          value={values[row.id] ?? ""}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [row.id]: e.target.value }))
                          }
                          className={`h-10 w-full rounded-md border px-3 font-body text-sm text-[#2E2E2E] outline-none focus:ring-2 focus:ring-[#006572]/20 ${
                            dirty
                              ? "border-[#006572] bg-[#EFFBFC]"
                              : "border-[#D0D0D0] focus:border-[#006572]"
                          }`}
                        />
                      </label>
                    );
                  })}
              </div>
            </section>
          ))}

          {rows.length > 0 && (
            <div className="sticky bottom-4 flex items-center gap-3">
              <button
                type="button"
                disabled={busy || dirtyRows.length === 0}
                onClick={() => void handleSaveAll()}
                className="rounded-md bg-[#006572] px-6 py-2.5 font-body text-sm font-semibold text-white shadow-md hover:bg-[#026F7D] disabled:opacity-50"
              >
                {busy
                  ? "Menyimpan…"
                  : dirtyRows.length > 0
                    ? `Simpan ${dirtyRows.length} Perubahan`
                    : "Tidak Ada Perubahan"}
              </button>
              {dirtyRows.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setValues(
                      Object.fromEntries(
                        rows.map((r) => [r.id, r.value_label ?? String(r.value)]),
                      ),
                    )
                  }
                  className="rounded-md border border-[#D0D0D0] bg-white px-4 py-2.5 font-body text-sm font-semibold text-[#5A5A5A] hover:bg-[#F6F6F6]"
                >
                  Batalkan
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAdmin } from "../admin-context";

const inputCls =
  "h-10 w-full rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20";
const labelCls = "font-body text-sm font-semibold text-[#2E2E2E]";

/**
 * Akun Admin — ganti username sendiri. Setelah diset, login bisa memakai
 * username ini (selain email). Butuh migrasi
 * docs/supabase-migration-akun-wisata.sql (kolom username + policy update
 * profil sendiri + RPC email_untuk_username).
 */
export default function AdminAkunPage() {
  const admin = useAdmin();
  const [username, setUsername] = useState(admin.profile.username ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const bersih = username.trim().toLowerCase();
      if (!/^[a-z0-9._-]{3,32}$/.test(bersih)) {
        throw new Error(
          "Username 3-32 karakter: huruf kecil, angka, titik, garis bawah, atau strip.",
        );
      }
      const { error } = await getSupabase()
        .from("admin_profiles")
        .update({ username: bersih })
        .eq("id", admin.profile.id);
      if (error) {
        if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
          throw new Error("Username sudah dipakai admin lain. Pilih yang lain.");
        }
        throw new Error(error.message);
      }
      setUsername(bersih);
      setMsg({
        kind: "ok",
        text: `Username disimpan. Mulai sekarang Anda bisa login dengan "${bersih}".`,
      });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <header>
        <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Akun Admin</h1>
        <p className="mt-1 font-body text-sm text-[#5A5A5A]">
          Atur username untuk login. Email tetap bisa dipakai kapan saja.
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

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-[#D0D0D0] bg-white p-5"
      >
        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Email (tidak bisa diubah)</span>
          <input value={admin.email ?? "-"} disabled className={`${inputCls} bg-[#F6F6F6]`} />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Username</span>
          <input
            required
            placeholder="mis. admin.desa"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
          />
          <span className="font-body text-xs text-[#5A5A5A]">
            3-32 karakter: huruf kecil, angka, titik, garis bawah, strip. Dipakai
            untuk login menggantikan email.
          </span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="self-start rounded-md bg-[#006572] px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#026F7D] disabled:opacity-60"
        >
          {busy ? "Menyimpan…" : "Simpan Username"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { loadAdminSession, signOutAdmin } from "@/lib/admin";
import { SITE_NAME } from "@/lib/constants";

/**
 * Halaman login admin — Supabase Auth (email + password).
 * Setelah kredensial valid, dicek juga bahwa akun terdaftar di
 * `admin_profiles` untuk desa ini; kalau bukan, sesi langsung ditutup.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: authError } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError("Email atau password salah.");
        return;
      }

      const session = await loadAdminSession();
      if (!session) {
        await signOutAdmin();
        setError("Akun ini tidak terdaftar sebagai admin desa ini.");
        return;
      }

      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEEEEE] px-5">
      <div className="w-full max-w-[400px] rounded-xl border border-[#D0D0D0] bg-white p-8">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#006572]">
          Panel Admin
        </p>
        <h1 className="mt-2 font-body text-2xl font-bold text-[#2E2E2E]">{SITE_NAME}</h1>
        <p className="mt-1 font-body text-sm text-[#5A5A5A]">
          Masuk dengan akun admin Supabase Anda.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-semibold text-[#2E2E2E]">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-semibold text-[#2E2E2E]">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-md border border-[#D0D0D0] px-3 font-body text-sm text-[#2E2E2E] outline-none focus:border-[#006572] focus:ring-2 focus:ring-[#006572]/20"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-[#FFDAD6] bg-[#FFF4F3] px-3 py-2 font-body text-sm text-[#93000A]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 h-11 rounded-md bg-[#006572] font-body text-sm font-semibold text-white motion-safe:transition-colors hover:bg-[#026F7D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Memproses…" : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}

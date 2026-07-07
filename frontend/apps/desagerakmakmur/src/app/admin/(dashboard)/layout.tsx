"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { loadAdminSession, signOutAdmin, type AdminSession } from "@/lib/admin";
import { SITE_NAME } from "@/lib/constants";
import { AdminContext } from "./admin-context";

const NAV = [
  { label: "Ringkasan", href: "/admin" },
  { label: "Profil Desa", href: "/admin/profil" },
  { label: "Struktur Organisasi", href: "/admin/struktur" },
  { label: "Desa dalam Angka", href: "/admin/statistik" },
  { label: "Dokumen Desa", href: "/admin/dokumen" },
  { label: "Wisata", href: "/admin/wisata" },
  { label: "Paket Wisata", href: "/admin/paket" },
  { label: "Galeri", href: "/admin/galeri" },
  { label: "Berita", href: "/admin/berita" },
  { label: "UMKM", href: "/admin/umkm" },
];

/**
 * Layout dashboard admin — sidebar kiri + konten kanan (design system §18:
 * padat, dominan tosca, tanpa coral). Guard sesi: tanpa sesi admin yang sah
 * langsung diarahkan ke /admin/login.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadAdminSession().then((s) => {
      if (cancelled) return;
      if (!s) {
        router.replace("/admin/login");
        return;
      }
      setSession(s);
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSignOut() {
    await signOutAdmin();
    router.replace("/admin/login");
  }

  if (checking || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EEEEEE]">
        <p className="font-body text-sm text-[#5A5A5A]">Memeriksa sesi…</p>
      </main>
    );
  }

  return (
    <AdminContext.Provider value={session}>
      <div className="flex min-h-screen bg-[#EEEEEE]">
        {/* Sidebar */}
        <aside className="flex w-60 shrink-0 flex-col border-r border-[#D0D0D0] bg-white">
          <div className="border-b border-[#D0D0D0] px-5 py-5">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-[#006572]">
              Panel Admin
            </p>
            <p className="mt-1 font-body text-base font-bold text-[#2E2E2E]">{SITE_NAME}</p>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 font-body text-sm font-semibold no-underline motion-safe:transition-colors ${
                    active
                      ? "bg-[#006572] text-white"
                      : "text-[#2E2E2E] hover:bg-[#CFF1F4] hover:text-[#00434B]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#D0D0D0] p-3">
            <p className="truncate px-3 pb-2 font-body text-xs text-[#5A5A5A]">
              {session.profile.full_name ?? session.email ?? "Admin"}
            </p>
            <Link
              href="/"
              className="block rounded-md px-3 py-2 font-body text-sm font-semibold text-[#2E2E2E] no-underline hover:bg-[#F6F6F6]"
            >
              ← Lihat situs
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-md px-3 py-2 text-left font-body text-sm font-semibold text-[#93000A] hover:bg-[#FFF4F3]"
            >
              Keluar
            </button>
          </div>
        </aside>

        {/* Konten */}
        <main className="min-w-0 flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </AdminContext.Provider>
  );
}

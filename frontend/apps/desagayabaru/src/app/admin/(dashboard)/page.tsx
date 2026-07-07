"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { useAdmin } from "./admin-context";

interface Stats {
  spotTotal: number;
  spotPublished: number;
  paketTotal: number;
  paketPublished: number;
}

/** Ringkasan — jumlah konten + pintasan ke tiap modul CRUD. */
export default function AdminOverviewPage() {
  const admin = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    Promise.all([
      supabase.from("tourism_spots").select("id, is_published").eq("village_id", admin.village.id),
      supabase
        .from("tourism_packages")
        .select("id, is_published")
        .eq("village_id", admin.village.id),
    ]).then(([spots, pakets]) => {
      if (spots.error || pakets.error) {
        setError(spots.error?.message ?? pakets.error?.message ?? "Gagal memuat data");
        return;
      }
      const spotRows = (spots.data ?? []) as { is_published: boolean }[];
      const paketRows = (pakets.data ?? []) as { is_published: boolean }[];
      setStats({
        spotTotal: spotRows.length,
        spotPublished: spotRows.filter((r) => r.is_published).length,
        paketTotal: paketRows.length,
        paketPublished: paketRows.filter((r) => r.is_published).length,
      });
    });
  }, [admin.village.id]);

  const cards = [
    {
      label: "Destinasi Wisata",
      href: "/admin/wisata",
      total: stats?.spotTotal,
      published: stats?.spotPublished,
    },
    {
      label: "Paket Wisata",
      href: "/admin/paket",
      total: stats?.paketTotal,
      published: stats?.paketPublished,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-body text-2xl font-bold text-[#2E2E2E]">Ringkasan</h1>
        <p className="mt-1 font-body text-sm text-[#5A5A5A]">
          Kelola konten {admin.village.name}. Perubahan tampil di situs maksimal 5 menit
          setelah disimpan.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-[#FFDAD6] bg-[#FFF4F3] px-3 py-2 font-body text-sm text-[#93000A]">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-[#D0D0D0] bg-white p-5 no-underline motion-safe:transition-colors hover:border-[#006572]"
          >
            <p className="font-body text-sm font-semibold text-[#5A5A5A]">{card.label}</p>
            <p className="mt-2 font-body text-3xl font-bold text-[#006572]">
              {card.total ?? "…"}
            </p>
            <p className="mt-1 font-body text-xs text-[#5A5A5A]">
              {card.published ?? "…"} tayang di situs
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

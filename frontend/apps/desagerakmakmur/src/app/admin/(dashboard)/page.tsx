"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { useAdmin } from "./admin-context";

interface CardStat {
  total: number;
  published: number | null; // null = tidak punya status tayang (mis. galeri)
}

interface Stats {
  wisata: CardStat;
  paket: CardStat;
  galeri: CardStat;
  berita: CardStat;
  umkm: CardStat;
}

/** Ringkasan — jumlah konten + pintasan ke tiap modul CRUD. */
export default function AdminOverviewPage() {
  const admin = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    const vid = admin.village.id;
    Promise.all([
      supabase.from("tourism_spots").select("id, is_published").eq("village_id", vid),
      supabase.from("tourism_packages").select("id, is_published").eq("village_id", vid),
      supabase.from("gallery_images").select("id").eq("village_id", vid),
      supabase.from("articles").select("id, is_published, category").eq("village_id", vid),
    ]).then(([spots, pakets, galeri, artikel]) => {
      const firstError =
        spots.error ?? pakets.error ?? galeri.error ?? artikel.error;
      if (firstError) setError(firstError.message);

      const pub = (rows: unknown) =>
        ((rows ?? []) as { is_published: boolean }[]).filter((r) => r.is_published).length;
      const artikelRows = (artikel.data ?? []) as {
        is_published: boolean;
        category: string;
      }[];
      const beritaRows = artikelRows.filter((r) => r.category === "berita");
      const umkmRows = artikelRows.filter((r) => r.category === "umkm");

      setStats({
        wisata: { total: spots.data?.length ?? 0, published: pub(spots.data) },
        paket: { total: pakets.data?.length ?? 0, published: pub(pakets.data) },
        galeri: { total: galeri.data?.length ?? 0, published: null },
        berita: {
          total: beritaRows.length,
          published: beritaRows.filter((r) => r.is_published).length,
        },
        umkm: {
          total: umkmRows.length,
          published: umkmRows.filter((r) => r.is_published).length,
        },
      });
    });
  }, [admin.village.id]);

  const cards: { label: string; href: string; stat?: CardStat }[] = [
    { label: "Destinasi Wisata", href: "/admin/wisata", stat: stats?.wisata },
    { label: "Paket Wisata", href: "/admin/paket", stat: stats?.paket },
    { label: "Galeri Foto", href: "/admin/galeri", stat: stats?.galeri },
    { label: "Berita", href: "/admin/berita", stat: stats?.berita },
    { label: "UMKM", href: "/admin/umkm", stat: stats?.umkm },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:max-w-4xl">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-[#D0D0D0] bg-white p-5 no-underline motion-safe:transition-colors hover:border-[#006572]"
          >
            <p className="font-body text-sm font-semibold text-[#5A5A5A]">{card.label}</p>
            <p className="mt-2 font-body text-3xl font-bold text-[#006572]">
              {card.stat?.total ?? "…"}
            </p>
            <p className="mt-1 font-body text-xs text-[#5A5A5A]">
              {card.stat == null
                ? "…"
                : card.stat.published == null
                  ? "foto tersimpan"
                  : `${card.stat.published} tayang di situs`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

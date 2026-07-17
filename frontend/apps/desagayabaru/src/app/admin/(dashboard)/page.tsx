"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  ExternalLinkIcon,
  FileTextIcon,
  ImagesIcon,
  LandmarkIcon,
  MapPinIcon,
  NetworkIcon,
  NewspaperIcon,
  TicketIcon,
  type LucideIcon,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { ArticleCategory, VillageRow } from "@/lib/db-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
}

interface RecentArticle {
  id: string;
  title: string;
  category: ArticleCategory;
  is_published: boolean;
  updated_at: string;
}

interface GalleryThumb {
  id: string;
  image_url: string;
  caption: string | null;
}

interface Lembaga {
  profilPct: number;
  struktur: number;
  statistik: number;
  dokumen: number;
}

/** Persentase kelengkapan profil desa, field konten yang sudah terisi. */
function hitungProfilPct(v: Partial<VillageRow> | null): number {
  if (!v) return 0;
  const fields = [
    v.short_description,
    v.about,
    v.history,
    v.vision,
    (v.missions?.length ?? 0) > 0,
    v.logo_url,
    v.cover_image_url,
    v.map_embed_url,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

const STAT_CARDS: { key: keyof Stats; label: string; href: string; icon: LucideIcon }[] = [
  { key: "wisata", label: "Destinasi Wisata", href: "/admin/wisata", icon: MapPinIcon },
  { key: "paket", label: "Paket Wisata", href: "/admin/paket", icon: TicketIcon },
  { key: "galeri", label: "Galeri Foto", href: "/admin/galeri", icon: ImagesIcon },
  { key: "berita", label: "Berita", href: "/admin/berita", icon: NewspaperIcon },
];

const QUICK_ACTIONS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Tulis Berita", href: "/admin/berita", icon: NewspaperIcon },
  { label: "Unggah Foto Galeri", href: "/admin/galeri", icon: ImagesIcon },
  { label: "Tambah Paket Wisata", href: "/admin/paket", icon: TicketIcon },
];

/** Ringkasan, statistik konten, moderasi galeri, artikel terbaru, dan pintasan. */
export default function AdminOverviewPage() {
  const admin = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [lembaga, setLembaga] = useState<Lembaga | null>(null);
  const [articles, setArticles] = useState<RecentArticle[] | null>(null);
  const [thumbs, setThumbs] = useState<GalleryThumb[]>([]);
  const [pendingGaleri, setPendingGaleri] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    const vid = admin.village.id;
    Promise.all([
      supabase.from("tourism_spots").select("id, is_published").eq("village_id", vid),
      supabase.from("tourism_packages").select("id, is_published").eq("village_id", vid),
      supabase
        .from("gallery_images")
        .select("id, image_url, caption, status, created_at")
        .eq("village_id", vid)
        .order("created_at", { ascending: false }),
      supabase
        .from("articles")
        .select("id, title, category, is_published, updated_at")
        .eq("village_id", vid)
        .order("updated_at", { ascending: false }),
      supabase
        .from("villages")
        .select(
          "short_description, about, history, vision, missions, logo_url, cover_image_url, map_embed_url",
        )
        .eq("id", vid)
        .maybeSingle(),
      supabase.from("organization_structure").select("id").eq("village_id", vid),
      supabase.from("population_data").select("id").eq("village_id", vid),
      supabase.from("documents").select("id").eq("village_id", vid),
    ]).then(([spots, pakets, galeri, artikel, desa, struktur, statistik, dokumen]) => {
      const firstError =
        spots.error ?? pakets.error ?? galeri.error ?? artikel.error;
      if (firstError) setError(firstError.message);

      setLembaga({
        profilPct: hitungProfilPct(desa.data as Partial<VillageRow> | null),
        struktur: struktur.data?.length ?? 0,
        statistik: statistik.data?.length ?? 0,
        dokumen: dokumen.data?.length ?? 0,
      });

      const pub = (rows: unknown) =>
        ((rows ?? []) as { is_published: boolean }[]).filter((r) => r.is_published).length;

      const galeriRows = (galeri.data ?? []) as {
        id: string;
        image_url: string;
        caption: string | null;
        status?: "pending" | "approved";
      }[];
      const approved = galeriRows.filter((r) => (r.status ?? "approved") === "approved");
      setPendingGaleri(galeriRows.length - approved.length);
      setThumbs(approved.slice(0, 6));

      const artikelRows = (artikel.data ?? []) as RecentArticle[];
      const beritaRows = artikelRows.filter((r) => r.category === "berita");
      setArticles(artikelRows.slice(0, 5));

      setStats({
        wisata: { total: spots.data?.length ?? 0, published: pub(spots.data) },
        paket: { total: pakets.data?.length ?? 0, published: pub(pakets.data) },
        galeri: { total: approved.length, published: null },
        berita: {
          total: beritaRows.length,
          published: beritaRows.filter((r) => r.is_published).length,
        },
      });
    });
  }, [admin.village.id]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-[#31577F]">
            {admin.village.name}
          </p>
          <h1 className="mt-1 font-body text-3xl font-bold leading-tight tracking-tight text-[#31577F]">
            Ringkasan
          </h1>
          <p className="mt-1 font-body text-sm text-[#31577F]/60">
            Kelola konten desa, perubahan tampil di situs maksimal 5 menit setelah disimpan.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/" target="_blank">
            <ExternalLinkIcon />
            Lihat Situs
          </Link>
        </Button>
      </header>

      {error && (
        <p className="rounded-md border border-error-container bg-[#FFF4F3] px-3 py-2 font-body text-sm text-on-error-container">
          {error}
        </p>
      )}

      {/* Banner moderasi, hanya tampil saat ada kiriman warga menunggu */}
      {pendingGaleri > 0 && (
        <Card className="border-[#31577F]/30 bg-accent">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ImagesIcon className="size-5 shrink-0 text-[#31577F]" />
              <p className="font-body text-sm font-semibold text-accent-foreground">
                {pendingGaleri} kiriman foto warga menunggu moderasi
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/galeri">
                Tinjau Sekarang
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistik konten */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STAT_CARDS.map(({ key, label, href, icon: Icon }) => {
          const stat = stats?.[key];
          return (
            <Link key={href} href={href} className="group no-underline">
              <Card className="gap-2 py-5 motion-safe:transition-colors group-hover:border-[#31577F]/50">
                <CardHeader className="flex-row items-center justify-between px-5">
                  <CardDescription className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </CardDescription>
                  <Icon className="size-4 text-[#31577F]/50" />
                </CardHeader>
                <CardContent className="px-5">
                  <p className="font-body text-3xl font-bold tracking-tight text-[#31577F] tabular-nums">
                    {stat?.total ?? "…"}
                  </p>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    {stat == null
                      ? "memuat…"
                      : stat.published == null
                        ? "foto tayang di situs"
                        : `${stat.published} tayang di situs`}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {/* Artikel terbaru */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-body text-lg font-bold tracking-tight text-[#31577F]">
              Artikel Terbaru
            </CardTitle>
            <CardDescription className="font-body text-[#31577F]/60">
              Berita yang terakhir diperbarui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Judul
                  </TableHead>
                  <TableHead className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Kategori
                  </TableHead>
                  <TableHead className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Diperbarui
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles == null ? (
                  <TableRow>
                    <TableCell colSpan={4} className="font-body text-muted-foreground">
                      Memuat…
                    </TableCell>
                  </TableRow>
                ) : articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="font-body text-muted-foreground">
                      Belum ada artikel. Mulai tulis berita pertama desa.
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="max-w-64 truncate py-3 font-body font-semibold">
                        {a.title}
                      </TableCell>
                      <TableCell className="font-body text-sm capitalize text-muted-foreground">
                        {a.category}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 font-body text-sm text-foreground">
                          <span
                            className={`size-1.5 rounded-full ${
                              a.is_published ? "bg-[#31577F]" : "bg-outline"
                            }`}
                          />
                          {a.is_published ? "Tayang" : "Draf"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-body text-sm text-muted-foreground">
                        {formatDate(a.updated_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" size="sm" className="text-[#31577F]">
              <Link href="/admin/berita">
                Kelola semua artikel
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Ringkasan kelembagaan */}
          <Card>
            <CardHeader>
              <CardTitle className="font-body text-lg font-bold tracking-tight text-[#31577F]">
                Kelembagaan
              </CardTitle>
              <CardDescription className="font-body text-[#31577F]/60">
                Kelengkapan data profil desa
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3">
              <div className="flex flex-col">
                <Link
                  href="/admin/profil"
                  className="rounded-md px-3 py-2.5 no-underline motion-safe:transition-colors hover:bg-surface-container-low"
                >
                  <span className="flex items-center gap-3">
                    <LandmarkIcon className="size-4 text-[#31577F]" />
                    <span className="flex-1 font-body text-sm font-semibold text-foreground">
                      Profil Desa
                    </span>
                    <span className="font-body text-sm text-muted-foreground tabular-nums">
                      {lembaga == null ? "…" : `${lembaga.profilPct}% lengkap`}
                    </span>
                  </span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-surface-container-high">
                    <span
                      className="block h-full rounded-full bg-[#31577F] motion-safe:transition-[width] motion-safe:duration-300"
                      style={{ width: `${lembaga?.profilPct ?? 0}%` }}
                    />
                  </span>
                </Link>
                {(
                  [
                    {
                      label: "Struktur Organisasi",
                      href: "/admin/struktur",
                      icon: NetworkIcon,
                      nilai: lembaga == null ? null : `${lembaga.struktur} pengurus`,
                    },
                    {
                      label: "Desa dalam Angka",
                      href: "/admin/statistik",
                      icon: BarChart3Icon,
                      nilai: lembaga == null ? null : `${lembaga.statistik} entri data`,
                    },
                    {
                      label: "Dokumen Desa",
                      href: "/admin/dokumen",
                      icon: FileTextIcon,
                      nilai: lembaga == null ? null : `${lembaga.dokumen} dokumen`,
                    },
                  ] as const
                ).map(({ label, href, icon: Icon, nilai }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 no-underline motion-safe:transition-colors hover:bg-surface-container-low"
                  >
                    <Icon className="size-4 text-[#31577F]" />
                    <span className="flex-1 font-body text-sm font-semibold text-foreground">
                      {label}
                    </span>
                    <span className="font-body text-sm text-muted-foreground tabular-nums">
                      {nilai ?? "…"}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pintasan cepat */}
          <Card>
            <CardHeader>
              <CardTitle className="font-body text-lg font-bold tracking-tight text-[#31577F]">
                Pintasan Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              <div className="flex flex-col">
                {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group/aksi flex items-center gap-3 rounded-md px-3 py-2.5 font-body text-sm font-semibold text-foreground no-underline motion-safe:transition-colors hover:bg-surface-container-low"
                  >
                    <Icon className="size-4 text-[#31577F]" />
                    {label}
                    <ArrowRightIcon className="ml-auto size-4 text-muted-foreground opacity-0 motion-safe:transition-opacity group-hover/aksi:opacity-100" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Galeri terbaru */}
          <Card>
            <CardHeader>
              <CardTitle className="font-body text-lg font-bold tracking-tight text-[#31577F]">
                Galeri Terbaru
              </CardTitle>
              <CardDescription className="font-body text-[#31577F]/60">
                6 foto terakhir yang tayang
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thumbs.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground">Belum ada foto.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {thumbs.map((t) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={t.id}
                      src={t.image_url}
                      alt={t.caption ?? "Foto galeri"}
                      className="aspect-square w-full rounded-md border object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" size="sm" className="text-[#31577F]">
                <Link href="/admin/galeri">
                  Kelola galeri
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

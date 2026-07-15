/**
 * Fetch konten dari Supabase + mapping ke bentuk yang dipakai komponen UI.
 *
 * Selalu punya fallback: bila tabel masih kosong atau Supabase tidak
 * terjangkau, halaman memakai data placeholder statis sehingga situs tidak
 * pernah tampil kosong/crash. Setelah konten asli diisi lewat dashboard
 * Supabase, data DB otomatis menggantikan placeholder (ISR, lihat
 * `export const revalidate` di tiap page).
 */
import { getGalleryImages, getTourismPackages, getTourismSpots } from "./desa";
import { CONTACT_INFO } from "./constants";
import type { TourismPackageRow, TourismSpotWithImages } from "./db-types";
import { WISATA as WISATA_PLACEHOLDER, type Wisata } from "@/app/wisata/_data/wisata";
import type { Paket } from "@/components/sections/JelajahDesa";

/** Item daftar interaktif di section Wisata Unggulan (beranda). */
export interface WisataItem {
  name: string;
  href: string;
  img: string;
  desc: string;
}

const PLACEHOLDER_IMGS = [
  "/images/hero-bg.jpg",
  "/images/wisata-pantai.jpg",
  "/images/wisata-diving.jpg",
];

function spotImages(spot: TourismSpotWithImages): string[] {
  const imgs = [
    spot.cover_image_url,
    ...[...spot.tourism_spot_images]
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => img.image_url),
  ].filter((url): url is string => Boolean(url));
  return imgs.length > 0 ? imgs : PLACEHOLDER_IMGS;
}

function toWisata(spot: TourismSpotWithImages): Wisata {
  // Prioritas link maps: maps_url dari admin → koordinat → pencarian nama.
  const maps =
    spot.maps_url ??
    (spot.latitude != null && spot.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${spot.name} Buton Selatan`,
        )}`);

  return {
    nama: spot.name,
    tagline: spot.tagline ?? spot.address ?? "",
    deskripsi: spot.description ?? "",
    tags: spot.tags ?? [],
    telepon: spot.phone ?? CONTACT_INFO.phone,
    wa: spot.whatsapp ?? "",
    instagram: spot.instagram_url ?? undefined,
    tiktok: spot.tiktok_url ?? undefined,
    facebook: spot.facebook_url ?? undefined,
    maps,
    latitude: spot.latitude,
    longitude: spot.longitude,
    imgs: spotImages(spot),
    alt: spot.name,
  };
}

/** Daftar wisata untuk halaman /wisata. Fallback: placeholder statis. */
export async function fetchWisata(): Promise<Wisata[]> {
  try {
    const spots = await getTourismSpots();
    if (spots.length === 0) return WISATA_PLACEHOLDER;
    return spots.map(toWisata);
  } catch (err) {
    console.warn("[konten] Gagal memuat tourism_spots, pakai placeholder:", err);
    return WISATA_PLACEHOLDER;
  }
}

/** Item Wisata Unggulan (beranda). null → komponen memakai default statisnya. */
export async function fetchWisataUnggulan(): Promise<WisataItem[] | null> {
  try {
    const spots = await getTourismSpots();
    if (spots.length === 0) return null;
    return spots.map((spot) => ({
      name: spot.name,
      href: "/wisata",
      img: spotImages(spot)[0],
      desc: spot.description ?? "",
    }));
  } catch (err) {
    console.warn("[konten] Gagal memuat wisata unggulan, pakai placeholder:", err);
    return null;
  }
}

/** Foto galeri (section Lensa di beranda). */
export interface GaleriFoto {
  src: string;
  alt: string;
}

/** Foto galeri desa. null → komponen memakai foto default statisnya. */
export async function fetchGaleri(): Promise<GaleriFoto[] | null> {
  try {
    const rows = await getGalleryImages();
    if (rows.length === 0) return null;
    return rows.map((row) => ({
      src: row.image_url,
      alt: row.caption ?? "Foto galeri desa",
    }));
  } catch (err) {
    console.warn("[konten] Gagal memuat galeri, pakai placeholder:", err);
    return null;
  }
}

/** Paket wisata (Jelajah Desa). null → komponen memakai default statisnya. */
export async function fetchPaket(): Promise<Paket[] | null> {
  try {
    const rows = await getTourismPackages();
    if (rows.length === 0) return null;
    // Kartu tengah di-highlight sesuai desain (kartu menonjol di tengah grid).
    const highlightIndex = rows.length >= 3 ? 1 : -1;
    return rows.map(
      (row: TourismPackageRow, i): Paket => ({
        nama: row.name,
        desc: row.description ?? "",
        harga: new Intl.NumberFormat("id-ID").format(row.price),
        benefits: row.includes ?? row.facilities ?? [],
        highlight: i === highlightIndex,
      }),
    );
  } catch (err) {
    console.warn("[konten] Gagal memuat tourism_packages, pakai placeholder:", err);
    return null;
  }
}

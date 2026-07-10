import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { VILLAGE_SLUG } from "@/lib/desa";
import type { VillageRow } from "@/lib/db-types";

/**
 * POST /api/galeri/kirim — kiriman foto galeri dari WARGA (tanpa login).
 *
 * Berbeda dengan /api/upload (khusus admin): endpoint ini publik, jadi
 * dijaga rate limit per IP + honeypot, hanya menerima gambar ≤ 5 MB, dan
 * row yang dibuat WAJIB berstatus 'pending' (dipaksa juga oleh RLS policy
 * "public submit pending gallery_images" — lihat
 * docs/supabase-migration-galeri-kiriman.sql). Foto baru tampil di galeri
 * setelah admin memverifikasinya di /admin/galeri.
 *
 * Body: multipart/form-data — file (wajib), nama & keterangan (opsional),
 * website (honeypot, wajib kosong).
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB — lebih ketat dari admin
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_NAMA = 80;
const MAX_KETERANGAN = 200;

/** Rate limit per IP: maksimal N kiriman per jendela waktu. */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 menit
// In-memory — cukup untuk satu instance Next; reset saat server restart.
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT) {
    submissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ikPublicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const ikPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const ikUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!supabaseUrl || !supabaseKey || !ikPublicKey || !ikPrivateKey || !ikUrlEndpoint) {
    return NextResponse.json(
      { error: "Kirim foto belum dikonfigurasi (env Supabase/ImageKit belum diisi)" },
      { status: 503 },
    );
  }

  // --- Rate limit per IP ---
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak kiriman. Coba lagi dalam beberapa menit." },
      { status: 429 },
    );
  }

  // --- Validasi form ---
  const formData = await request.formData();

  // Honeypot: field tersembunyi yang manusia tidak isi; bot mengisinya.
  if (typeof formData.get("website") === "string" && formData.get("website") !== "") {
    return NextResponse.json({ error: "Kiriman ditolak" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Field "file" wajib diisi' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ukuran foto maksimal 5 MB" }, { status: 413 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Hanya menerima gambar (JPG, PNG, WebP, AVIF)" },
      { status: 415 },
    );
  }

  const nama = String(formData.get("nama") ?? "").trim().slice(0, MAX_NAMA);
  const keterangan = String(formData.get("keterangan") ?? "")
    .trim()
    .slice(0, MAX_KETERANGAN);

  // --- Cari desa (anon client — RLS berlaku) ---
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: villageData } = await supabase
    .from("villages")
    .select("id")
    .eq("slug", VILLAGE_SLUG)
    .maybeSingle();
  const village = villageData as Pick<VillageRow, "id"> | null;
  if (!village) {
    return NextResponse.json({ error: "Desa tidak ditemukan" }, { status: 500 });
  }

  // --- Upload ke ImageKit, folder kiriman terpisah dari upload admin ---
  const imagekit = new ImageKit({
    publicKey: ikPublicKey,
    privateKey: ikPrivateKey,
    urlEndpoint: ikUrlEndpoint,
  });
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await imagekit.upload({
    file: buffer,
    fileName: file.name,
    folder: `/villages/${VILLAGE_SLUG}/kiriman`,
  });

  // --- Simpan row pending; bila gagal, bersihkan file yang telanjur naik ---
  const { error: insertError } = await supabase.from("gallery_images").insert({
    village_id: village.id,
    image_url: uploaded.url,
    file_id: uploaded.fileId,
    caption: keterangan || null,
    submitted_by: nama || null,
    status: "pending",
    display_order: 0,
  });
  if (insertError) {
    await imagekit.deleteFile(uploaded.fileId).catch(() => {});
    return NextResponse.json(
      { error: `Gagal menyimpan kiriman: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

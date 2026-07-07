import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { VILLAGE_SLUG } from "@/lib/desa";
import type { AdminProfileRow, VillageRow } from "@/lib/db-types";

/**
 * POST /api/upload — upload file ke ImageKit (arsitektur final:
 * Supabase = data + auth, ImageKit = file fisik).
 *
 * Wajib login sebagai admin Supabase; header: `Authorization: Bearer <access_token>`.
 * Body: multipart/form-data dengan field "file".
 * Balasan: { url, fileId } — simpan `url` ke kolom konten (cover_image_url, dll.).
 *
 * Validasi hak akses dilakukan DI SINI (bukan RLS) karena ImageKit tidak
 * mengenal RLS Supabase: admin hanya boleh upload untuk desanya sendiri.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ikPublicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const ikPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const ikUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!supabaseUrl || !supabaseKey || !ikPublicKey || !ikPrivateKey || !ikUrlEndpoint) {
    return NextResponse.json(
      { error: "Upload belum dikonfigurasi (env Supabase/ImageKit belum diisi)" },
      { status: 503 },
    );
  }

  // --- Autentikasi: token admin Supabase ---
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Butuh header Authorization: Bearer <token>" }, { status: 401 });
  }
  const token = authHeader.slice("Bearer ".length).trim();

  // Client bertindak SEBAGAI admin yang login, jadi RLS berlaku di tiap query.
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Token tidak valid atau kedaluwarsa" }, { status: 401 });
  }

  // --- Otorisasi: harus admin, dan (kecuali super_admin) admin desa INI ---
  const { data: profileData } = await supabase
    .from("admin_profiles")
    .select("role, village_id")
    .eq("id", userData.user.id)
    .maybeSingle();
  const profile = profileData as Pick<AdminProfileRow, "role" | "village_id"> | null;
  if (!profile) {
    return NextResponse.json({ error: "Akun ini bukan admin" }, { status: 403 });
  }

  if (profile.role !== "super_admin") {
    const { data: villageData } = await supabase
      .from("villages")
      .select("slug")
      .eq("id", profile.village_id ?? "")
      .maybeSingle();
    const village = villageData as Pick<VillageRow, "slug"> | null;
    if (village?.slug !== VILLAGE_SLUG) {
      return NextResponse.json(
        { error: "Admin hanya boleh upload untuk desanya sendiri" },
        { status: 403 },
      );
    }
  }

  // --- Validasi file ---
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Field "file" wajib diisi' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 10 MB" }, { status: 413 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Tipe file tidak didukung: ${file.type}` }, { status: 415 });
  }

  // --- Upload ke ImageKit, folder terpisah per desa ---
  const imagekit = new ImageKit({
    publicKey: ikPublicKey,
    privateKey: ikPrivateKey,
    urlEndpoint: ikUrlEndpoint,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await imagekit.upload({
    file: buffer,
    fileName: file.name,
    folder: `/villages/${VILLAGE_SLUG}`,
  });

  return NextResponse.json({ url: result.url, fileId: result.fileId }, { status: 201 });
}

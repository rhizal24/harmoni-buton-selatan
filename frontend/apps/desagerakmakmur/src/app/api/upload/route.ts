import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { VILLAGE_SLUG } from "@/lib/desa";
import type { AdminProfileRow, VillageRow } from "@/lib/db-types";

/**
 * /api/upload - kelola file di ImageKit (arsitektur final:
 * Supabase = data + auth, ImageKit = file fisik).
 *
 * POST   : upload file (multipart, field "file") -> { url, fileId }
 * DELETE : hapus file berdasarkan URL-nya (body JSON { url }) -> { deleted }
 *
 * Keduanya wajib login admin Supabase (header Authorization: Bearer <token>).
 * Validasi hak akses dilakukan DI SINI (bukan RLS) karena ImageKit tidak
 * mengenal RLS Supabase: admin hanya boleh mengelola file desanya sendiri
 * (folder /villages/<slug>).
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

interface Env {
  supabaseUrl: string;
  supabaseKey: string;
  ikPublicKey: string;
  ikPrivateKey: string;
  ikUrlEndpoint: string;
}

function readEnv(): Env | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ikPublicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const ikPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const ikUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!supabaseUrl || !supabaseKey || !ikPublicKey || !ikPrivateKey || !ikUrlEndpoint) {
    return null;
  }
  return { supabaseUrl, supabaseKey, ikPublicKey, ikPrivateKey, ikUrlEndpoint };
}

/** Verifikasi token admin + hak atas desa ini. Balikan NextResponse = tolak. */
async function authorizeAdmin(
  request: NextRequest,
  env: Env,
): Promise<NextResponse | { supabase: SupabaseClient }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Butuh header Authorization: Bearer <token>" },
      { status: 401 },
    );
  }
  const token = authHeader.slice("Bearer ".length).trim();

  // Client bertindak SEBAGAI admin yang login, jadi RLS berlaku di tiap query.
  const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Token tidak valid atau kedaluwarsa" }, { status: 401 });
  }

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
        { error: "Admin hanya boleh mengelola file desanya sendiri" },
        { status: 403 },
      );
    }
  }

  return { supabase };
}

function createImageKit(env: Env): ImageKit {
  return new ImageKit({
    publicKey: env.ikPublicKey,
    privateKey: env.ikPrivateKey,
    urlEndpoint: env.ikUrlEndpoint,
  });
}

export async function POST(request: NextRequest) {
  const env = readEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Upload belum dikonfigurasi (env Supabase/ImageKit belum diisi)" },
      { status: 503 },
    );
  }

  const auth = await authorizeAdmin(request, env);
  if (auth instanceof NextResponse) return auth;

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

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await createImageKit(env).upload({
    file: buffer,
    fileName: file.name,
    folder: `/villages/${VILLAGE_SLUG}`,
  });

  return NextResponse.json({ url: result.url, fileId: result.fileId }, { status: 201 });
}

/**
 * Hapus file ImageKit berdasarkan URL (dipanggil dashboard saat foto/dokumen
 * diganti atau dihapus, supaya tidak menumpuk file yatim). Best effort:
 * file yang tidak ditemukan dianggap sudah bersih (200, deleted: false).
 */
export async function DELETE(request: NextRequest) {
  const env = readEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Belum dikonfigurasi (env Supabase/ImageKit belum diisi)" },
      { status: 503 },
    );
  }

  const auth = await authorizeAdmin(request, env);
  if (auth instanceof NextResponse) return auth;

  let url: unknown;
  try {
    ({ url } = (await request.json()) as { url?: unknown });
  } catch {
    return NextResponse.json({ error: "Body harus JSON { url }" }, { status: 400 });
  }
  if (typeof url !== "string" || url.length === 0) {
    return NextResponse.json({ error: 'Field "url" wajib diisi' }, { status: 400 });
  }

  const endpoint = env.ikUrlEndpoint.replace(/\/$/, "");
  if (!url.startsWith(`${endpoint}/`)) {
    return NextResponse.json({ error: "Bukan file ImageKit milik project ini" }, { status: 400 });
  }

  // Path relatif ImageKit, mis. "/villages/gayabaru/foto_abc123.jpg"
  const relPath = url.slice(endpoint.length).split("?")[0];
  if (!relPath.startsWith(`/villages/${VILLAGE_SLUG}/`)) {
    return NextResponse.json(
      { error: "File berada di luar folder desa ini" },
      { status: 403 },
    );
  }

  const fileName = decodeURIComponent(relPath.split("/").pop() ?? "");
  if (!fileName || fileName.includes('"')) {
    return NextResponse.json({ error: "Nama file tidak valid" }, { status: 400 });
  }

  const imagekit = createImageKit(env);
  const files = (await imagekit.listFiles({
    searchQuery: `name = "${fileName}"`,
    path: `/villages/${VILLAGE_SLUG}`,
    limit: 10,
  })) as Array<{ fileId?: string; filePath?: string; type?: string }>;

  const match = files.find((f) => f.filePath && decodeURIComponent(f.filePath) === decodeURIComponent(relPath));
  if (!match?.fileId) {
    // Sudah tidak ada di ImageKit; anggap bersih.
    return NextResponse.json({ deleted: false, reason: "not-found" });
  }

  await imagekit.deleteFile(match.fileId);
  return NextResponse.json({ deleted: true });
}

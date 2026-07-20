/**
 * Helper sesi admin (client-side).
 * Login memakai Supabase Auth; akses data dilindungi RLS di Supabase,
 * pengecekan di sini hanya untuk UX (redirect/guard), bukan keamanan utama.
 */
import { getSupabase } from "./supabase";
import { VILLAGE_SLUG } from "./desa";
import type { AdminProfileRow, VillageRow } from "./db-types";

export interface AdminSession {
  accessToken: string;
  email: string | null;
  profile: Pick<AdminProfileRow, "id" | "full_name" | "role" | "village_id" | "username">;
  /** Baris desa milik app INI (dari VILLAGE_SLUG). */
  village: VillageRow;
}

/**
 * Muat sesi admin yang sedang login. Mengembalikan null bila belum login,
 * bukan admin, atau admin desa lain (village_admin hanya boleh kelola desanya).
 */
export async function loadAdminSession(): Promise<AdminSession | null> {
  const supabase = getSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, full_name, role, village_id, username")
    .eq("id", session.user.id)
    .maybeSingle();
  if (!profile) return null;

  const { data: village } = await supabase
    .from("villages")
    .select("*")
    .eq("slug", VILLAGE_SLUG)
    .maybeSingle();
  if (!village) return null;

  if (profile.role !== "super_admin" && profile.village_id !== village.id) {
    return null;
  }

  return {
    accessToken: session.access_token,
    email: session.user.email ?? null,
    profile,
    village: village as VillageRow,
  };
}

export async function signOutAdmin(): Promise<void> {
  await getSupabase().auth.signOut();
}

/** Upload file ke ImageKit lewat /api/upload; balikan URL publiknya. */
/**
 * Token akses TERBARU dari sesi Supabase. Jangan pakai token yang disimpan
 * saat halaman dibuka: token kedaluwarsa setelah +-1 jam, sehingga upload
 * dari tab yang lama terbuka akan ditolak 401. getSession() otomatis
 * me-refresh token bila sudah kedaluwarsa.
 */
async function tokenSegar(fallback: string): Promise<string> {
  try {
    const {
      data: { session },
    } = await getSupabase().auth.getSession();
    return session?.access_token ?? fallback;
  } catch {
    return fallback;
  }
}

export async function uploadFile(
  file: File,
  accessToken: string,
  opsi?: {
    /** true = JANGAN kompres (foto utama: hero/background halaman). */
    asli?: boolean;
  },
): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  if (opsi?.asli) body.append("mode", "asli");
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${await tokenSegar(accessToken)}` },
    body,
  });
  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) {
    throw new Error(json.error ?? "Upload gagal");
  }
  return json.url;
}

/**
 * Hapus file lama di ImageKit lewat DELETE /api/upload. Best effort:
 * tidak pernah melempar error (kegagalan hanya meninggalkan file yatim,
 * bukan masalah bagi admin), dan URL non-ImageKit dilewati diam-diam.
 */
export async function deleteUploadedFile(
  url: string | null | undefined,
  accessToken: string,
): Promise<void> {
  if (!url || !url.includes("ik.imagekit.io")) return;
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${await tokenSegar(accessToken)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.warn("Gagal menghapus file lama di ImageKit:", err);
  }
}

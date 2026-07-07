import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client Supabase publik (publishable key — aman di browser, dilindungi RLS).
 * Dibuat lazy supaya import file ini tidak langsung error saat env belum diisi
 * (mis. saat build tanpa .env.local).
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Env NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diisi (lihat .env.example).",
    );
  }

  client = createClient(url, key);
  return client;
}

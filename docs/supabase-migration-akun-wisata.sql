-- Migrasi: username admin + WhatsApp utama desa + guidebook wisata
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.
--
-- 1. Admin punya `username` sendiri (bisa diubah dari /admin/akun) dan
--    bisa login memakai username ATAU email.
-- 2. `villages.whatsapp` = nomor WA utama desa; dipakai SERAGAM di seluruh
--    halaman /wisata (detail destinasi, paket wisata, guidebook).
-- 3. `villages.guidebook_url` = PDF guidebook wisata (upload dari
--    /admin/wisata, file di ImageKit).

-- ── 1. Username admin ──

ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Unik tanpa membedakan besar-kecil huruf.
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_profiles_username
  ON public.admin_profiles (lower(username))
  WHERE username IS NOT NULL;

-- Admin boleh memperbarui profilnya sendiri (untuk ganti username).
DROP POLICY IF EXISTS "admin update own profile" ON public.admin_profiles;
CREATE POLICY "admin update own profile" ON public.admin_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Login dengan username: cari email-nya lewat fungsi SECURITY DEFINER
-- (anon tidak pernah bisa membaca auth.users langsung).
CREATE OR REPLACE FUNCTION public.email_untuk_username(u text)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT au.email::text
  FROM admin_profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE lower(p.username) = lower(u)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.email_untuk_username(text) TO anon, authenticated;

-- ── 2 & 3. Kolom desa: WA utama + guidebook ──

ALTER TABLE public.villages
  ADD COLUMN IF NOT EXISTS whatsapp      text,  -- nomor wa.me tanpa "+"/spasi
  ADD COLUMN IF NOT EXISTS guidebook_url text;  -- URL PDF guidebook (ImageKit)

-- Verifikasi:
-- SELECT username FROM public.admin_profiles;
-- SELECT public.email_untuk_username('isi-username');
-- SELECT whatsapp, guidebook_url FROM public.villages;

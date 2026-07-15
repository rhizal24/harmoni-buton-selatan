-- Migrasi: foto hero tiap halaman dapat dikelola admin (menu "Hero Section")
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.

ALTER TABLE public.villages
  ADD COLUMN IF NOT EXISTS hero_beranda_url text,
  ADD COLUMN IF NOT EXISTS hero_wisata_url  text,
  ADD COLUMN IF NOT EXISTS hero_profil_url  text;

-- Kosong (NULL) → halaman tetap pakai foto default bawaan (/images/*.jpg),
-- tidak ada perubahan tampilan sampai admin meng-upload foto baru.

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='villages'
--   AND column_name IN ('hero_beranda_url','hero_wisata_url','hero_profil_url');

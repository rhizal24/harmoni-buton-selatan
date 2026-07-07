-- Migrasi: kolom detail destinasi wisata — jalankan di Supabase SQL Editor.
-- Menambah tagline, tag, kontak, sosial media, dan link Google Maps ke
-- tourism_spots supaya bisa dikelola admin lewat dashboard (/admin/wisata).
-- Idempotent: aman dijalankan berulang.

ALTER TABLE public.tourism_spots
  ADD COLUMN IF NOT EXISTS tagline        text,
  ADD COLUMN IF NOT EXISTS tags           text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS phone          text,          -- utk ditampilkan, mis. "+62 812-3456-7890"
  ADD COLUMN IF NOT EXISTS whatsapp       text,          -- utk link wa.me, tanpa "+"/spasi, mis. "6281234567890"
  ADD COLUMN IF NOT EXISTS instagram_url  text,
  ADD COLUMN IF NOT EXISTS tiktok_url     text,
  ADD COLUMN IF NOT EXISTS facebook_url   text,
  ADD COLUMN IF NOT EXISTS maps_url       text;          -- deep-link Google Maps

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'tourism_spots' ORDER BY ordinal_position;

-- Migrasi: kolom koordinat UMKM — dipakai marker di peta interaktif (/peta)
-- yang sama dengan marker Wisata (lihat docs/supabase-migration-wisata-detail.sql
-- untuk pola serupa di tourism_spots.latitude/longitude).
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.

ALTER TABLE public.umkm
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'umkm' AND column_name IN ('latitude', 'longitude');

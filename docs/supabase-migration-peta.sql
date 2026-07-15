-- Migrasi: gambar peta statis untuk halaman /peta (menu admin "Peta")
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.

ALTER TABLE public.villages
  ADD COLUMN IF NOT EXISTS peta_wisata_url text,
  ADD COLUMN IF NOT EXISTS peta_dusun_url  text;

-- Kosong (NULL) → halaman /peta menampilkan placeholder "Peta belum
-- diunggah" untuk slot itu, sampai admin meng-upload gambarnya.

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='villages'
--   AND column_name IN ('peta_wisata_url','peta_dusun_url');

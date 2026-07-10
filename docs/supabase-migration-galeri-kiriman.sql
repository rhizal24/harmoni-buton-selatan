-- Migrasi: kiriman foto galeri dari warga (moderasi admin)
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.
--
-- Alur: pengunjung mengunggah foto lewat /api/galeri/kirim → row berstatus
-- 'pending' → admin memverifikasi di /admin/galeri (Terima → 'approved',
-- Tolak → hapus). Publik (anon) hanya bisa membaca foto 'approved'.

-- ── 1. Kolom baru di gallery_images ──
-- Default 'approved' agar foto lama & upload admin langsung tampil.

ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS status        text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_by  text,
  ADD COLUMN IF NOT EXISTS file_id       text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gallery_images_status_check'
  ) THEN
    ALTER TABLE public.gallery_images
      ADD CONSTRAINT gallery_images_status_check CHECK (status IN ('pending', 'approved'));
  END IF;
END $$;

-- ── 2. RLS: publik hanya membaca foto approved ──
-- Admin desa tetap melihat semua (termasuk pending) lewat policy
-- "village admin manage gallery_images" yang sudah ada (policy di-OR).

DROP POLICY IF EXISTS "public read gallery_images" ON public.gallery_images;
CREATE POLICY "public read gallery_images" ON public.gallery_images
  FOR SELECT
  USING (status = 'approved');

-- ── 3. RLS: anon boleh INSERT hanya berstatus pending ──
-- Dipakai endpoint publik /api/galeri/kirim (publishable key, tanpa login).

DROP POLICY IF EXISTS "public submit pending gallery_images" ON public.gallery_images;
CREATE POLICY "public submit pending gallery_images" ON public.gallery_images
  FOR INSERT TO anon
  WITH CHECK (status = 'pending');

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='gallery_images'
--   AND column_name IN ('status','submitted_by','file_id');
-- SELECT policyname FROM pg_policies WHERE tablename='gallery_images';

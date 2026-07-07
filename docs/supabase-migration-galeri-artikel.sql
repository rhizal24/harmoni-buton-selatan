-- Migrasi: galeri foto desa + kategori artikel (berita/umkm)
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.

-- ── 1. Tabel galeri foto per desa (foto + deskripsi singkat/caption) ──

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id            uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  village_id    uuid NOT NULL REFERENCES public.villages(id),
  image_url     text NOT NULL,
  caption       text,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read gallery_images" ON public.gallery_images;
CREATE POLICY "public read gallery_images" ON public.gallery_images
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "village admin manage gallery_images" ON public.gallery_images;
CREATE POLICY "village admin manage gallery_images" ON public.gallery_images
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- ── 2. Kategori artikel: 'berita' | 'umkm' ──

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'berita';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_category_check'
  ) THEN
    ALTER TABLE public.articles
      ADD CONSTRAINT articles_category_check CHECK (category IN ('berita', 'umkm'));
  END IF;
END $$;

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='gallery_images';
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='articles' AND column_name='category';

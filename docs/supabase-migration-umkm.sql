-- Migrasi: tabel UMKM (usaha warga) — dikelola dashboard /admin/umkm
-- (hanya desa gerakmakmur yang memakai fitur ini; tabel tetap per-desa via
-- village_id sehingga aman bila desa lain memakainya kelak).
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.
--
-- Kolom mengikuti persis field yang dirender frontend (UmkmDesa):
-- nama, deskripsi, foto, kategori, pemilik, lokasi, harga, produk[],
-- WA, Instagram, TikTok, dan link Google Maps.

CREATE TABLE IF NOT EXISTS public.umkm (
  id            uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  village_id    uuid NOT NULL REFERENCES public.villages(id),
  nama          text NOT NULL,
  deskripsi     text,
  foto_url      text,
  kategori      text,
  pemilik       text,
  lokasi        text,
  maps_url      text,
  latitude      numeric,
  longitude     numeric,
  wa            text,           -- nomor wa.me tanpa "+"/spasi, mis. 6281234567890
  instagram_url text,
  tiktok_url    text,
  produk        text[] NOT NULL DEFAULT '{}',
  harga_label   text,           -- teks bebas, mis. "Rp15.000-Rp60.000"
  display_order integer NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamp with time zone NOT NULL DEFAULT now(),
  updated_at    timestamp with time zone NOT NULL DEFAULT now()
);

-- Untuk yang sudah telanjur membuat tabel versi tanpa koordinat:
ALTER TABLE public.umkm
  ADD COLUMN IF NOT EXISTS latitude  numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

CREATE INDEX IF NOT EXISTS idx_umkm_village_published
  ON public.umkm (village_id, is_published, display_order);

ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read published umkm" ON public.umkm;
CREATE POLICY "public read published umkm" ON public.umkm
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "village admin manage umkm" ON public.umkm;
CREATE POLICY "village admin manage umkm" ON public.umkm
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'umkm';

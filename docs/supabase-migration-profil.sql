-- Migrasi: konten halaman Profil dapat dikelola admin
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.

-- ── 1. villages: tentang, visi, misi (sejarah pakai kolom `history` yang sudah ada) ──

ALTER TABLE public.villages
  ADD COLUMN IF NOT EXISTS about    text,
  ADD COLUMN IF NOT EXISTS vision   text,
  ADD COLUMN IF NOT EXISTS missions text[] NOT NULL DEFAULT '{}';

-- Admin boleh meng-update baris desanya sendiri (untuk simpan profil).
DROP POLICY IF EXISTS "village admin update village" ON public.villages;
CREATE POLICY "village admin update village" ON public.villages
  FOR UPDATE TO authenticated
  USING (id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (id = public.current_admin_village_id() OR public.is_super_admin());

-- ── 2. organization_structure: hierarki (atasan langsung) ──

ALTER TABLE public.organization_structure
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.organization_structure(id) ON DELETE SET NULL;

-- ── 3. population_data: label tampilan & urutan ──
--    value numeric tetap dipakai (angka mentah); value_label untuk teks
--    tampilan bebas seperti "±2.500" atau "12,4 km²".

ALTER TABLE public.population_data
  ADD COLUMN IF NOT EXISTS value_label   text,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- ── 4. documents: kategori bebas (teks) + label tahun/tanggal terbit ──

ALTER TABLE public.documents ALTER COLUMN category DROP DEFAULT;
ALTER TABLE public.documents ALTER COLUMN category TYPE text USING category::text;
ALTER TABLE public.documents ALTER COLUMN category SET DEFAULT 'Lainnya';

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS period_label text;

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='villages'
--   AND column_name IN ('about','vision','missions');
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='organization_structure' AND column_name='parent_id';

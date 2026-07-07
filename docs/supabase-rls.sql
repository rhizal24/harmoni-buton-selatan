-- RLS policy untuk admin desa — jalankan di Supabase Dashboard -> SQL Editor.
-- Idempotent: aman dijalankan berulang (DROP POLICY IF EXISTS dulu).
--
-- Model akses:
--   * anon (publik)      : baca konten yang published
--   * village_admin      : kelola (insert/update/delete/select) konten desanya sendiri
--   * super_admin        : kelola semua desa
-- Upload file ke ImageKit TIDAK lewat RLS — dijaga di route /api/upload.

-- ── Helper (SECURITY DEFINER supaya bisa baca admin_profiles tanpa rekursi RLS) ──

CREATE OR REPLACE FUNCTION public.current_admin_village_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT village_id FROM admin_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- ── admin_profiles: admin boleh baca profilnya sendiri ──

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin read own profile" ON public.admin_profiles;
CREATE POLICY "admin read own profile" ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());

-- ── villages: publik boleh baca desa aktif ──

ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active villages" ON public.villages;
CREATE POLICY "public read active villages" ON public.villages
  FOR SELECT
  USING (is_active = true);

-- ── tourism_spots ──

ALTER TABLE public.tourism_spots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read published tourism_spots" ON public.tourism_spots;
CREATE POLICY "public read published tourism_spots" ON public.tourism_spots
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "village admin manage tourism_spots" ON public.tourism_spots;
CREATE POLICY "village admin manage tourism_spots" ON public.tourism_spots
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- ── tourism_spot_images (scoped lewat spot induknya) ──

ALTER TABLE public.tourism_spot_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read tourism_spot_images" ON public.tourism_spot_images;
CREATE POLICY "public read tourism_spot_images" ON public.tourism_spot_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tourism_spots s
      WHERE s.id = tourism_spot_id AND s.is_published = true
    )
  );

DROP POLICY IF EXISTS "village admin manage tourism_spot_images" ON public.tourism_spot_images;
CREATE POLICY "village admin manage tourism_spot_images" ON public.tourism_spot_images
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tourism_spots s
      WHERE s.id = tourism_spot_id
        AND (s.village_id = public.current_admin_village_id() OR public.is_super_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tourism_spots s
      WHERE s.id = tourism_spot_id
        AND (s.village_id = public.current_admin_village_id() OR public.is_super_admin())
    )
  );

-- ── tourism_packages ──

ALTER TABLE public.tourism_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read published tourism_packages" ON public.tourism_packages;
CREATE POLICY "public read published tourism_packages" ON public.tourism_packages
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "village admin manage tourism_packages" ON public.tourism_packages;
CREATE POLICY "village admin manage tourism_packages" ON public.tourism_packages
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- ── articles ──

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read published articles" ON public.articles;
CREATE POLICY "public read published articles" ON public.articles
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "village admin manage articles" ON public.articles;
CREATE POLICY "village admin manage articles" ON public.articles
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- ── documents ──

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read documents" ON public.documents;
CREATE POLICY "public read documents" ON public.documents
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "village admin manage documents" ON public.documents;
CREATE POLICY "village admin manage documents" ON public.documents
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- ── organization_structure & population_data ──

ALTER TABLE public.organization_structure ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read organization_structure" ON public.organization_structure;
CREATE POLICY "public read organization_structure" ON public.organization_structure
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "village admin manage organization_structure" ON public.organization_structure;
CREATE POLICY "village admin manage organization_structure" ON public.organization_structure
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

ALTER TABLE public.population_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read population_data" ON public.population_data;
CREATE POLICY "public read population_data" ON public.population_data
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "village admin manage population_data" ON public.population_data;
CREATE POLICY "village admin manage population_data" ON public.population_data
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- Verifikasi cepat: daftar policy per tabel
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

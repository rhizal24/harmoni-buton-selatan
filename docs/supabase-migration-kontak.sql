-- Migrasi: info kontak footer dapat dikelola admin (menu "Kontak Footer")
-- Jalankan di Supabase SQL Editor. Idempotent: aman dijalankan berulang.

-- ── 1. villages: email + sosial media (kolom singular, satu per desa) ──

ALTER TABLE public.villages
  ADD COLUMN IF NOT EXISTS email          text,
  ADD COLUMN IF NOT EXISTS instagram_url  text,
  ADD COLUMN IF NOT EXISTS tiktok_url     text,
  ADD COLUMN IF NOT EXISTS facebook_url   text;

-- Kebijakan UPDATE villages sudah ada (lihat supabase-migration-profil.sql),
-- otomatis mencakup kolom baru ini.

-- ── 2. footer_contacts: daftar kontak WhatsApp cepat (perangkat desa) ──

CREATE TABLE IF NOT EXISTS public.footer_contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id    uuid NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  name          text NOT NULL,
  jabatan       text NOT NULL,
  -- Jenis kontak: 'wa' (nomor wa.me tanpa "+"/spasi, mis. 6281234567890)
  -- atau 'email' (alamat email). Nilainya disimpan di kolom `value`.
  contact_type  text NOT NULL DEFAULT 'wa' CHECK (contact_type IN ('wa', 'email')),
  value         text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Untuk yang telanjur membuat tabel versi lama (kolom `phone`):
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'footer_contacts' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.footer_contacts ADD COLUMN IF NOT EXISTS contact_type text NOT NULL DEFAULT 'wa';
    ALTER TABLE public.footer_contacts ADD COLUMN IF NOT EXISTS value text;
    UPDATE public.footer_contacts SET value = phone WHERE value IS NULL;
    ALTER TABLE public.footer_contacts ALTER COLUMN value SET NOT NULL;
    ALTER TABLE public.footer_contacts DROP COLUMN phone;
  END IF;
END $$;

ALTER TABLE public.footer_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read footer_contacts" ON public.footer_contacts;
CREATE POLICY "public read footer_contacts" ON public.footer_contacts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "village admin manage footer_contacts" ON public.footer_contacts;
CREATE POLICY "village admin manage footer_contacts" ON public.footer_contacts
  FOR ALL TO authenticated
  USING (village_id = public.current_admin_village_id() OR public.is_super_admin())
  WITH CHECK (village_id = public.current_admin_village_id() OR public.is_super_admin());

-- Verifikasi:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='villages'
--   AND column_name IN ('email','instagram_url','tiktok_url','facebook_url');
-- SELECT * FROM public.footer_contacts LIMIT 5;

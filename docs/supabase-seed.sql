-- Seed awal Supabase — jalankan di Supabase Dashboard -> SQL Editor.
-- Aman dijalankan berulang (ON CONFLICT DO NOTHING).

-- 1. Dua desa (slug dipakai frontend: VILLAGE_SLUG di src/lib/desa.ts)
INSERT INTO public.villages (name, slug, short_description)
VALUES
  ('Desa Gaya Baru',    'gayabaru',    'Website resmi Desa Gaya Baru, Kecamatan Buton Selatan, Sulawesi Tenggara.'),
  ('Desa Gerak Makmur', 'gerakmakmur', 'Website resmi Desa Gerak Makmur, Kecamatan Buton Selatan, Sulawesi Tenggara.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Admin pertama (jalankan SETELAH membuat user di Authentication -> Users).
--    PENTING: kolom `id` bertipe uuid (mengacu auth.users.id), BUKAN email.
--    Bentuk SELECT di bawah mencari uuid-nya otomatis dari email user.
INSERT INTO public.admin_profiles (id, full_name, role, village_id)
VALUES (
  'a85c38ce-9ec5-46db-9f2c-b94e5763ee71',
  'Admin Gaya Baru',
  'village_admin',
  (SELECT id FROM public.villages WHERE slug = 'gayabaru')
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admin_profiles (id, full_name, role, village_id)
SELECT u.id, 'Admin Gerak Makmur', 'village_admin', v.id
FROM auth.users u, public.villages v
WHERE u.email = 'muhammadrhizalrhomadon@mail.ugm.ac.id' AND v.slug = 'gerakmakmur'
ON CONFLICT (id) DO NOTHING;

-- Verifikasi hasil:
-- SELECT p.id, p.full_name, p.role, v.slug
-- FROM public.admin_profiles p LEFT JOIN public.villages v ON v.id = p.village_id;

-- Seed konten Profil Desa — mengisi Supabase sesuai konten placeholder yang
-- sudah tampil di situs, supaya admin tinggal MENGUBAH (bukan mengetik dari nol).
-- Jalankan SETELAH docs/supabase-migration-profil.sql.
-- Idempotent: villages hanya mengisi kolom yang masih kosong; tabel lain
-- hanya di-seed bila belum ada baris untuk desa tsb.

-- ══════════════════════════ 1. VILLAGES (tentang, sejarah, visi, misi) ══════════════════════════

UPDATE public.villages SET
  about = COALESCE(about,
    E'Desa Gerak Makmur adalah desa pesisir di Kecamatan Sampolawa, Kabupaten Buton Selatan, Sulawesi Tenggara. Berada di tepi Teluk Lande yang berair jernih dan dikelilingi perbukitan asri, sebagian besar warganya hidup sebagai nelayan dan petani dengan komoditas unggulan ikan budidaya dan bawang merah.\n\nKehidupan desa diwarnai budaya lokal yang kental — bahasa Cia-Cia dan semangat gotong royong yang masih terjaga. Beberapa tahun terakhir, desa mulai tumbuh sebagai kawasan wisata berbasis masyarakat lewat Karamba Resto, tebing-tebing eksotis, dan spot sunset yang menawan. Bagi warganya, desa ini lebih akrab disapa dengan satu nama: Lande.'),
  history = COALESCE(history,
    E'Gerak Makmur semula satu kesatuan wilayah dengan Windu Makmur dan Lapandewa Makmur di Kecamatan Sampolawa, sebelum pemekaran memisahkan keduanya. Gerak Makmur tetap di Sampolawa sebagai desa induk — titik awal perkembangan seluruh kawasan.\n\nMeski terbagi secara administratif, warganya tetap terikat pada satu nama warisan turun-temurun: Lande. Nama ini tak tercantum di peta resmi, namun hidup dalam tutur sehari-hari — konon berasal dari wisatawan yang menyamakan lanskapnya dengan London, atau pesawat Jepang yang mencoba mendarat (landing) di kawasan berbatu ini semasa Perang Dunia II.'),
  vision = COALESCE(vision,
    'Placeholder — tuliskan visi Desa Gerak Makmur di sini, mis. mewujudkan desa bahari yang maju, mandiri, dan berkelanjutan.'),
  missions = CASE WHEN missions IS NULL OR missions = '{}' THEN ARRAY[
    'Placeholder misi pertama — mis. mengembangkan potensi wisata bahari berbasis masyarakat.',
    'Placeholder misi kedua — mis. meningkatkan kualitas layanan publik dan infrastruktur desa.',
    'Placeholder misi ketiga — mis. memberdayakan UMKM dan ekonomi kreatif warga pesisir.',
    'Placeholder misi keempat — mis. menjaga kelestarian lingkungan laut dan pesisir.'
  ] ELSE missions END,
  updated_at = now()
WHERE slug = 'gerakmakmur';

UPDATE public.villages SET
  about = COALESCE(about,
    E'Desa Gaya Baru adalah desa pesisir di Kabupaten Buton Selatan, Sulawesi Tenggara. Dikelilingi laut jernih dan perbukitan asri, sebagian besar warganya hidup sebagai nelayan dan petani dengan hasil laut dan kebun sebagai penopang utama ekonomi desa.\n\nKehidupan desa diwarnai budaya lokal dan semangat gotong royong yang masih terjaga. Beberapa tahun terakhir, desa mulai mengembangkan potensi wisata bahari berbasis masyarakat — dari pantai berpasir putih hingga jalur ekowisata mangrove.'),
  history = COALESCE(history,
    E'Placeholder — tuliskan asal-usul Desa Gaya Baru di sini: kapan desa berdiri, dari wilayah mana dimekarkan, dan tonggak-tonggak penting perkembangannya.\n\nPlaceholder — lanjutkan dengan cerita atau warisan turun-temurun yang melekat pada desa: asal nama, tradisi, atau peristiwa bersejarah yang membentuk identitas warganya.'),
  vision = COALESCE(vision,
    'Placeholder — tuliskan visi Desa Gaya Baru di sini, mis. mewujudkan desa bahari yang maju, mandiri, dan berkelanjutan.'),
  missions = CASE WHEN missions IS NULL OR missions = '{}' THEN ARRAY[
    'Placeholder misi pertama — mis. mengembangkan potensi wisata bahari berbasis masyarakat.',
    'Placeholder misi kedua — mis. meningkatkan kualitas layanan publik dan infrastruktur desa.',
    'Placeholder misi ketiga — mis. memberdayakan UMKM dan ekonomi kreatif warga pesisir.',
    'Placeholder misi keempat — mis. menjaga kelestarian lingkungan laut dan pesisir.'
  ] ELSE missions END,
  updated_at = now()
WHERE slug = 'gayabaru';

-- ══════════════════════════ 2. POPULATION_DATA (Desa dalam Angka) ══════════════════════════
-- Kelompok & label mengikuti tampilan situs; admin hanya mengubah angkanya.

DO $$
DECLARE
  vid uuid;
BEGIN
  -- ── Gerak Makmur ──
  SELECT id INTO vid FROM public.villages WHERE slug = 'gerakmakmur';
  IF vid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.population_data WHERE village_id = vid) THEN
    INSERT INTO public.population_data (village_id, year, category, sub_category, value, value_label, display_order) VALUES
      (vid, 2026, 'Kependudukan', 'Jumlah Penduduk',            2500, '±2.500',  0),
      (vid, 2026, 'Kependudukan', 'Penduduk Laki-laki',         1270, '±1.270',  1),
      (vid, 2026, 'Kependudukan', 'Penduduk Perempuan',         1230, '±1.230',  2),
      (vid, 2026, 'Kependudukan', 'Kepala Keluarga',             680, '±680',    3),
      (vid, 2026, 'Wilayah & Administrasi', 'Luas Wilayah',     12.4, '12,4 km²', 10),
      (vid, 2026, 'Wilayah & Administrasi', 'Jumlah Dusun',        4, '4',       11),
      (vid, 2026, 'Wilayah & Administrasi', 'Jumlah RT',          12, '12',      12),
      (vid, 2026, 'Wilayah & Administrasi', 'Jarak ke Pusat Kecamatan', 8, '±8 km', 13),
      (vid, 2026, 'Mata Pencaharian', 'Nelayan',                 450, '±450',    20),
      (vid, 2026, 'Mata Pencaharian', 'Pembudidaya Ikan',        150, '±150',    21),
      (vid, 2026, 'Mata Pencaharian', 'Petani',                  380, '±380',    22),
      (vid, 2026, 'Mata Pencaharian', 'Wiraswasta & Pedagang',   120, '±120',    23),
      (vid, 2026, 'Mata Pencaharian', 'PNS & Honorer',            40, '±40',     24),
      (vid, 2026, 'Mata Pencaharian', 'Buruh & Tukang',           90, '±90',     25),
      (vid, 2026, 'Mata Pencaharian', 'Rumah Tangga Nelayan',    320, '±320',    26),
      (vid, 2026, 'Mata Pencaharian', 'Lainnya',                  70, '±70',     27);
  END IF;

  -- ── Gaya Baru ──
  SELECT id INTO vid FROM public.villages WHERE slug = 'gayabaru';
  IF vid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.population_data WHERE village_id = vid) THEN
    INSERT INTO public.population_data (village_id, year, category, sub_category, value, value_label, display_order) VALUES
      (vid, 2026, 'Kependudukan', 'Jumlah Penduduk',            2000, '±2.000',  0),
      (vid, 2026, 'Kependudukan', 'Penduduk Laki-laki',         1020, '±1.020',  1),
      (vid, 2026, 'Kependudukan', 'Penduduk Perempuan',          980, '±980',    2),
      (vid, 2026, 'Kependudukan', 'Kepala Keluarga',             550, '±550',    3),
      (vid, 2026, 'Wilayah & Administrasi', 'Luas Wilayah',       10, '±10 km²', 10),
      (vid, 2026, 'Wilayah & Administrasi', 'Jumlah Dusun',        3, '3',       11),
      (vid, 2026, 'Wilayah & Administrasi', 'Jumlah RT',           9, '9',       12),
      (vid, 2026, 'Wilayah & Administrasi', 'Jarak ke Pusat Kecamatan', 6, '±6 km', 13),
      (vid, 2026, 'Mata Pencaharian', 'Nelayan',                 380, '±380',    20),
      (vid, 2026, 'Mata Pencaharian', 'Petani',                  320, '±320',    21),
      (vid, 2026, 'Mata Pencaharian', 'Wiraswasta & Pedagang',   100, '±100',    22),
      (vid, 2026, 'Mata Pencaharian', 'PNS & Honorer',            35, '±35',     23),
      (vid, 2026, 'Mata Pencaharian', 'Buruh & Tukang',           80, '±80',     24),
      (vid, 2026, 'Mata Pencaharian', 'Lainnya',                  60, '±60',     25);
  END IF;
END $$;

-- ══════════════════════════ 3. ORGANIZATION_STRUCTURE (bagan perangkat desa) ══════════════════════════

DO $$
DECLARE
  vid uuid;
  kepala uuid;
  sekretaris uuid;
BEGIN
  -- ── Gerak Makmur ──
  SELECT id INTO vid FROM public.villages WHERE slug = 'gerakmakmur';
  IF vid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.organization_structure WHERE village_id = vid) THEN
    INSERT INTO public.organization_structure (village_id, position_name, person_name, display_order)
      VALUES (vid, 'Kepala Desa', 'La Ode Rismanton, S.H., NL.P', 0) RETURNING id INTO kepala;
    INSERT INTO public.organization_structure (village_id, position_name, person_name, parent_id, display_order)
      VALUES (vid, 'Sekretaris Desa', 'Hamrin, A.Md. Komp.', kepala, 1) RETURNING id INTO sekretaris;
    INSERT INTO public.organization_structure (village_id, position_name, person_name, parent_id, display_order) VALUES
      (vid, 'Kaur Keuangan',      'Usrin',                 sekretaris, 2),
      (vid, 'Kaur Perencanaan',   'Ode. F. Sukun, S.K.M',  sekretaris, 3),
      (vid, 'Kasi Pemerintahan',  'La Ode Arlan',          kepala,     4),
      (vid, 'Kasi Kesejahteraan', 'Nalda Havid',           kepala,     5),
      (vid, 'Kadus Lande 1',      'Ardianton',             kepala,     6),
      (vid, 'Kadus Lande 2',      'Suhidin',               kepala,     7),
      (vid, 'Kadus Lande 3',      'Darmin, S.Pd.',         kepala,     8),
      (vid, 'Kadus Lande 4',      'La Ode Asmin, S.E.',    kepala,     9);
  END IF;

  -- ── Gaya Baru (placeholder — ganti nama lewat dashboard admin) ──
  SELECT id INTO vid FROM public.villages WHERE slug = 'gayabaru';
  IF vid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.organization_structure WHERE village_id = vid) THEN
    INSERT INTO public.organization_structure (village_id, position_name, person_name, display_order)
      VALUES (vid, 'Kepala Desa', 'Nama Kepala Desa', 0) RETURNING id INTO kepala;
    INSERT INTO public.organization_structure (village_id, position_name, person_name, parent_id, display_order)
      VALUES (vid, 'Sekretaris Desa', 'Nama Sekretaris', kepala, 1) RETURNING id INTO sekretaris;
    INSERT INTO public.organization_structure (village_id, position_name, person_name, parent_id, display_order) VALUES
      (vid, 'Kaur Keuangan',      'Nama Kaur Keuangan',      sekretaris, 2),
      (vid, 'Kaur Perencanaan',   'Nama Kaur Perencanaan',   sekretaris, 3),
      (vid, 'Kasi Pemerintahan',  'Nama Kasi Pemerintahan',  kepala,     4),
      (vid, 'Kasi Kesejahteraan', 'Nama Kasi Kesejahteraan', kepala,     5),
      (vid, 'Kadus 1',            'Nama Kadus 1',            kepala,     6),
      (vid, 'Kadus 2',            'Nama Kadus 2',            kepala,     7),
      (vid, 'Kadus 3',            'Nama Kadus 3',            kepala,     8);
  END IF;
END $$;

-- ══════════════════════════ 4. DOCUMENTS (dokumen publik desa) ══════════════════════════
-- file_url masih menunjuk PDF placeholder di /public/docs situs masing-masing;
-- ganti lewat dashboard admin (upload PDF asli ke ImageKit).

DO $$
DECLARE
  vid uuid;
BEGIN
  SELECT id INTO vid FROM public.villages WHERE slug = 'gerakmakmur';
  IF vid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.documents WHERE village_id = vid) THEN
    INSERT INTO public.documents (village_id, title, category, period_label, file_url) VALUES
      (vid, 'Profil Desa Gerak Makmur',            'Profil',      '2025', '/docs/profil-desa.pdf'),
      (vid, 'RPJMDes 2021–2027',                   'Perencanaan', '2021', '/docs/rpjmdes-2021-2027.pdf'),
      (vid, 'APBDes Tahun Anggaran 2025',          'Anggaran',    '2025', '/docs/apbdes-2025.pdf'),
      (vid, 'Laporan Realisasi APBDes 2024',       'Laporan',     '2024', '/docs/realisasi-apbdes-2024.pdf'),
      (vid, 'Peraturan Desa No. 1 Tahun 2025',     'Regulasi',    '2025', '/docs/perdes-01-2025.pdf');
  END IF;

  SELECT id INTO vid FROM public.villages WHERE slug = 'gayabaru';
  IF vid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.documents WHERE village_id = vid) THEN
    INSERT INTO public.documents (village_id, title, category, period_label, file_url) VALUES
      (vid, 'Profil Desa Gaya Baru',               'Profil',      '2025', '/docs/profil-desa.pdf'),
      (vid, 'RPJMDes 2021–2027',                   'Perencanaan', '2021', '/docs/rpjmdes-2021-2027.pdf'),
      (vid, 'APBDes Tahun Anggaran 2025',          'Anggaran',    '2025', '/docs/apbdes-2025.pdf'),
      (vid, 'Laporan Realisasi APBDes 2024',       'Laporan',     '2024', '/docs/realisasi-apbdes-2024.pdf'),
      (vid, 'Peraturan Desa No. 1 Tahun 2025',     'Regulasi',    '2025', '/docs/perdes-01-2025.pdf');
  END IF;
END $$;

-- Verifikasi:
-- SELECT v.slug, count(p.*) AS statistik, count(DISTINCT o.id) AS struktur, count(DISTINCT d.id) AS dokumen
-- FROM public.villages v
-- LEFT JOIN public.population_data p ON p.village_id = v.id
-- LEFT JOIN public.organization_structure o ON o.village_id = v.id
-- LEFT JOIN public.documents d ON d.village_id = v.id
-- GROUP BY v.slug;

-- Seed "Desa dalam Angka" GAYA BARU (struktur infografis baru, mengikuti
-- gayabaru-desa.com/infografis). Jalankan di Supabase SQL Editor.
--
-- PERHATIAN: menghapus semua baris population_data milik desa GAYABARU lalu
-- mengisi ulang dengan struktur baru (7 kelompok / 46 angka). Data desa
-- gerakmakmur TIDAK tersentuh.
--
-- Angka penduduk, mata pencaharian, dan agama diambil dari situs resmi;
-- kelompok umur / dusun / pendidikan masih placeholder proporsional,
-- tinggal diubah lewat dashboard /admin/statistik (hanya angkanya).

-- Bersihkan em dash dari teks profil gayabaru (gaya penulisan baru tanpa em dash)
UPDATE public.villages SET
  about             = replace(about, '—', '-'),
  history           = replace(history, '—', '-'),
  vision            = replace(vision, '—', '-'),
  short_description = replace(short_description, '—', '-'),
  missions = COALESCE(
    (SELECT array_agg(replace(m, '—', '-')) FROM unnest(missions) AS m), missions),
  updated_at = now()
WHERE slug = 'gayabaru';

DO $$
DECLARE
  vid uuid;
BEGIN
  SELECT id INTO vid FROM public.villages WHERE slug = 'gayabaru';
  IF vid IS NULL THEN
    RAISE EXCEPTION 'Desa gayabaru belum ada di tabel villages';
  END IF;

  DELETE FROM public.population_data WHERE village_id = vid;

  INSERT INTO public.population_data (village_id, year, category, sub_category, value, value_label, display_order) VALUES
    -- Penduduk & Kepala Keluarga
    (vid, 2026, 'Penduduk & Kepala Keluarga', 'Total Penduduk',   1678, '1.678', 0),
    (vid, 2026, 'Penduduk & Kepala Keluarga', 'Laki-laki',         896, '896',   1),
    (vid, 2026, 'Penduduk & Kepala Keluarga', 'Perempuan',         782, '782',   2),
    (vid, 2026, 'Penduduk & Kepala Keluarga', 'Kepala Keluarga',   380, '380',   3),
    -- Kelompok Umur (bar horizontal)
    (vid, 2026, 'Kelompok Umur', '0-1 Tahun',    35, '35',  10),
    (vid, 2026, 'Kelompok Umur', '1-3 Tahun',    78, '78',  11),
    (vid, 2026, 'Kelompok Umur', '3-6 Tahun',   120, '120', 12),
    (vid, 2026, 'Kelompok Umur', '6-15 Tahun',  295, '295', 13),
    (vid, 2026, 'Kelompok Umur', '15-45 Tahun', 730, '730', 14),
    (vid, 2026, 'Kelompok Umur', '45-54 Tahun', 180, '180', 15),
    (vid, 2026, 'Kelompok Umur', '54-60 Tahun', 120, '120', 16),
    (vid, 2026, 'Kelompok Umur', '>60 Tahun',   120, '120', 17),
    -- Populasi per Dusun (pie)
    (vid, 2026, 'Populasi per Dusun', 'Dusun Jaya',       640, '640', 20),
    (vid, 2026, 'Populasi per Dusun', 'Lakaliba',         560, '560', 21),
    (vid, 2026, 'Populasi per Dusun', 'Dusun Lantai Dua', 478, '478', 22),
    -- KK per Dusun (pie)
    (vid, 2026, 'KK per Dusun', 'Dusun Jaya',       145, '145', 30),
    (vid, 2026, 'KK per Dusun', 'Lakaliba',         127, '127', 31),
    (vid, 2026, 'KK per Dusun', 'Dusun Lantai Dua', 108, '108', 32),
    -- Tingkat Pendidikan (bar vertikal)
    (vid, 2026, 'Tingkat Pendidikan', 'Tidak Sekolah', 210, '210', 40),
    (vid, 2026, 'Tingkat Pendidikan', 'SD',            520, '520', 41),
    (vid, 2026, 'Tingkat Pendidikan', 'SMP',           340, '340', 42),
    (vid, 2026, 'Tingkat Pendidikan', 'SMA',           380, '380', 43),
    (vid, 2026, 'Tingkat Pendidikan', 'Diploma',        45, '45',  44),
    (vid, 2026, 'Tingkat Pendidikan', 'S1',             95, '95',  45),
    (vid, 2026, 'Tingkat Pendidikan', 'S2',              8, '8',   46),
    (vid, 2026, 'Tingkat Pendidikan', 'S3',              2, '2',   47),
    (vid, 2026, 'Tingkat Pendidikan', 'Lainnya',        78, '78',  48),
    -- Mata Pencaharian (bar horizontal)
    (vid, 2026, 'Mata Pencaharian', 'Petani Pemilik Lahan',     9, '9',   50),
    (vid, 2026, 'Mata Pencaharian', 'Petani Penyewa',           3, '3',   51),
    (vid, 2026, 'Mata Pencaharian', 'Buruh Tani',               5, '5',   52),
    (vid, 2026, 'Mata Pencaharian', 'Nelayan Pemilik Kapal',  118, '118', 53),
    (vid, 2026, 'Mata Pencaharian', 'Nelayan Penyewa Perahu',   4, '4',   54),
    (vid, 2026, 'Mata Pencaharian', 'Buruh Nelayan',          158, '158', 55),
    (vid, 2026, 'Mata Pencaharian', 'Guru Non PNS',             2, '2',   56),
    (vid, 2026, 'Mata Pencaharian', 'Pedagang',                 7, '7',   57),
    (vid, 2026, 'Mata Pencaharian', 'PNS/ASN',                  4, '4',   58),
    (vid, 2026, 'Mata Pencaharian', 'TNI',                      3, '3',   59),
    (vid, 2026, 'Mata Pencaharian', 'Perangkat Desa',           7, '7',   60),
    (vid, 2026, 'Mata Pencaharian', 'Lainnya',                 98, '98',  61),
    -- Agama (kartu angka)
    (vid, 2026, 'Agama', 'Islam',    1678, '1.678', 70),
    (vid, 2026, 'Agama', 'Kristen',     0, '0',     71),
    (vid, 2026, 'Agama', 'Katolik',     0, '0',     72),
    (vid, 2026, 'Agama', 'Hindu',       0, '0',     73),
    (vid, 2026, 'Agama', 'Buddha',      0, '0',     74),
    (vid, 2026, 'Agama', 'Konghucu',    0, '0',     75),
    (vid, 2026, 'Agama', 'Lainnya',     0, '0',     76);
END $$;

-- Verifikasi:
-- SELECT category, count(*) FROM public.population_data p
-- JOIN public.villages v ON v.id = p.village_id AND v.slug = 'gayabaru'
-- GROUP BY category ORDER BY min(display_order);

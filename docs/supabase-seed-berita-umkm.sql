-- Seed berita GAYA BARU + UMKM GERAK MAKMUR (dummy, untuk preview).
-- Jalankan di Supabase SQL Editor. Aman dijalankan berulang (skip bila sudah ada).
--
-- Catatan:
--   * Berita GERAK MAKMUR sudah di-seed file terpisah:
--     docs/supabase-seed-artikel-dummy.sql (jalankan itu juga bila belum).
--   * UMKM masuk ke tabel `umkm` (butuh docs/supabase-migration-umkm.sql dulu).
--   * Gayabaru tidak diberi UMKM karena situsnya tidak punya bagian UMKM.
--   * Hapus dummy sebelum rilis:
--     DELETE FROM public.articles WHERE slug LIKE 'dummy-%';
--     DELETE FROM public.umkm WHERE wa LIKE '62812000000%';

-- ══════════════ 1. BERITA DESA GAYA BARU (5 artikel) ══════════════

INSERT INTO public.articles
  (village_id, title, slug, excerpt, content, cover_image_url, category, is_published, published_at)
SELECT v.id, d.title, d.slug, d.excerpt, d.content, d.cover, 'berita', true, d.published_at::timestamptz
FROM public.villages v
CROSS JOIN (
  VALUES
    (
      'Gotong Royong Pembersihan Pantai Gaya Baru Sambut Musim Kunjungan',
      'dummy-gotong-royong-pantai-gaya-baru',
      'Puluhan warga bersama mahasiswa KKN membersihkan garis Pantai Gaya Baru sebagai persiapan musim kunjungan wisata.',
      E'Puluhan warga Desa Gaya Baru bergotong royong membersihkan garis pantai pada akhir pekan lalu. Kegiatan ini melibatkan karang taruna, ibu-ibu PKK, serta mahasiswa KKN yang tengah bertugas di desa.\n\nSampah plastik yang terkumpul dipilah untuk didaur ulang, sementara sampah organik diolah menjadi kompos untuk kebun warga. Kepala desa menyampaikan bahwa kebersihan pantai adalah wajah desa di mata pengunjung.\n\nKegiatan serupa direncanakan rutin setiap bulan agar kawasan wisata pantai dan sekitarnya tetap asri dan nyaman dikunjungi.',
      '/images/wisata-pantai.jpg',
      '2026-07-10 08:00:00+08'
    ),
    (
      'Panen Perdana Rumput Laut Kelompok Tani Bahari',
      'dummy-panen-rumput-laut-gaya-baru',
      'Kelompok Tani Bahari memanen rumput laut perdana dengan hasil melampaui perkiraan awal musim tanam.',
      E'Kelompok Tani Bahari Desa Gaya Baru merayakan panen perdana rumput laut hasil budidaya di perairan desa. Hasil panen melampaui perkiraan awal dan langsung diserap pengepul lokal.\n\nBudidaya rumput laut menjadi salah satu mata pencaharian alternatif warga pesisir di samping menangkap ikan. Pendampingan teknis dilakukan bersama penyuluh perikanan kecamatan.\n\nSebagian hasil panen akan diolah ibu-ibu PKK menjadi produk turunan seperti keripik dan dodol rumput laut untuk dijajakan kepada pengunjung.',
      '/images/wisata-mangrove.jpg',
      '2026-07-07 09:30:00+08'
    ),
    (
      'Pelatihan Promosi Wisata Digital bagi Pemuda Desa',
      'dummy-pelatihan-promosi-wisata-digital',
      'Pemuda desa belajar mempromosikan wisata lewat media sosial, dari memotret spot foto hingga menulis konten.',
      E'Belasan pemuda Desa Gaya Baru mengikuti pelatihan promosi wisata digital yang digelar di balai desa. Materi mencakup cara memotret spot wisata dengan ponsel, menulis konten media sosial, hingga membalas pertanyaan calon pengunjung.\n\nPelatihan ini merupakan bagian dari program kerja mahasiswa KKN bersama pemerintah desa untuk memperkenalkan potensi wisata desa ke luar daerah.\n\nKonten karya peserta akan ditampilkan di akun media sosial resmi desa dan situs web desa.',
      '/images/hero-bg.jpg',
      '2026-07-04 14:00:00+08'
    ),
    (
      'Perbaikan Dermaga Nelayan Rampung Lebih Cepat',
      'dummy-perbaikan-dermaga-nelayan',
      'Perbaikan papan lantai dan pengecatan ulang dermaga nelayan selesai lebih cepat berkat swadaya warga.',
      E'Perbaikan dermaga nelayan Desa Gaya Baru rampung lebih cepat dari jadwal berkat gotong royong warga. Papan lantai yang lapuk diganti kayu ulin, sementara pegangan tangan dicat ulang dengan warna khas desa.\n\nDermaga merupakan titik utama aktivitas warga: tempat sandar perahu, bongkar muat hasil laut, sekaligus latar favorit pengunjung untuk berfoto.\n\nPemerintah desa mengalokasikan dana pemeliharaan rutin agar fasilitas tetap aman, terutama menjelang musim ramai kunjungan di akhir tahun.',
      '/images/wisata-diving.jpg',
      '2026-07-01 10:00:00+08'
    ),
    (
      'Festival Kuliner Pesisir Meriahkan Akhir Pekan di Pantai Gaya Baru',
      'dummy-festival-kuliner-pesisir-gaya-baru',
      'Aneka olahan hasil laut warga dijajakan di festival kuliner pertama yang digelar di Pantai Gaya Baru.',
      E'Pantai Gaya Baru dipadati pengunjung saat festival kuliner pesisir pertama digelar akhir pekan lalu. Belasan lapak warga menjajakan olahan hasil laut, dari ikan bakar bumbu khas hingga abon dan keripik rumput laut.\n\nFestival ini menjadi ajang uji pasar bagi produk warga sekaligus hiburan bagi masyarakat dan wisatawan yang datang.\n\nMelihat antusiasme pengunjung, pemerintah desa berencana menjadikan festival kuliner sebagai agenda rutin setiap musim liburan.',
      '/images/wisata-pantai.jpg',
      '2026-06-27 16:00:00+08'
    )
) AS d(title, slug, excerpt, content, cover, published_at)
WHERE v.slug = 'gayabaru'
  AND NOT EXISTS (
    SELECT 1 FROM public.articles a WHERE a.slug = d.slug AND a.village_id = v.id
  );

-- ══════════════ 2. UMKM DESA GERAK MAKMUR (8 usaha, tabel umkm) ══════════════
-- Sama dengan seed statis frontend (src/data/seeds/umkm.ts).
-- Nomor WA, koordinat, dan sosmed masih CONTOH — ubah lewat /admin/umkm.

INSERT INTO public.umkm
  (village_id, nama, kategori, pemilik, deskripsi, foto_url, lokasi, maps_url,
   wa, instagram_url, tiktok_url, produk, harga_label, display_order, is_published)
SELECT v.id, d.nama, d.kategori, d.pemilik, d.deskripsi, d.foto, d.lokasi, d.maps,
       d.wa, d.ig, d.tt, d.produk, d.harga, d.urutan, true
FROM public.villages v
CROSS JOIN (
  VALUES
    ('Abon Ikan Bahari', 'Kuliner', 'Kelompok Ibu Nelayan Lande',
     'Abon ikan tuna asap hasil laut segar, diolah kelompok ibu nelayan dengan pengasapan tradisional beraroma khas.',
     '/images/wisata-pantai.jpg', 'Dusun Lande, dekat dermaga Karamba',
     'https://www.google.com/maps?q=-5.6712,122.7089', '6281200000010',
     'https://instagram.com/abonikanbahari', 'https://tiktok.com/@abonikanbahari',
     ARRAY['Abon tuna 100 g', 'Abon tuna 250 g', 'Abon pedas'], 'Rp25.000-Rp60.000', 0),
    ('Kerajinan Kerang Lande', 'Kriya', 'Karang Taruna Gerak Makmur',
     'Suvenir dan aksesori dari kerang pantai Lande: gantungan kunci, bingkai foto, sampai hiasan dinding pesanan.',
     '/images/wisata-mangrove.jpg', 'Balai Karang Taruna, pusat desa',
     'https://www.google.com/maps?q=-5.6698,122.7102', '6281200000011',
     'https://instagram.com/keranglande', 'https://tiktok.com/@keranglande',
     ARRAY['Gantungan kunci', 'Bingkai foto', 'Hiasan dinding'], 'Rp10.000-Rp150.000', 1),
    ('Keripik Rumput Laut Wa Ode', 'Kuliner', 'Wa Ode Sitti',
     'Keripik dan dodol rumput laut dari panen budidaya perairan Karamba - camilan renyah oleh-oleh khas pesisir.',
     '/images/wisata-diving.jpg', 'Dusun Bahari, jalur menuju Karamba',
     'https://www.google.com/maps?q=-5.6725,122.7071', '6281200000012',
     'https://instagram.com/keripikwaode', 'https://tiktok.com/@keripikwaode',
     ARRAY['Keripik original', 'Keripik balado', 'Dodol rumput laut'], 'Rp10.000-Rp35.000', 2),
    ('Tenun Buton Karya Ina', 'Fashion', 'Ina Mariati',
     'Kain tenun motif khas Buton ditenun manual dengan alat tradisional; tersedia sarung, selendang, dan kain meteran.',
     '/images/hero-bg.jpg', 'RT 02, samping masjid desa',
     'https://www.google.com/maps?q=-5.6689,122.7115', '6281200000013',
     'https://instagram.com/tenunkaryaina', 'https://tiktok.com/@tenunkaryaina',
     ARRAY['Sarung tenun', 'Selendang', 'Kain meteran'], 'Rp150.000-Rp750.000', 3),
    ('Mete Gurih Lande', 'Kuliner', 'Kelompok Tani Mete Makmur',
     'Kacang mete goreng dan mete mentah dari kebun jambu mete warga - gurih, dipanggang tanpa pengawet.',
     '/images/wisata-pantai.jpg', 'Dusun Wakoko, kebun mete warga',
     'https://www.google.com/maps?q=-5.6740,122.7058', '6281200000014',
     'https://instagram.com/metegurihlande', 'https://tiktok.com/@metegurihlande',
     ARRAY['Mete goreng 250 g', 'Mete mentah 1 kg', 'Mete madu'], 'Rp35.000-Rp120.000', 4),
    ('Ikan Asap Pak La Ode', 'Kuliner', 'La Ode Rahmat',
     'Cakalang dan tongkol asap langsung dari tangkapan harian, diasap kayu bakau - tahan dibawa perjalanan jauh.',
     '/images/wisata-mangrove.jpg', 'Tepi dermaga lama, Dusun Lande',
     'https://www.google.com/maps?q=-5.6705,122.7094', '6281200000015',
     'https://instagram.com/ikanasaplaode', 'https://tiktok.com/@ikanasaplaode',
     ARRAY['Cakalang asap', 'Tongkol asap', 'Sambal ikan asap'], 'Rp20.000-Rp80.000', 5),
    ('Anyaman Pandan PKK', 'Kriya', 'PKK Desa Gerak Makmur',
     'Tikar, tas, dan topi anyaman daun pandan buatan ibu-ibu PKK; motif bisa dipesan untuk suvenir acara.',
     '/images/wisata-diving.jpg', 'Balai desa (sekretariat PKK)',
     'https://www.google.com/maps?q=-5.6693,122.7108', '6281200000016',
     'https://instagram.com/anyamanpandanpkk', 'https://tiktok.com/@anyamanpandanpkk',
     ARRAY['Tikar pandan', 'Tas anyaman', 'Topi pantai'], 'Rp15.000-Rp200.000', 6),
    ('Warung Dermaga', 'Kuliner', 'Keluarga Bapak Samsul',
     'Warung kopi dan kudapan di bibir dermaga Karamba - kopi hitam, pisang goreng, dan es kelapa muda sambil menikmati laut.',
     '/images/hero-bg.jpg', 'Kawasan wisata Karamba',
     'https://www.google.com/maps?q=-5.6731,122.7080', '6281200000017',
     'https://instagram.com/warungdermaga', 'https://tiktok.com/@warungdermaga',
     ARRAY['Kopi hitam', 'Pisang goreng', 'Es kelapa muda'], 'Rp5.000-Rp25.000', 7)
) AS d(nama, kategori, pemilik, deskripsi, foto, lokasi, maps, wa, ig, tt, produk, harga, urutan)
WHERE v.slug = 'gerakmakmur'
  AND NOT EXISTS (
    SELECT 1 FROM public.umkm u WHERE u.nama = d.nama AND u.village_id = v.id
  );

-- Verifikasi:
-- SELECT v.slug, a.category, count(*) FROM public.articles a
--   JOIN public.villages v ON v.id = a.village_id GROUP BY v.slug, a.category;
-- SELECT count(*) AS umkm_gerakmakmur FROM public.umkm;

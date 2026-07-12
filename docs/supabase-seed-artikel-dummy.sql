-- Seed artikel DUMMY untuk preview halaman /informasi (Desa Gerak Makmur).
-- Jalankan di Supabase Dashboard -> SQL Editor.
-- Aman dijalankan berulang (skip bila slug sudah ada).
-- 4 berita + 1 profil UMKM; cover memakai gambar statis dari /public/images.
-- HAPUS sebelum rilis: DELETE FROM public.articles WHERE slug LIKE 'dummy-%';

INSERT INTO public.articles
  (village_id, title, slug, excerpt, content, cover_image_url, category, is_published, published_at)
SELECT v.id, d.title, d.slug, d.excerpt, d.content, d.cover, d.category, true, d.published_at::timestamptz
FROM public.villages v
CROSS JOIN (
  VALUES
    (
      'Gotong Royong Pembersihan Pantai Lande Sambut Musim Kunjungan',
      'dummy-gotong-royong-pembersihan-pantai-lande',
      'Puluhan warga bersama mahasiswa KKN membersihkan garis pantai Lande sebagai persiapan musim kunjungan wisata.',
      E'Puluhan warga Desa Gerak Makmur bergotong royong membersihkan garis pantai Lande pada akhir pekan lalu. Kegiatan ini melibatkan karang taruna, ibu-ibu PKK, serta mahasiswa KKN yang tengah bertugas di desa.\n\nSampah plastik yang terkumpul dipilah untuk didaur ulang, sementara sampah organik diolah menjadi kompos untuk kebun warga. Kepala desa menyampaikan bahwa kebersihan pantai adalah wajah desa di mata pengunjung.\n\nKegiatan serupa direncanakan rutin setiap bulan agar kawasan wisata Karamba dan sekitarnya tetap asri dan nyaman dikunjungi.',
      '/images/wisata-pantai.jpg',
      'berita',
      '2026-07-10 08:00:00+08'
    ),
    (
      'Panen Perdana Rumput Laut Kelompok Tani Bahari',
      'dummy-panen-perdana-rumput-laut',
      'Kelompok Tani Bahari memanen rumput laut perdana dengan hasil melampaui perkiraan awal musim tanam.',
      E'Kelompok Tani Bahari Desa Gerak Makmur merayakan panen perdana rumput laut hasil budidaya di perairan sekitar Karamba. Hasil panen melampaui perkiraan awal dan langsung diserap pengepul lokal.\n\nBudidaya rumput laut menjadi salah satu mata pencaharian alternatif warga pesisir di samping menangkap ikan. Pendampingan teknis dilakukan bersama penyuluh perikanan kecamatan.\n\nSebagian hasil panen akan diolah ibu-ibu PKK menjadi produk turunan seperti keripik dan dodol rumput laut untuk dijajakan di area wisata.',
      '/images/wisata-mangrove.jpg',
      'berita',
      '2026-07-07 09:30:00+08'
    ),
    (
      'Pelatihan Digitalisasi UMKM: Warga Belajar Jualan Daring',
      'dummy-pelatihan-digitalisasi-umkm',
      'Pelaku UMKM desa mengikuti pelatihan pemasaran daring, dari foto produk sampai menerima pesanan lewat WhatsApp.',
      E'Belasan pelaku UMKM Desa Gerak Makmur mengikuti pelatihan digitalisasi usaha yang digelar di balai desa. Materi mencakup cara memotret produk dengan ponsel, menulis deskripsi jualan, hingga melayani pesanan lewat WhatsApp Business.\n\nPelatihan ini merupakan bagian dari program kerja mahasiswa KKN bersama pemerintah desa untuk mengangkat produk lokal ke pasar yang lebih luas.\n\nPeserta yang produknya sudah siap akan ditampilkan di halaman UMKM situs resmi desa sehingga mudah ditemukan pembeli dari luar daerah.',
      '/images/hero-bg.jpg',
      'berita',
      '2026-07-04 14:00:00+08'
    ),
    (
      'Perbaikan Dermaga Karamba Rampung Lebih Cepat',
      'dummy-perbaikan-dermaga-karamba',
      'Perbaikan papan lantai dan pengecatan ulang dermaga Karamba selesai lebih cepat berkat swadaya warga.',
      E'Perbaikan dermaga kawasan wisata Karamba rampung lebih cepat dari jadwal berkat gotong royong warga. Papan lantai yang lapuk diganti kayu ulin, sementara pegangan tangan dicat ulang dengan warna khas desa.\n\nDermaga merupakan titik utama aktivitas wisata: tempat sandar perahu, spot memancing, sekaligus latar favorit pengunjung untuk berfoto.\n\nPemerintah desa mengalokasikan dana pemeliharaan rutin agar fasilitas wisata tetap aman, terutama menjelang musim ramai kunjungan di akhir tahun.',
      '/images/wisata-diving.jpg',
      'berita',
      '2026-07-01 10:00:00+08'
    ),
    (
      'Abon Ikan Bahari — Olahan Laut Khas Gerak Makmur',
      'dummy-umkm-abon-ikan-bahari',
      'Abon ikan tuna asap produksi warga pesisir, gurih dan tahan lama — oleh-oleh andalan dari Gerak Makmur.',
      E'Abon Ikan Bahari adalah usaha rumahan warga pesisir Gerak Makmur yang mengolah tangkapan tuna segar menjadi abon gurih tahan lama. Proses pengasapan tradisional memberi aroma khas yang membedakannya dari abon pabrikan.\n\nProduksi dilakukan berkelompok oleh ibu-ibu nelayan sehingga hasil laut suami tidak lagi dijual murah saat melimpah, melainkan diolah bernilai tambah.\n\nAbon dikemas dalam ukuran 100 dan 250 gram, cocok sebagai oleh-oleh. Pemesanan dapat dilakukan langsung di rumah produksi atau melalui WhatsApp.',
      '/images/wisata-pantai.jpg',
      'umkm',
      '2026-07-08 11:00:00+08'
    )
) AS d(title, slug, excerpt, content, cover, category, published_at)
WHERE v.slug = 'gerakmakmur'
  AND NOT EXISTS (SELECT 1 FROM public.articles a WHERE a.slug = d.slug);

-- Verifikasi hasil:
-- SELECT title, slug, category, is_published, published_at
-- FROM public.articles ORDER BY published_at DESC;

import type { Article } from "@/types/article";

/**
 * SEED Berita — placeholder tampil selama tabel Supabase `articles` masih
 * kosong / tak terjangkau (pola fallback yang sama dgn `lib/konten.ts`).
 * Otomatis tergantikan begitu admin menerbitkan berita asli dari
 * `/admin/berita`. Konten sama dengan `docs/supabase-seed-artikel-dummy.sql`.
 */
export const ARTIKEL_SEED: Article[] = [
  {
    id: "seed-1",
    title: "Gotong Royong Pembersihan Pantai Lande Sambut Musim Kunjungan",
    slug: "dummy-gotong-royong-pembersihan-pantai-lande",
    excerpt:
      "Puluhan warga bersama mahasiswa KKN membersihkan garis pantai Lande sebagai persiapan musim kunjungan wisata.",
    content:
      "Puluhan warga Desa Gerak Makmur bergotong royong membersihkan garis pantai Lande pada akhir pekan lalu. Kegiatan ini melibatkan karang taruna, ibu-ibu PKK, serta mahasiswa KKN yang tengah bertugas di desa.\n\nSampah plastik yang terkumpul dipilah untuk didaur ulang, sementara sampah organik diolah menjadi kompos untuk kebun warga. Kepala desa menyampaikan bahwa kebersihan pantai adalah wajah desa di mata pengunjung.\n\nKegiatan serupa direncanakan rutin setiap bulan agar kawasan wisata Karamba dan sekitarnya tetap asri dan nyaman dikunjungi.",
    coverImageUrl: "/images/wisata-pantai.jpg",
    category: "berita",
    publishedAt: "2026-07-10T08:00:00+08:00",
  },
  {
    id: "seed-2",
    title: "Panen Perdana Rumput Laut Kelompok Tani Bahari",
    slug: "dummy-panen-perdana-rumput-laut",
    excerpt:
      "Kelompok Tani Bahari memanen rumput laut perdana dengan hasil melampaui perkiraan awal musim tanam.",
    content:
      "Kelompok Tani Bahari Desa Gerak Makmur merayakan panen perdana rumput laut hasil budidaya di perairan sekitar Karamba. Hasil panen melampaui perkiraan awal dan langsung diserap pengepul lokal.\n\nBudidaya rumput laut menjadi salah satu mata pencaharian alternatif warga pesisir di samping menangkap ikan. Pendampingan teknis dilakukan bersama penyuluh perikanan kecamatan.\n\nSebagian hasil panen akan diolah ibu-ibu PKK menjadi produk turunan seperti keripik dan dodol rumput laut untuk dijajakan di area wisata.",
    coverImageUrl: "/images/wisata-mangrove.jpg",
    category: "berita",
    publishedAt: "2026-07-07T09:30:00+08:00",
  },
  {
    id: "seed-3",
    title: "Pelatihan Digitalisasi UMKM: Warga Belajar Jualan Daring",
    slug: "dummy-pelatihan-digitalisasi-umkm",
    excerpt:
      "Pelaku UMKM desa mengikuti pelatihan pemasaran daring, dari foto produk sampai menerima pesanan lewat WhatsApp.",
    content:
      "Belasan pelaku UMKM Desa Gerak Makmur mengikuti pelatihan digitalisasi usaha yang digelar di balai desa. Materi mencakup cara memotret produk dengan ponsel, menulis deskripsi jualan, hingga melayani pesanan lewat WhatsApp Business.\n\nPelatihan ini merupakan bagian dari program kerja mahasiswa KKN bersama pemerintah desa untuk mengangkat produk lokal ke pasar yang lebih luas.\n\nPeserta yang produknya sudah siap akan ditampilkan di halaman UMKM situs resmi desa sehingga mudah ditemukan pembeli dari luar daerah.",
    coverImageUrl: "/images/hero-bg.jpg",
    category: "berita",
    publishedAt: "2026-07-04T14:00:00+08:00",
  },
  {
    id: "seed-4",
    title: "Perbaikan Dermaga Karamba Rampung Lebih Cepat",
    slug: "dummy-perbaikan-dermaga-karamba",
    excerpt:
      "Perbaikan papan lantai dan pengecatan ulang dermaga Karamba selesai lebih cepat berkat swadaya warga.",
    content:
      "Perbaikan dermaga kawasan wisata Karamba rampung lebih cepat dari jadwal berkat gotong royong warga. Papan lantai yang lapuk diganti kayu ulin, sementara pegangan tangan dicat ulang dengan warna khas desa.\n\nDermaga merupakan titik utama aktivitas wisata: tempat sandar perahu, spot memancing, sekaligus latar favorit pengunjung untuk berfoto.\n\nPemerintah desa mengalokasikan dana pemeliharaan rutin agar fasilitas wisata tetap aman, terutama menjelang musim ramai kunjungan di akhir tahun.",
    coverImageUrl: "/images/wisata-diving.jpg",
    category: "berita",
    publishedAt: "2026-07-01T10:00:00+08:00",
  },
  {
    id: "seed-5",
    title: "Festival Kuliner Pesisir Meriahkan Akhir Pekan di Karamba",
    slug: "dummy-festival-kuliner-pesisir",
    excerpt:
      "Aneka olahan hasil laut warga dijajakan di festival kuliner pertama yang digelar di kawasan wisata Karamba.",
    content:
      "Kawasan wisata Karamba dipadati pengunjung saat festival kuliner pesisir pertama digelar akhir pekan lalu. Belasan lapak warga menjajakan olahan hasil laut, dari ikan bakar bumbu khas hingga abon dan keripik rumput laut.\n\nFestival ini menjadi ajang uji pasar bagi produk UMKM desa sekaligus hiburan bagi warga dan wisatawan yang datang.\n\nMelihat antusiasme pengunjung, pemerintah desa berencana menjadikan festival kuliner sebagai agenda rutin setiap musim liburan.",
    coverImageUrl: "/images/wisata-pantai.jpg",
    category: "berita",
    publishedAt: "2026-06-27T16:00:00+08:00",
  },
];

import type { Article } from "@/types/article";

/**
 * SEED Berita, placeholder tampil selama tabel Supabase `articles` masih
 * kosong / tak terjangkau (pola fallback yang sama dgn `lib/konten.ts`).
 * Otomatis tergantikan begitu admin menerbitkan berita asli dari
 * `/admin/berita`. Konten sama dengan `docs/supabase-seed-berita-umkm.sql`.
 */
export const ARTIKEL_SEED: Article[] = [
  {
    id: "seed-1",
    title: "Gotong Royong Pembersihan Pantai Gaya Baru Sambut Musim Kunjungan",
    slug: "dummy-gotong-royong-pantai-gaya-baru",
    excerpt:
      "Puluhan warga bersama mahasiswa KKN membersihkan garis Pantai Gaya Baru sebagai persiapan musim kunjungan wisata.",
    content:
      "Puluhan warga Desa Gaya Baru bergotong royong membersihkan garis pantai pada akhir pekan lalu. Kegiatan ini melibatkan karang taruna, ibu-ibu PKK, serta mahasiswa KKN yang tengah bertugas di desa.\n\nSampah plastik yang terkumpul dipilah untuk didaur ulang, sementara sampah organik diolah menjadi kompos untuk kebun warga. Kepala desa menyampaikan bahwa kebersihan pantai adalah wajah desa di mata pengunjung.\n\nKegiatan serupa direncanakan rutin setiap bulan agar kawasan wisata pantai dan sekitarnya tetap asri dan nyaman dikunjungi.",
    coverImageUrl: "/images/wisata-pantai.jpg",
    category: "berita",
    publishedAt: "2026-07-10T08:00:00+08:00",
  },
  {
    id: "seed-2",
    title: "Panen Perdana Rumput Laut Kelompok Tani Bahari",
    slug: "dummy-panen-rumput-laut-gaya-baru",
    excerpt:
      "Kelompok Tani Bahari memanen rumput laut perdana dengan hasil melampaui perkiraan awal musim tanam.",
    content:
      "Kelompok Tani Bahari Desa Gaya Baru merayakan panen perdana rumput laut hasil budidaya di perairan desa. Hasil panen melampaui perkiraan awal dan langsung diserap pengepul lokal.\n\nBudidaya rumput laut menjadi salah satu mata pencaharian alternatif warga pesisir di samping menangkap ikan. Pendampingan teknis dilakukan bersama penyuluh perikanan kecamatan.\n\nSebagian hasil panen akan diolah ibu-ibu PKK menjadi produk turunan seperti keripik dan dodol rumput laut untuk dijajakan kepada pengunjung.",
    coverImageUrl: "/images/wisata-mangrove.jpg",
    category: "berita",
    publishedAt: "2026-07-07T09:30:00+08:00",
  },
  {
    id: "seed-3",
    title: "Pelatihan Promosi Wisata Digital bagi Pemuda Desa",
    slug: "dummy-pelatihan-promosi-wisata-digital",
    excerpt:
      "Pemuda desa belajar mempromosikan wisata lewat media sosial, dari memotret spot foto hingga menulis konten.",
    content:
      "Belasan pemuda Desa Gaya Baru mengikuti pelatihan promosi wisata digital yang digelar di balai desa. Materi mencakup cara memotret spot wisata dengan ponsel, menulis konten media sosial, hingga membalas pertanyaan calon pengunjung.\n\nPelatihan ini merupakan bagian dari program kerja mahasiswa KKN bersama pemerintah desa untuk memperkenalkan potensi wisata desa ke luar daerah.\n\nKonten karya peserta akan ditampilkan di akun media sosial resmi desa dan situs web desa.",
    coverImageUrl: "/images/hero-bg.jpg",
    category: "berita",
    publishedAt: "2026-07-04T14:00:00+08:00",
  },
  {
    id: "seed-4",
    title: "Perbaikan Dermaga Nelayan Rampung Lebih Cepat",
    slug: "dummy-perbaikan-dermaga-nelayan",
    excerpt:
      "Perbaikan papan lantai dan pengecatan ulang dermaga nelayan selesai lebih cepat berkat swadaya warga.",
    content:
      "Perbaikan dermaga nelayan Desa Gaya Baru rampung lebih cepat dari jadwal berkat gotong royong warga. Papan lantai yang lapuk diganti kayu ulin, sementara pegangan tangan dicat ulang dengan warna khas desa.\n\nDermaga merupakan titik utama aktivitas warga: tempat sandar perahu, bongkar muat hasil laut, sekaligus latar favorit pengunjung untuk berfoto.\n\nPemerintah desa mengalokasikan dana pemeliharaan rutin agar fasilitas tetap aman, terutama menjelang musim ramai kunjungan di akhir tahun.",
    coverImageUrl: "/images/wisata-diving.jpg",
    category: "berita",
    publishedAt: "2026-07-01T10:00:00+08:00",
  },
  {
    id: "seed-5",
    title: "Festival Kuliner Pesisir Meriahkan Akhir Pekan di Pantai Gaya Baru",
    slug: "dummy-festival-kuliner-pesisir-gaya-baru",
    excerpt:
      "Aneka olahan hasil laut warga dijajakan di festival kuliner pertama yang digelar di Pantai Gaya Baru.",
    content:
      "Pantai Gaya Baru dipadati pengunjung saat festival kuliner pesisir pertama digelar akhir pekan lalu. Belasan lapak warga menjajakan olahan hasil laut, dari ikan bakar bumbu khas hingga abon dan keripik rumput laut.\n\nFestival ini menjadi ajang uji pasar bagi produk warga sekaligus hiburan bagi masyarakat dan wisatawan yang datang.\n\nMelihat antusiasme pengunjung, pemerintah desa berencana menjadikan festival kuliner sebagai agenda rutin setiap musim liburan.",
    coverImageUrl: "/images/wisata-pantai.jpg",
    category: "berita",
    publishedAt: "2026-06-27T16:00:00+08:00",
  },
];

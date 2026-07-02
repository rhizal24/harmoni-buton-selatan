import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <span className="not-found-code">404</span>
      <h1 className="not-found-title">Halaman Tidak Ditemukan</h1>
      <p className="not-found-desc">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link href="/" id="back-to-home" className="btn btn-primary">
        Kembali ke Beranda
      </Link>
    </main>
  );
}

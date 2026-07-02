import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Selamat datang di website resmi Desa Gerak Makmur, Buton Selatan.",
};

/**
 * Homepage — Server Component (default di Next.js 16 App Router)
 * Data fetching dilakukan langsung di sini tanpa useEffect
 */
export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section
        id="hero"
        aria-label="Selamat datang di Desa Gerak Makmur"
        className="hero-section"
      >
        <h1 className="hero-title">
          Selamat Datang di{" "}
          <span className="hero-accent">Desa Gerak Makmur</span>
        </h1>
        <p className="hero-subtitle">
          Buton Selatan, Sulawesi Tenggara — Bergerak bersama menuju kemakmuran
          dan kesejahteraan masyarakat.
        </p>
        <div className="hero-cta">
          <Link href="/tentang" id="cta-tentang" className="btn btn-primary">
            Tentang Desa
          </Link>
          <Link href="/layanan" id="cta-layanan" className="btn btn-outline">
            Layanan Desa
          </Link>
        </div>
      </section>

      {/* Berita — akan diisi setelah API siap */}
      <section id="berita-terkini" aria-label="Berita Terkini" className="section-white">
        <div className="container">
          <h2 className="section-title">Berita Terkini</h2>
          <p className="section-desc">Konten berita akan ditampilkan di sini.</p>
        </div>
      </section>

      {/* Layanan */}
      <section id="layanan-desa" aria-label="Layanan Desa" className="section-muted">
        <div className="container">
          <h2 className="section-title">Layanan Desa</h2>
          <p className="section-desc">Informasi layanan pemerintahan desa.</p>
        </div>
      </section>
    </main>
  );
}

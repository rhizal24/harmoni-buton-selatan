"use client";

import Link from "next/link";

/**
 * Error Boundary — harus Client Component karena menggunakan useEffect & event
 * Menangkap runtime error di semua route
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="not-found-page">
      <span className="not-found-code">500</span>
      <h1 className="not-found-title">Terjadi Kesalahan</h1>
      <p className="not-found-desc">
        {error.message || "Maaf, terjadi kesalahan. Silakan coba lagi."}
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          id="retry-btn"
          onClick={reset}
          className="btn btn-primary"
        >
          Coba Lagi
        </button>
        <Link href="/" id="go-home-btn" className="btn btn-outline">
          Ke Beranda
        </Link>
      </div>
    </main>
  );
}

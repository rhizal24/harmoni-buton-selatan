"use client";

import { ArtikelManager } from "../artikel-manager";

export default function AdminBeritaPage() {
  return (
    <ArtikelManager
      category="berita"
      judul="Berita"
      deskripsi="Artikel berita & kegiatan desa. Draf tidak tampil di situs."
    />
  );
}

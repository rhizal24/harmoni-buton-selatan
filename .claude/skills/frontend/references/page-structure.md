# Struktur Halaman — Website Desa Gerak Makmur

Dokumen ini mendefinisikan struktur HTML/komponen per halaman.
Jadikan referensi sebelum membuat atau merevisi halaman apapun.

---

## Halaman: Beranda (`/`)

```
<utility-bar />                          <!-- strip gelap 36px, paling atas -->
<navbar />                               <!-- sticky, 72px, di bawah utility-bar -->

<main>
  <!-- HERO BERANDA — split 2 kolom desktop, stack mobile -->
  <section class="hero-beranda">
    <div class="container">
      <div class="hero-grid">
        <!-- Kolom Kiri: teks & CTA -->
        <div class="hero-text">
          <h1 class="text-display">Wisata Unggulan</h1>
          <p class="text-body-md">...</p>
          <a href="/karamba" class="btn btn-primary">Lihat Detail</a>
        </div>
        <!-- Kolom Kanan: foto + list fasilitas Karamba -->
        <div class="hero-visual">
          <img class="hero-image card-frame" src="..." alt="Karamba" />
          <!-- List fasilitas DALAM Karamba, bukan wisata lain -->
          <ul class="fasilitas-list">
            <li class="active text-title-lg">Karamba Resto</li>
            <li class="text-body-md">Dermaga Karamba</li>
            <li class="text-body-md">Spot Foto Karamba</li>
            <li class="text-body-md">Area Susur Laut</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- JELAJAH DESA — 3 card paket wisata -->
  <section class="section-jelajah-desa">
    <div class="container">
      <div class="section-header">
        <hr class="section-divider" />
        <div class="section-intro-inline">
          <p class="section-intro-text text-body-md">Temukan pengalaman terbaik di Karamba...</p>
          <h2 class="section-title-inline">— Jelajah Desa</h2>
        </div>
      </div>
      <div class="card-grid-3">
        <!-- card-paket default -->
        <article class="card card-frame card-paket">...</article>
        <!-- card-paket featured (tosca solid) -->
        <article class="card card-paket card-paket-featured">
          <span class="badge badge-secondary">Paling Diminati</span>
          ...
        </article>
        <!-- card-paket default -->
        <article class="card card-frame card-paket">...</article>
      </div>
    </div>
  </section>

  <!-- LENSA LANDE — bento gallery + pagination -->
  <section class="section-lensa-lande">
    <div class="container">
      <div class="section-header">
        <hr class="section-divider" />
        <div class="section-title-centered">
          <h2>Lensa Lande</h2>
          <p>Lensa Lande menghadirkan potret alam, budaya, dan kehidupan Desa Gerak Makmur...</p>
        </div>
      </div>
      <div class="bento-gallery">
        <!-- tile bervariasi: 1x1, 2x1, 2x2 -->
      </div>
      <nav class="pagination" aria-label="Galeri foto">
        <button class="pagination-arrow">←</button>
        <button class="pagination-item active">1</button>
        <button class="pagination-item">2</button>
        <span class="pagination-ellipsis">…</span>
        <button class="pagination-item">8</button>
        <button class="pagination-arrow">→</button>
      </nav>
    </div>
  </section>

  <!-- MITRA KOLABORASI -->
  <section class="section-mitra">
    <div class="container">
      <div class="section-header">
        <hr class="section-divider" />
        <div class="section-title-centered">
          <h2>Mitra Kolaborasi</h2>
          <p>Berkolaborasi dengan berbagai mitra untuk mendukung pengembangan pariwisata...</p>
        </div>
      </div>
      <div class="mitra-logo-strip">
        <!-- logo grayscale default, warna saat hover -->
      </div>
    </div>
  </section>
</main>

<footer />
```

---

## Halaman: Karamba (`/karamba`)

```
<utility-bar />
<navbar />

<main>
  <!-- HERO KARAMBA — full-bleed 95vh -->
  <section class="hero-karamba" style="min-height: 95vh;">
    <span class="badge badge-secondary">Wisata Unggulan Desa Gerak Makmur</span>
    <h1 class="text-display">Karamba</h1>
  </section>

  <!-- CERITA KARAMBA — narasi -->
  <section class="section-cerita">
    <div class="container container-reading">
      <!-- max-width 720px, body-lg -->
    </div>
  </section>

  <!-- PAKET WISATA — 2 default + 1 featured -->
  <section class="section-paket">
    <div class="container">
      <div class="card-grid-3">
        <article class="card card-frame card-paket">...</article>
        <article class="card card-paket card-paket-featured">
          <span class="badge badge-secondary">Paling Diminati</span>
          ...
        </article>
        <article class="card card-frame card-paket">...</article>
      </div>
    </div>
  </section>

  <!-- GALERI KARAMBA — bento -->
  <section class="section-gallery-karamba">
    <div class="container">
      <div class="bento-gallery">...</div>
    </div>
  </section>

  <!-- LOKASI -->
  <section class="section-lokasi">
    <div class="container">
      <!-- embed peta -->
    </div>
  </section>
</main>

<footer />
```

---

## Halaman: Profil (`/profil`)

```
<utility-bar />
<navbar />

<main>
  <section class="section-sejarah">
    <div class="container container-reading">
      <h1 class="text-display">Profil Desa</h1>
      <!-- narasi sejarah -->
    </div>
  </section>

  <section class="section-visi-misi">
    <div class="container">...</div>
  </section>

  <!-- Statistik desa -->
  <section class="section-stat">
    <div class="container">
      <div class="stat-grid">
        <div class="card-profil-stat">
          <span class="text-stat-number">1.200</span>
          <span class="text-label-sm">Penduduk</span>
        </div>
        <!-- dst -->
      </div>
    </div>
  </section>

  <!-- Perangkat desa -->
  <section class="section-pejabat">
    <div class="container">
      <div class="card-grid-4">
        <div class="card card-profil-pejabat">
          <img style="aspect-ratio: 1/1" ... />
          <h3 class="text-title-lg">Nama Pejabat</h3>
          <p class="text-label-sm" style="color: var(--color-on-surface-variant)">Jabatan</p>
        </div>
      </div>
    </div>
  </section>
</main>

<footer />
```

---

## Halaman: Peta Infografis (`/peta-infografis`)

```
<utility-bar />
<navbar />

<main>
  <section class="section-peta-infografis">
    <div class="container">
      <div class="peta-layout">
        <!-- Desktop: 60% kiri / 40% kanan | Mobile: stack -->
        <div class="peta-map-container">
          <!-- border: var(--border-frame); rounded: var(--rounded-xl); min-height: 480px -->
        </div>
        <aside class="peta-sidebar">
          <div class="card card-stat-infografis">...</div>
          <!-- POI list -->
        </aside>
      </div>
    </div>
  </section>
</main>

<footer />
```

---

## Halaman: Berita (`/berita`)

```
<utility-bar />
<navbar />

<main>
  <div class="container">
    <!-- Filter kategori -->
    <div class="filter-bar">...</div>

    <div class="card-grid-3">
      <article class="card card-berita">
        <img style="aspect-ratio: 16/9" ... />
        <div class="card-body">
          <time class="text-label-sm" style="color: var(--color-on-surface-variant)">01 Jul 2026</time>
          <h2 class="text-title-lg">Judul Berita</h2>
        </div>
      </article>
    </div>

    <nav class="pagination">...</nav>
  </div>
</main>

<footer />
```

---

## Halaman: Galeri (`/galeri`)

```
<utility-bar />
<navbar />

<main>
  <div class="container">
    <div class="bento-gallery">
      <!-- tile bervariasi 1x1, 2x1, 2x2 -->
      <!-- hover: overlay rgba(46,46,46,0.4) + ikon zoom putih -->
    </div>
    <nav class="pagination">...</nav>
  </div>
</main>

<footer />
```

---

## Halaman: UMKM (`/umkm`)

```
<utility-bar />
<navbar />

<main>
  <div class="container">
    <div class="filter-bar">...</div>
    <div class="card-grid-4">
      <article class="card card-umkm">
        <img style="aspect-ratio: 1/1" ... />
        <div class="card-body">
          <h2 class="text-title-lg">Nama UMKM</h2>
        </div>
      </article>
    </div>
  </div>
</main>

<footer />
```

---

## Halaman: Admin Dashboard (`/admin`)

```
<div class="admin-layout">
  <aside class="admin-sidebar">
    <!-- navigasi admin, tosca dominant -->
    <!-- TIDAK menggunakan coral sama sekali -->
  </aside>
  <main class="admin-content">
    <!-- table-konten, form-input, button-primary, badge status -->
    <!-- density padat: spacing sm/md, rounded default/md -->
  </main>
</div>
```

---

## Catatan Penting

- **Utility bar** selalu ada di ATAS navbar, tidak di-sticky-kan bersama navbar — cukup scroll normal.
- **Navbar** sticky. Ketika di-scroll, pastikan utility-bar tidak ikut sticky (position normal/static).
- **Section rhythm**: jarak antar section di desktop adalah `--section-rhythm-lg` (120px), tablet `--section-rhythm-md` (80px), mobile `--section-rhythm-sm` (48px).
- **Fade-up**: setiap `<article class="card">` dan elemen visual besar perlu class `fade-up`, diaktifkan via `IntersectionObserver` yang menambahkan class `is-visible`.

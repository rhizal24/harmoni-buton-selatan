# Component Patterns — Website Desa Gerak Makmur

Referensi cepat pola HTML + CSS untuk komponen yang sering diulang.

---

## Utility Bar

```html
<div class="utility-bar" role="complementary" aria-label="Informasi kontak">
  <div class="container utility-bar__inner">
    <div class="utility-bar__contacts">
      <a href="tel:+62xxx" class="utility-bar__link">
        <svg><!-- ikon telepon --></svg>
        +62 xxx-xxxx-xxxx
      </a>
      <a href="https://wa.me/62xxx" class="utility-bar__link">
        <svg><!-- ikon WA --></svg>
        WhatsApp
      </a>
    </div>
    <div class="utility-bar__socials">
      <a href="#" aria-label="Instagram"><!-- ikon --></a>
      <a href="#" aria-label="Facebook"><!-- ikon --></a>
    </div>
  </div>
</div>
```

```css
.utility-bar {
  height: 36px;
  background-color: var(--color-inverse-surface);
  color: var(--color-inverse-on-surface);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
}
.utility-bar__inner {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-md);
}
.utility-bar__link {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.85;
  transition: opacity 150ms;
}
.utility-bar__link:hover { opacity: 1; }
```

---

## Navbar

```html
<header class="navbar">
  <div class="container navbar__inner">
    <a href="/" class="navbar__logo">
      <!-- Logo SVG atau teks -->
      Harmoni Buton Selatan
    </a>
    <nav class="navbar__menu" aria-label="Menu utama">
      <a href="/" class="navbar__item">Beranda</a>
      <a href="/profil" class="navbar__item">Profil</a>
      <a href="/karamba" class="navbar__item navbar__item--karamba">Karamba</a>
      <a href="/peta-infografis" class="navbar__item">Peta Infografis</a>
      <a href="/berita" class="navbar__item">Berita</a>
      <a href="/galeri" class="navbar__item">Galeri</a>
      <a href="/umkm" class="navbar__item">UMKM</a>
    </nav>
    <div class="navbar__actions">
      <button class="navbar__search" aria-label="Cari"><!-- ikon search --></button>
      <button class="language-switcher" aria-label="Ganti bahasa">ID</button>
    </div>
  </div>
</header>
```

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 72px;
  background-color: var(--color-surface-bright);
  box-shadow: var(--elevation-nav);
  display: flex;
  align-items: center;
}
.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}
.navbar__menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  list-style: none;
}
.navbar__item {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: var(--rounded-default);
  transition: color 150ms;
}
.navbar__item:hover { color: var(--color-primary); }

/* Karamba — coral pill, bukan rounded-md */
.navbar__item--karamba {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
  border-radius: var(--rounded-full);
  padding: var(--spacing-xs) var(--spacing-md);
}
@media (prefers-reduced-motion: no-preference) {
  .navbar__item--karamba:hover {
    background-color: var(--color-secondary-hover);
    color: var(--color-on-secondary);
    transform: scale(1.03);
  }
}

.language-switcher {
  background-color: var(--color-surface-container-low);
  border: none;
  border-radius: var(--rounded-full);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-on-surface);
}
```

---

## Card Paket Wisata — Default

```html
<article class="card card-frame card-paket fade-up">
  <div class="card-paket__header">
    <h3 class="text-title-lg">Paket Keluarga</h3>
    <p class="text-label-sm card-paket__desc">Nikmati keindahan Karamba bersama keluarga</p>
    <p class="text-headline-md card-paket__price">Rp 150.000<span>/orang</span></p>
  </div>
  <ul class="card-paket__benefits">
    <li>
      <svg class="icon-check"><!-- tosca --></svg>
      <span class="text-label-md">Akses dermaga</span>
    </li>
    <!-- dst -->
  </ul>
  <a href="https://wa.me/62xxx?text=..." class="btn btn-outline w-full">
    Pesan Sekarang via WhatsApp
  </a>
</article>
```

```css
.card-paket {
  padding: var(--spacing-md);
  border-radius: var(--rounded-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.card-paket__price {
  color: var(--color-primary);   /* tosca — BUKAN coral */
}
.card-paket__price span {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-on-surface-variant);
}
.card-paket__benefits {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-paket__benefits svg { color: var(--color-primary); flex-shrink: 0; }
.card-paket__desc { color: var(--color-on-surface-variant); }
```

---

## Card Paket Wisata — Featured (tosca solid)

```html
<article class="card card-paket card-paket-featured fade-up" style="position: relative;">
  <span class="badge badge-secondary card-paket-featured__badge">Paling Diminati</span>
  <div class="card-paket__header">
    <h3 class="text-title-lg" style="color: var(--color-on-primary)">Paket Premium</h3>
    <p class="text-label-sm" style="color: var(--color-primary-container)">Pengalaman terlengkap di Karamba</p>
    <p class="text-headline-md" style="color: var(--color-on-primary)">Rp 300.000<span style="color: var(--color-primary-container)">/orang</span></p>
  </div>
  <ul class="card-paket__benefits">
    <li>
      <svg style="color: var(--color-on-primary)"><!-- ikon --></svg>
      <span class="text-label-md" style="color: var(--color-primary-container)">Semua akses</span>
    </li>
  </ul>
  <a href="https://wa.me/62xxx?text=..." class="btn" style="background: var(--color-surface-bright); color: var(--color-primary); border-radius: var(--rounded-md);">
    Pesan Sekarang via WhatsApp
  </a>
</article>
```

```css
.card-paket-featured {
  background-color: var(--color-primary);
  border: none;   /* tidak perlu border, sudah solid */
  border-radius: var(--rounded-lg);
}
.card-paket-featured__badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
}
```

---

## Bento Gallery

```html
<div class="bento-gallery" role="list" aria-label="Galeri foto">
  <!-- tile 2x2 -->
  <div class="bento-tile bento-tile--lg" role="listitem">
    <img src="..." alt="..." loading="lazy" />
    <div class="bento-tile__overlay" aria-hidden="true">
      <svg><!-- ikon zoom --></svg>
    </div>
  </div>
  <!-- tile 2x1 -->
  <div class="bento-tile bento-tile--wide" role="listitem">...</div>
  <!-- tile 1x1 -->
  <div class="bento-tile" role="listitem">...</div>
</div>
```

```css
.bento-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: var(--spacing-base);
}
@media (max-width: 639px) {
  .bento-gallery {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
  }
}
.bento-tile {
  position: relative;
  overflow: hidden;
  border-radius: var(--rounded-md);
  border: var(--border-hairline);
}
.bento-tile--lg {
  grid-column: span 2;
  grid-row: span 2;
}
.bento-tile--wide {
  grid-column: span 2;
}
.bento-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.bento-tile__overlay {
  position: absolute;
  inset: 0;
  background: rgba(46, 46, 46, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 200ms ease;
}
@media (prefers-reduced-motion: no-preference) {
  .bento-tile:hover .bento-tile__overlay {
    background: rgba(46, 46, 46, 0.4);
  }
}
```

---

## Pagination

```html
<nav class="pagination" aria-label="Navigasi halaman">
  <button class="pagination-arrow" aria-label="Halaman sebelumnya">←</button>
  <button class="pagination-item pagination-item--active" aria-current="page">1</button>
  <button class="pagination-item">2</button>
  <button class="pagination-item">3</button>
  <span class="pagination-ellipsis" aria-hidden="true">…</span>
  <button class="pagination-item">8</button>
  <button class="pagination-arrow" aria-label="Halaman berikutnya">→</button>
</nav>
```

```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-lg);
}
.pagination-item,
.pagination-arrow {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rounded-default);  /* 8px */
  border: var(--border-hairline);
  background: var(--color-surface-bright);
  color: var(--color-on-surface);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.pagination-item--active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}
.pagination-arrow { color: var(--color-primary); }
.pagination-ellipsis {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface-variant);
  font-size: 14px;
}
```

---

## Fade-up via IntersectionObserver

```js
// Tambahkan di script global / layout
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
```

Pastikan CSS `fade-up` hanya aktif di dalam `@media (prefers-reduced-motion: no-preference)` — sudah didefinisikan di `design-tokens.css`.

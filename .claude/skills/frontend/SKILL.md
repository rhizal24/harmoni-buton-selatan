---
name: frontend-design-system
description: >
  Design system dan art direction untuk Website Desa Gerak Makmur (harmoni-buton-selatan).
  Aktifkan skill ini setiap kali mengerjakan komponen UI, halaman, layout, atau styling
  frontend — termasuk saat membuat komponen baru, merevisi tampilan, menyesuaikan warna,
  tipografi, spacing, border, atau animasi. Juga aktifkan saat menyusun struktur halaman
  Beranda, Profil, Karamba, Peta Infografis, Berita, Galeri, UMKM, atau Admin Dashboard.
---

# Frontend Design System — Website Desa Gerak Makmur

Skill ini adalah **satu-satunya sumber kebenaran** untuk keputusan visual dan komponen frontend
proyek ini. Baca seluruh bagian ini sebelum menulis kode apapun yang menyentuh UI/UX.

---

## Prinsip Utama (Baca Dulu)

1. **Flat + outline-based**, bukan shadow/elevation ala aplikasi.
2. Kartu & foto dibingkai dengan **border tosca tipis**, bukan drop-shadow tebal.
3. Tombol & kartu pakai **rounded-rectangle kecil** (`rounded.md` = 12px), **bukan pill** (kecuali badge dan `nav-item-karamba`).
4. Heading section mengikuti **pola editorial puitis**: garis hairline di atas → paragraf intro → judul dengan prefix `"— "`.
5. Nama section di **heading halaman** pakai bahasa puitis ("Jelajah Desa", "Lensa Lande", "Mitra Kolaborasi"). Nama **menu navbar** tetap fungsional (Beranda / Profil / Karamba / Peta Infografis / Berita / Galeri / UMKM).
6. **Satu wisata unggulan**: Karamba. Tidak ada daftar destinasi lain — daftar di hero beranda adalah fasilitas/spot di dalam Karamba.
7. Warna **coral (`secondary`)** dipakai terbatas: highlight menu Karamba, badge "Paling Diminati", badge "Wisata Unggulan" di hero. Penekanan kartu & harga pakai **tosca (`primary`)**.
8. Galeri berbentuk **bento/masonry** (tile bervariasi), bukan grid seragam.
9. Respek `prefers-reduced-motion` pada setiap animasi.

---

## 1. Token Warna

```css
/* === Surface === */
--color-surface:                    #EEEEEE;
--color-surface-dim:                #DCDCDC;
--color-surface-bright:             #FFFFFF;
--color-surface-container-lowest:   #FFFFFF;
--color-surface-container-low:      #F6F6F6;
--color-surface-container:          #EEEEEE;
--color-surface-container-high:     #E2E2E2;
--color-surface-container-highest:  #D6D6D6;

/* === On-Surface === */
--color-on-surface:         #2E2E2E;
--color-on-surface-variant: #5A5A5A;

/* === Outline === */
--color-outline:         #9A9A9A;
--color-outline-variant: #D0D0D0;

/* === Inverse === */
--color-inverse-surface:    #2E2E2E;
--color-inverse-on-surface: #EEEEEE;

/* === Primary (Tosca) === */
--color-primary:               #028090;
--color-on-primary:            #FFFFFF;
--color-primary-container:     #CFF1F4;
--color-on-primary-container:  #00434B;
--color-primary-hover:         #026F7D;
--color-primary-border:        #028090;   /* border tipis kartu, foto, tombol outline */

/* === Secondary (Coral) — pakai terbatas === */
--color-secondary:              #F45B69;
--color-on-secondary:           #FFFFFF;
--color-secondary-container:    #FFDEE1;
--color-on-secondary-container: #7A1F2A;
--color-secondary-hover:        #D94A56;

/* === Tertiary === */
--color-tertiary:               #2E2E2E;
--color-on-tertiary:            #FFFFFF;
--color-tertiary-container:     #E2E2E2;
--color-on-tertiary-container:  #2E2E2E;

/* === Error === */
--color-error:            #BA1A1A;
--color-on-error:         #FFFFFF;
--color-error-container:  #FFDAD6;
--color-on-error-container: #93000A;

/* === Background === */
--color-background:    #EEEEEE;
--color-on-background: #2E2E2E;
```

---

## 2. Tipografi

Font yang digunakan:
- **Fraunces** — display / headline (serif tegas, warna tosca)
- **Plus Jakarta Sans** — body / UI (sans-serif bersih)

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');

/* Scale */
--text-display:     font-family: Fraunces; font-size: 56px; font-weight: 600; line-height: 62px; letter-spacing: -0.01em;
--text-headline-lg: font-family: Fraunces; font-size: 36px; font-weight: 600; line-height: 44px;
--text-headline-md: font-family: Fraunces; font-size: 26px; font-weight: 600; line-height: 34px;
--text-title-lg:    font-family: Plus Jakarta Sans; font-size: 20px; font-weight: 700; line-height: 28px;
--text-body-lg:     font-family: Plus Jakarta Sans; font-size: 18px; font-weight: 400; line-height: 30px;
--text-body-md:     font-family: Plus Jakarta Sans; font-size: 16px; font-weight: 400; line-height: 26px;
--text-label-md:    font-family: Plus Jakarta Sans; font-size: 14px; font-weight: 600; line-height: 20px; letter-spacing: 0.01em;
--text-label-sm:    font-family: Plus Jakarta Sans; font-size: 12px; font-weight: 600; line-height: 16px; letter-spacing: 0.02em;
--text-stat-number: font-family: Fraunces; font-size: 40px; font-weight: 600; line-height: 44px;
```

---

## 3. Spacing & Layout

```yaml
spacing:
  xs:     4px
  sm:    12px
  base:   8px
  md:    24px
  lg:    40px
  xl:    64px
  gutter: 16px

container:
  max-width:         1280px
  reading-max-width:  720px   # dipakai section cerita/narasi

padding-inline:
  mobile:  20px
  tablet:  32px
  desktop: 64px

breakpoints:
  mobile:  0px
  tablet:  640px
  desktop: 1024px
  wide:    1440px

grid:
  mobile:  { columns: 4, gutter: 16px }
  tablet:  { columns: 8, gutter: 24px }
  desktop: { columns: 12, gutter: 32px }

section-rhythm:
  sm:  48px
  md:  80px
  lg: 120px

hero:
  height-desktop: 92vh
  height-mobile:  70vh
```

---

## 4. Radius & Border

> ⚠️ Tombol TIDAK pakai pill (`rounded-full`). Hanya `nav-item-karamba`, badge, dan `language-switcher` yang boleh pakai pill.

```css
/* Radius */
--rounded-sm:      4px;
--rounded-default: 8px;   /* tombol kecil, pagination item */
--rounded-md:     12px;   /* DEFAULT tombol & kartu */
--rounded-lg:     16px;   /* kartu besar, foto */
--rounded-xl:     24px;   /* hero image, section besar */
--rounded-full: 9999px;   /* HANYA badge, nav-item-karamba, language-switcher */

/* Border */
--border-hairline: 1px solid var(--color-outline-variant);    /* divider, default kartu */
--border-frame:    1.5px solid var(--color-primary-border);   /* foto hero, kartu featured, elemen highlight */
--border-frame-hover: 2px solid var(--color-primary);

/* Elevation — minimal, flat-first */
--elevation-card-hover: 0 4px 12px rgba(46,46,46,0.08);   /* hanya saat hover */
--elevation-floating:   0 8px 24px rgba(46,46,46,0.12);   /* search overlay, dropdown */
--elevation-nav:        0 1px 0   rgba(46,46,46,0.06);    /* navbar */
```

---

## 5. Struktur Halaman & Urutan Komponen

### Beranda
```
utility-bar
navbar
hero-beranda (split 2 kolom: teks+CTA kiri | foto+list-fasilitas-karamba kanan)
section-jelajah-desa (3x card-paket-karamba)
section-lensa-lande (bento-gallery + pagination)
section-mitra-kolaborasi (logo strip)
footer
```

### Karamba
```
hero-karamba (full-bleed 95vh + badge coral)
section-cerita-karamba (narasi max-width 720px)
grid card-paket-karamba (2 default + 1 featured di tengah)
gallery-karamba (bento)
lokasi / peta embed
```

### Profil
```
sejarah desa
visi-misi
card-profil-stat (statistik desa)
card-profil-pejabat (perangkat desa)
```

### Peta Infografis
```
section-peta-infografis
  desktop: peta 60% kiri | statistik + POI 40% kanan
  mobile: peta → statistik & POI stack
```

### Berita
```
filter kategori
grid card-berita
pagination
```

### Galeri
```
bento-gallery
pagination
```

### UMKM
```
filter kategori
grid card-umkm
```

---

## 6. Utility Bar

Strip gelap tipis paling atas halaman, di atas navbar.

```yaml
height:          36px
background:      var(--color-inverse-surface)   /* #2E2E2E */
text-color:      var(--color-inverse-on-surface) /* #EEEEEE */
typography:      label-sm
content:         "kontak cepat (telepon / WhatsApp) + ikon sosial media, rata kanan"
```

---

## 7. Navbar

```yaml
background:   var(--color-surface-bright)
elevation:    var(--elevation-nav)
height:       72px
position:     sticky (di bawah utility-bar)
menu:         [Beranda, Profil, Karamba*, Peta Infografis, Berita, Galeri, UMKM]
right-side:   [search-icon, language-switcher ID/EN]

nav-item-karamba:
  background: var(--color-secondary)   /* coral */
  text:       var(--color-on-secondary)
  typography: label-md
  rounded:    var(--rounded-full)       /* pill — sengaja beda */
  padding:    4px 24px
  hover:      scale(1.03), background var(--color-secondary-hover)

language-switcher:
  background: var(--color-surface-container-low)
  typography: label-md
  rounded:    var(--rounded-full)
  padding:    4px 12px
```

---

## 8. Pola Judul Section

### `section-intro-inline` (kiri-kanan, editorial)
Dipakai di: Jelajah Desa, dan section lain yang punya paragraf intro.

```
[hairline full-width di atas section]
[paragraf intro — body-md, on-surface-variant, center]    [— Nama Section — headline-lg, primary, kanan]
```

HTML template:
```html
<div class="section-header">
  <hr class="section-divider" />
  <div class="section-intro-inline">
    <p class="section-intro-text">Temukan pengalaman terbaik di Karamba...</p>
    <h2 class="section-title">— Jelajah Desa</h2>
  </div>
</div>
```

### `section-title-centered` (tengah, untuk Lensa Lande & Mitra Kolaborasi)
```
[hairline full-width di atas section]
[h2 — headline-lg, primary, center]
[subtitle — body-md, on-surface-variant, center, max-width 640px]
```

---

## 9. Hero Beranda

```yaml
layout:       "split 2 kolom desktop (50/50); stack di mobile"
background:   var(--color-background)

kolom-kiri:
  - eyebrow:  tidak ada
  - title:    "Wisata Unggulan" — display, on-surface
  - body:     body-md, on-surface-variant
  - cta:      button-primary ("Lihat Detail")

kolom-kanan:
  - hero-image:
      aspect-ratio: "4:5 atau 1:1 (potret)"
      rounded:      var(--rounded-xl)
      border:       var(--border-frame)
  - list-fasilitas-karamba:
      note: "Daftar fasilitas/spot DALAM Karamba, bukan wisata lain"
      item-aktif:  title-lg, on-surface (misal: "Karamba Resto")
      item-inaktif: body-md, outline
      contoh: ["Karamba Resto", "Dermaga Karamba", "Spot Foto Karamba", "Area Susur Laut"]
```

---

## 10. Kartu Paket Wisata (Karamba)

### Default Card
```yaml
background: var(--color-surface-bright)
border:     var(--border-frame)
rounded:    var(--rounded-lg)
padding:    var(--spacing-md)

title:      title-lg, on-surface
desc:       label-sm, on-surface-variant
price:      headline-md, primary   ← TOSCA, bukan coral
benefits:
  icon:     primary (tosca)
  text:     label-md, on-surface-variant

button:
  style:    outline
  border:   var(--border-frame)
  text:     primary
  rounded:  var(--rounded-md)
  label:    "Pesan Sekarang via WhatsApp"
```

### Featured Card (1 kartu di tengah)
```yaml
background: var(--color-primary)   /* tosca solid */
rounded:    var(--rounded-lg)
padding:    var(--spacing-md)

title:      title-lg, on-primary (putih)
desc:       primary-container
price:      headline-md, on-primary (putih)
benefits:
  icon:     on-primary
  text:     primary-container

button:
  background: var(--color-surface-bright)
  text:       primary (tosca)
  rounded:    var(--rounded-md)
  label:      "Pesan Sekarang via WhatsApp"

badge-pojok-atas:
  text:       "Paling Diminati"
  background: var(--color-secondary)   /* coral — boleh di sini sbg penanda kecil */
  text-color: var(--color-on-secondary)
  rounded:    var(--rounded-full)
```

---

## 11. Komponen Lain

### card-profil-stat
```yaml
background: var(--color-primary-container)
text:       var(--color-on-primary-container)
rounded:    var(--rounded-md)
number:     stat-number (Fraunces 40px)
label:      label-sm
```

### card-profil-pejabat
```yaml
background: var(--color-surface-bright)
border:     var(--border-hairline)
rounded:    var(--rounded-lg)
image:      aspect-ratio 1:1
name:       title-lg
position:   label-sm, on-surface-variant
```

### card-berita
```yaml
background: var(--color-surface-bright)
border:     var(--border-hairline)
rounded:    var(--rounded-lg)
image:      aspect-ratio 16:9
title:      title-lg
date:       label-sm, on-surface-variant
```

### card-umkm
```yaml
background: var(--color-surface-bright)
border:     var(--border-hairline)
rounded:    var(--rounded-lg)
image:      aspect-ratio 1:1
title:      title-lg
```

### section-peta-infografis
```yaml
map-container:
  rounded:    var(--rounded-xl)
  border:     var(--border-frame)
  min-height: 480px

card-stat:
  background: var(--color-surface-bright)
  border:     var(--border-hairline)
  rounded:    var(--rounded-md)
  padding:    var(--spacing-md)
```

---

## 12. Bento Gallery

Grid asimetris — ukuran tile bervariasi, BUKAN grid seragam 1:1.

```yaml
desktop-layout:
  - kombinasi: tile kecil (1×1), sedang (2×1), besar (2×2)
  - basis: grid 12 kolom
mobile-layout:  "2 kolom rata, stack"

image-style:
  rounded:       var(--rounded-md)
  border:        var(--border-hairline)
  hover-overlay: "rgba(46,46,46,0.4) + ikon zoom putih (transisi 200ms)"
```

---

## 13. Pagination

```yaml
item-size:   36px
item-rounded: var(--rounded-default)   /* 8px */
item-border:  var(--border-hairline)
typography:   label-md

active:
  background: var(--color-primary)
  text:       var(--color-on-primary)
  border:     none

inactive:
  background: var(--color-surface-bright)
  text:       var(--color-on-surface)

ellipsis:
  char:       "…"
  color:      on-surface-variant
  border:     none

arrow:
  background: var(--color-surface-bright)
  border:     var(--border-hairline)
  rounded:    var(--rounded-default)
  icon-color: var(--color-primary)
```

---

## 14. Tombol Umum

```yaml
button-primary:
  background: var(--color-primary)
  text:       var(--color-on-primary)
  typography: label-md
  rounded:    var(--rounded-md)   /* 12px — bukan pill */
  padding:    12px 24px
  min-height: 44px
  hover:      background var(--color-primary-hover)

button-outline:
  background: transparent
  border:     var(--border-frame)
  text:       var(--color-primary)
  typography: label-md
  rounded:    var(--rounded-md)
  padding:    12px 24px

button-secondary:
  background: var(--color-secondary)
  text:       var(--color-on-secondary)
  typography: label-md
  rounded:    var(--rounded-md)
  padding:    12px 24px
  note:       "Pakai jarang — CTA WhatsApp di momen spesial saja"
```

---

## 15. Hero Karamba

```yaml
layout:     full-bleed, min-height 95vh
title:      display (Fraunces 56px)
badge:
  text:       "Wisata Unggulan Desa Gerak Makmur"
  background: var(--color-secondary)   /* coral */
  text-color: var(--color-on-secondary)
  rounded:    var(--rounded-full)
```

---

## 16. Section Mitra Kolaborasi

```yaml
title-pattern: section-title-centered
title:         "Mitra Kolaborasi"
subtitle:      "Berkolaborasi dengan berbagai mitra untuk mendukung pengembangan pariwisata dan potensi lokal Desa Gerak Makmur dalam kegiatan KKN PPM UGM."
logo-style:    "grayscale default → warna asli saat hover (transisi 200ms)"
```

---

## 17. Footer

```yaml
background: var(--color-inverse-surface)   /* #2E2E2E */
text:       var(--color-inverse-on-surface) /* #EEEEEE */
link:       var(--color-primary-container)  /* tosca muda */
padding:    var(--spacing-xl)               /* 64px */
```

---

## 18. Admin Dashboard (`/admin`)

```yaml
layout:   "sidebar kiri + konten kanan"
density:  "padat — spacing sm/md, rounded default/md"
colors:   "dominan primary (tosca); secondary (coral) TIDAK dipakai di admin"
components:
  - table-konten
  - form-input
  - button-primary (simpan/terbitkan)
  - badge status
```

---

## 19. Motion & Animasi

```yaml
card-masuk-viewport:
  animation: fade-up
  duration:  200–300ms
  easing:    ease-out

card-hover:
  border:    hairline → frame (1px → 1.5px solid primary-border)
  shadow:    none → elevation.card-hover (0 4px 12px rgba(46,46,46,0.08))
  duration:  150ms

nav-item-karamba-hover:
  transform: scale(1.03)
  duration:  150ms

mitra-logo-hover:
  filter:    grayscale(1) → grayscale(0)
  duration:  200ms

prefers-reduced-motion:
  rule: "Semua animasi/transisi wajib di-wrap dalam @media (prefers-reduced-motion: no-preference)"
```

---

## 20. Referensi Cepat — Do & Don't

| ✅ Do | ❌ Don't |
|---|---|
| Border tosca tipis di kartu | Shadow tebal `box-shadow` di kartu default |
| `rounded-md` (12px) untuk tombol | `rounded-full` untuk tombol biasa |
| Warna harga paket → tosca (`primary`) | Warna harga paket → coral (`secondary`) |
| Nama section puitis di heading halaman | Nama generik di heading ("Wisata", "Galeri") |
| Bento/masonry untuk galeri | Grid seragam 1:1 untuk galeri |
| Coral hanya: menu Karamba, badge "Paling Diminati", badge hero | Coral sebagai warna dominan kartu/tombol |
| `@media (prefers-reduced-motion)` untuk animasi | Animasi tanpa guard reduced-motion |
| Fasilitas Karamba di list hero (bukan wisata lain) | Menambahkan destinasi selain Karamba |

---

Lihat juga: [`references/design-tokens.css`](./references/design-tokens.css) untuk file CSS siap-pakai, dan [`references/page-structure.md`](./references/page-structure.md) untuk struktur HTML tiap halaman.

# Harmoni Buton Selatan — Frontend Monorepo

Monorepo frontend untuk website desa-desa di wilayah Buton Selatan menggunakan **pnpm workspaces**.

## Struktur

```
frontend/
├─ apps/
│  ├─ desagayabaru/        → desagayabaru.butonselatan.com
│  └─ desagerakmakmur/     → desagerakmakmur.butonselatan.com
│
├─ packages/
│  ├─ ui/                  → Shared UI components (Navbar, Footer, Button, dll)
│  └─ config/              → Shared config (ESLint, Tailwind, TypeScript)
│
├─ package.json
├─ pnpm-workspace.yaml
└─ .gitignore
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm workspaces (monorepo)
- **Runtime**: Node.js ≥ 20

## Cara Memulai

### Prasyarat

```bash
# Install pnpm jika belum ada
npm install -g pnpm
```

### Install semua dependencies

```bash
pnpm install
```

### Jalankan dev server

```bash
# Jalankan SEMUA apps sekaligus
pnpm dev

# Jalankan hanya Desa Gayabaru (port 3000)
pnpm dev:gayabaru

# Jalankan hanya Desa Gerak Makmur (port 3001)
pnpm dev:gerakmakmur
```

### Build production

```bash
# Build semua apps
pnpm build

# Build satu app
pnpm build:gayabaru
pnpm build:gerakmakmur
```

---

## 🚀 Cara Menjalankan

### Cara 1 — Jalankan keduanya sekaligus (paling mudah)

```bash
pnpm dev
```

> Menjalankan **desagayabaru** di `:3000` dan **desagerakmakmur** di `:3001` secara paralel.

### Cara 2 — Jalankan satu app saja

```bash
# Hanya Desa Gayabaru
pnpm dev:gayabaru

# Hanya Desa Gerak Makmur
pnpm dev:gerakmakmur
```

### Cara 3 — Masuk langsung ke folder app

```bash
# Desa Gayabaru
cd apps/desagayabaru
pnpm dev

# Desa Gerak Makmur
cd apps/desagerakmakmur
pnpm dev
```

### 🌐 Buka di Browser

| App | URL Lokal | Subdomain Produksi |
|---|---|---|
| Desa Gayabaru | http://localhost:3000 | desagayabaru.butonselatan.com |
| Desa Gerak Makmur | http://localhost:3001 | desagerakmakmur.butonselatan.com |

### ⚠️ Troubleshooting — Port Already in Use

Jika muncul error `EADDRINUSE: address already in use :::3000`:

```bash
# Matikan proses yang memakai port 3000 & 3001
lsof -ti:3000,3001 | xargs kill -9

# Lalu jalankan ulang
pnpm dev
```

---

## Shared Packages

### `packages/ui`

Berisi komponen UI yang digunakan bersama oleh kedua desa (Navbar, Footer, Button, Card, dll).

Import di app:
```tsx
import { Button } from "@harmoni/ui";
```

### `packages/config`

Berisi konfigurasi bersama: ESLint rules, TypeScript base config, Tailwind preset.

## Environment Variables

Setiap app punya `.env.local` sendiri. Lihat `.env.example` di masing-masing folder app.

# Arsitektur Deployment — Website KKN Multi-Desa
### Vercel (Next.js) + Supabase (DB, Auth & Storage umum) + ImageKit (khusus Foto Wisata)

---

## 1. Ringkasan Arsitektur

```
                         ┌─────────────────────────────┐
                         │   Domain: butonselatan.xxx   │
                         │   Wildcard: *.butonselatan.xxx │
                         └───────────────┬─────────────┘
                                         │ Nameserver diarahkan ke Vercel
                                         ▼
                         ┌─────────────────────────────┐
                         │           VERCEL             │
                         │   (Next.js, Free/Hobby)       │
                         │  - Middleware baca subdomain  │
                         │  - Resolve village_id         │
                         └───────┬───────────────┬───────┘
                                 │               │
                   Query metadata│               │Upload foto wisata
                   + file umum   │               │
                                 ▼               ▼
                 ┌───────────────────────┐   ┌─────────────────────────┐
                 │       SUPABASE         │   │        IMAGEKIT           │
                 │  - PostgreSQL (shared  │   │   Media Library           │
                 │    tables + village_id)│   │   - HANYA foto wisata:    │
                 │  - Auth (admin desa)   │   │     tourism_spots.*       │
                 │  - RLS per desa        │   │     tourism_spot_images.* │
                 │  - Storage:             │   │   - CDN + optimasi        │
                 │    dokumen, logo desa,  │   │     gambar otomatis       │
                 │    foto struktur org,   │   └─────────────────────────┘
                 │    cover artikel        │
                 └───────────────────────┘
```

**Prinsip pembagian tanggung jawab:**
- **Supabase** menyimpan seluruh data terstruktur (tabel) **dan** juga jadi tempat penyimpanan file untuk semua kebutuhan **kecuali foto wisata** — dokumen desa (PDF), logo/cover desa, foto struktur organisasi, cover artikel. Ini memakai **Supabase Storage** (bukan ImageKit), supaya tidak perlu tambahan layanan pihak ketiga untuk file-file tersebut.
- **ImageKit** dipakai **khusus untuk foto wisata** — `tourism_spots.cover_image_url` dan `tourism_spot_images.image_url`. ImageKit dipilih (bukan Firebase) karena free tier-nya tidak memerlukan kartu kredit sama sekali.
- **Vercel** hanya menjalankan aplikasi (routing, middleware, rendering) — tidak menyimpan data apa pun secara permanen.

> Kenapa dipisah begini? Foto wisata biasanya jadi konten dengan jumlah & ukuran file terbesar (galeri per destinasi, resolusi tinggi untuk keperluan promosi) — memisahkannya ke ImageKit menjaga kuota Supabase Storage (yang lebih kecil di free tier) tetap longgar untuk dokumen dan foto lain yang volumenya jauh lebih sedikit. ImageKit juga memberi bonus optimasi gambar otomatis (resize, kompresi) lewat parameter URL, tanpa perlu API call tambahan.

---

## 2. Skema Database (Supabase) — Disesuaikan

Skema tabel **tidak berubah secara struktural** dari rancangan sebelumnya (tetap shared tables + `village_id`). Perubahan hanya pada **sumber** kolom penyimpanan file — dan kali ini sumbernya berbeda-beda per tabel:

| Kolom | Disimpan di | Keterangan |
|---|---|---|
| `tourism_spots.cover_image_url` | **ImageKit** | Foto sampul destinasi wisata |
| `tourism_spot_images.image_url` | **ImageKit** | Galeri foto per destinasi wisata |
| `documents.file_url` | **Supabase Storage** | Dokumen desa (PDF, dll) |
| `villages.logo_url` / `cover_image_url` | **Supabase Storage** | Logo & cover halaman Home desa |
| `organization_structure.photo_url` | **Supabase Storage** | Foto profil per jabatan |
| `articles.cover_image_url` | **Supabase Storage** | Foto sampul artikel/berita |

Kolom-kolom di atas tetap bertipe `text` biasa (menyimpan URL penuh) — tidak perlu ubah tipe data. Bedanya hanya **dari layanan mana** URL itu berasal saat proses upload.

> DDL lengkap tabel dan seluruh RLS policy tetap sama seperti dokumen rancangan sebelumnya — **tidak perlu migrasi ulang skema**.

### Supabase Storage — buckets yang perlu dibuat

Karena sekarang Supabase Storage dipakai untuk beberapa jenis file sekaligus, buat beberapa bucket terpisah agar rapi dan gampang diberi policy:

```
Bucket: village-documents   (untuk dokumen desa, PDF)
Bucket: village-assets      (untuk logo desa, cover, foto struktur organisasi, cover artikel)
```

Path di dalam bucket tetap mengikuti pola `{village_id}/{filename}` seperti pada rancangan RLS Storage sebelumnya, supaya policy `(storage.foldername(name))[1] = auth_village_id()::text` tetap berlaku sama untuk kedua bucket ini.

---

## 3. Setup Wildcard Subdomain di Vercel

1. Buka **Project Settings → Domains** di Vercel.
2. Tambahkan domain dengan format wildcard: `*.butonselatan.xxx` (ganti `xxx` dengan TLD domain Anda).
3. Vercel akan meminta Anda mengarahkan **nameserver** domain ke nameserver Vercel (bukan sekadar CNAME), karena wildcard butuh Vercel yang mengelola DNS penuh untuk generate sertifikat SSL otomatis.
4. Update nameserver di registrar domain Anda (tempat beli domain) sesuai instruksi Vercel.
5. Tunggu propagasi DNS (bisa beberapa menit–jam).
6. Setelah aktif, semua subdomain (`gayabaru.butonselatan.xxx`, `gerakmakmur.butonselatan.xxx`, dst) otomatis terarah ke project Vercel yang sama — tanpa perlu daftar satu-satu.

---

## 4. Middleware Next.js — Resolve Subdomain → `village_id`

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const rootDomain = 'butonselatan.xxx'; // ganti sesuai domain asli

  // Ekstrak subdomain, mis. "gayabaru.butonselatan.xxx" -> "gayabaru"
  const subdomain = host
    .replace(`.${rootDomain}`, '')
    .replace(rootDomain, '')
    .replace('www.', '');

  const isMainDomain = !subdomain || subdomain === host;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-village-slug', isMainDomain ? '' : subdomain);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

Lalu di server component/layout, ambil `village_id` sekali di awal request:

```typescript
// app/layout.tsx atau lib/get-village.ts
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function getCurrentVillage() {
  const slug = headers().get('x-village-slug');
  if (!slug) return null; // domain utama, bukan subdomain desa

  const { data, error } = await supabase
    .from('villages')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data; // { id, name, slug, ... } -> pakai data.id sebagai village_id di semua query berikutnya
}
```

Semua query ke tabel konten selanjutnya tinggal:

```typescript
const { data: articles } = await supabase
  .from('articles')
  .select('*')
  .eq('village_id', village.id)
  .eq('is_published', true)
  .order('published_at', { ascending: false });
```

---

## 5. Integrasi Upload File

Ada **dua jalur upload berbeda** tergantung jenis filenya — penting untuk diterapkan konsisten di form admin.

### 5a. Upload Foto Wisata → ImageKit

**Setup awal**
1. Daftar di [imagekit.io](https://imagekit.io) (paket **forever free**, tanpa kartu kredit).
2. Ambil `Public Key`, `Private Key`, dan `URL Endpoint` dari **Dashboard → Developer options**.
3. Simpan sebagai environment variable di Vercel:
   ```
   IMAGEKIT_PUBLIC_KEY=
   IMAGEKIT_PRIVATE_KEY=
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
   ```

**Server-side upload handler (API Route khusus foto wisata)**

```typescript
// app/api/upload/tourism-photo/route.ts
import ImageKit from 'imagekit';
import { NextRequest, NextResponse } from 'next/server';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: NextRequest) {
  // TODO: verifikasi sesi admin Supabase di sini sebelum lanjut upload
  // const session = await verifySupabaseSession(request);
  // if (!session || session.role !== 'village_admin') return NextResponse.json({error:'unauthorized'}, {status:401});

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const villageSlug = formData.get('village_slug') as string;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await imagekit.upload({
    file: buffer,
    fileName: file.name,
    folder: `/tourism/${villageSlug}`, // pisah folder per desa
  });

  return NextResponse.json({ url: result.url });
}
```

Frontend lalu menyimpan `result.url` hasil respons ini ke kolom `tourism_spots.cover_image_url` atau `tourism_spot_images.image_url` di Supabase.

**Menampilkan foto (Delivery API):** karena ImageKit pakai URL-based transformation, tidak perlu API call terpisah untuk menampilkan gambar — cukup pakai URL yang tersimpan di database, opsional tambahkan parameter transformasi:

```tsx
// Foto asli
<img src={tourismSpot.cover_image_url} alt={tourismSpot.name} />

// Otomatis di-resize + kompresi untuk thumbnail galeri
<img src={`${tourismSpot.cover_image_url}?tr=w-400,h-300,q-80`} alt={tourismSpot.name} />
```

### 5b. Upload File Lainnya (dokumen, logo, foto struktur organisasi, cover artikel) → Supabase Storage

Untuk jenis file ini, **tidak perlu API Route tambahan** — bisa langsung pakai Supabase JS SDK dari sisi client, karena aksesnya sudah otomatis dilindungi oleh RLS policy Storage yang sudah dirancang sebelumnya (`village_admin_upload_own_files`).

```typescript
// contoh: upload dokumen desa
import { supabase } from '@/lib/supabase';

async function uploadDocument(file: File, villageId: string) {
  const filePath = `${villageId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('village-documents')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('village-documents')
    .getPublicUrl(filePath);

  return data.publicUrl; // simpan ini ke kolom documents.file_url
}
```

Pola yang sama berlaku untuk bucket `village-assets` (logo desa, foto struktur organisasi, cover artikel) — cukup ganti nama bucket dan kolom tujuan penyimpanan URL.

### Ringkasan alur per jenis file

| Jenis file | Upload lewat | Disimpan ke kolom |
|---|---|---|
| Foto/galeri wisata | API Route `/api/upload/tourism-photo` → ImageKit | `tourism_spots.cover_image_url`, `tourism_spot_images.image_url` |
| Dokumen desa (PDF) | Supabase SDK langsung → bucket `village-documents` | `documents.file_url` |
| Logo/cover desa | Supabase SDK langsung → bucket `village-assets` | `villages.logo_url`, `villages.cover_image_url` |
| Foto struktur organisasi | Supabase SDK langsung → bucket `village-assets` | `organization_structure.photo_url` |
| Cover artikel | Supabase SDK langsung → bucket `village-assets` | `articles.cover_image_url` |

**Penting soal keamanan:** untuk foto wisata, validasi hak akses (admin hanya boleh upload untuk desanya sendiri) **wajib** dilakukan manual di dalam API Route ImageKit, karena ImageKit tidak mengenal RLS Supabase. Untuk file lainnya, validasi otomatis sudah ditangani oleh RLS Storage Supabase — tidak perlu API Route tambahan.

---

## 6. Ringkasan Environment Variables yang Dibutuhkan (Vercel)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # hanya dipakai di server-side, JANGAN expose ke client

# ImageKit (khusus foto wisata)
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=

# Domain
NEXT_PUBLIC_ROOT_DOMAIN=butonselatan.xxx
```

---

## 7. Checklist Deployment

- [ ] Buat project Supabase, jalankan migration SQL skema (tabel + RLS + helper function)
- [ ] Buat bucket `village-documents` dan `village-assets` di Supabase Storage + terapkan RLS policy Storage
- [ ] Daftar akun ImageKit (free, tanpa kartu), ambil API keys (khusus untuk foto wisata)
- [ ] Push project Next.js ke GitHub
- [ ] Import project ke Vercel, hubungkan repo
- [ ] Tambahkan environment variables di Vercel Project Settings
- [ ] Tambahkan wildcard domain `*.butonselatan.xxx` di Vercel, arahkan nameserver domain
- [ ] Deploy, tes akses lewat `gayabaru.butonselatan.xxx` dan `gerakmakmur.butonselatan.xxx`
- [ ] Buat akun admin pertama (super_admin) via Supabase Auth + insert manual ke `admin_profiles`
- [ ] Tes upload file dari form admin, cek URL tersimpan benar di tabel terkait

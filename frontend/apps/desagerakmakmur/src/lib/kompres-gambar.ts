import sharp from "sharp";

/**
 * Kompresi gambar sisi server sebelum naik ke ImageKit (khusus route
 * handler; sharp butuh Node runtime).
 *
 * Alur: gambar asli (bisa 5-10 MB) -> resize maks 1920px sisi terpanjang ->
 * WebP kualitas 80 -> biasanya 200-600 KB. WebP dipilih (bukan AVIF) karena
 * encoding AVIF jauh lebih lambat di serverless dan selisih ukurannya tipis.
 *
 * Non-gambar (PDF) dan format khusus (GIF/SVG) lolos apa adanya. Bila hasil
 * kompresi ternyata lebih besar dari aslinya (jarang; mis. sudah WebP kecil),
 * file asli yang dipakai.
 */

const MIME_BISA_KOMPRES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const LEBAR_MAKS = 1920; // cukup untuk tampilan lebar penuh
const KUALITAS_WEBP = 80;

export interface HasilKompres {
  buffer: Buffer;
  fileName: string;
  terkompres: boolean;
}

export async function kompresGambarWeb(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<HasilKompres> {
  if (!MIME_BISA_KOMPRES.has(mimeType)) {
    return { buffer, fileName, terkompres: false };
  }

  try {
    let hasil = await sharp(buffer)
      .rotate() // hormati orientasi EXIF sebelum data EXIF dibuang
      .resize({
        width: LEBAR_MAKS,
        height: LEBAR_MAKS,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: KUALITAS_WEBP })
      .toBuffer();

    // Jaring pengaman: foto super-detail kadang masih > 1 MB pada q80.
    // Kompres ulang lebih agresif agar hasil selalu di bawah ~1 MB.
    if (hasil.length > 1024 * 1024) {
      hasil = await sharp(buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 65 })
        .toBuffer();
    }

    if (hasil.length >= buffer.length) {
      return { buffer, fileName, terkompres: false };
    }

    return {
      buffer: hasil,
      fileName: fileName.replace(/\.[a-z0-9]+$/i, "") + ".webp",
      terkompres: true,
    };
  } catch {
    // Gambar korup / format aneh: jangan gagalkan upload, pakai asli.
    return { buffer, fileName, terkompres: false };
  }
}

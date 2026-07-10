-- Migrasi: kuota & kedaluwarsa kiriman foto warga (galeri)
-- Jalankan di Supabase SQL Editor SETELAH supabase-migration-galeri-kiriman.sql.
-- Idempotent: aman dijalankan berulang.
--
-- Aturan:
--   1. Kiriman warga berstatus 'pending' yang tidak diverifikasi selama
--      15 HARI dihapus otomatis.
--   2. Total ukuran seluruh foto kiriman warga (kolom file_id terisi,
--      termasuk yang sudah diterima) dibatasi 500 MB; bila lewat, foto
--      kiriman PALING LAMA dihapus lebih dulu.
--
-- Eksekusinya lewat fungsi gallery_kiriman_cleanup() yang dipanggil:
--   - endpoint publik /api/galeri/kirim setiap ada kiriman baru, dan
--   - halaman /admin/galeri setiap dibuka.
-- Fungsi mengembalikan file yang dihapus agar pemanggil ikut menghapus
-- file fisiknya di ImageKit.

-- ── 1. Kolom ukuran file (KB) untuk kiriman warga ──

ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS file_size_kb integer;

-- ── 2. Fungsi pembersih (SECURITY DEFINER agar bisa menghapus row
--       melewati RLS, tanpa memberi hak DELETE ke anon) ──

CREATE OR REPLACE FUNCTION public.gallery_kiriman_cleanup(v_village uuid)
RETURNS TABLE(o_file_id text, o_image_url text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  total  bigint;
  victim record;
BEGIN
  -- (1) kiriman pending kedaluwarsa: > 15 hari tanpa verifikasi
  RETURN QUERY
    DELETE FROM gallery_images
    WHERE village_id = v_village
      AND status = 'pending'
      AND created_at < now() - interval '15 days'
    RETURNING file_id, image_url;

  -- (2) kuota total kiriman warga 500 MB: hapus yang paling lama dulu
  SELECT COALESCE(SUM(file_size_kb), 0) INTO total
  FROM gallery_images
  WHERE village_id = v_village AND file_id IS NOT NULL;

  WHILE total > 500 * 1024 LOOP
    DELETE FROM gallery_images
    WHERE id = (
      SELECT id FROM gallery_images
      WHERE village_id = v_village AND file_id IS NOT NULL
      ORDER BY created_at ASC
      LIMIT 1
    )
    RETURNING file_id, image_url, COALESCE(file_size_kb, 0) AS size_kb
    INTO victim;

    IF NOT FOUND THEN
      EXIT;
    END IF;

    total := total - victim.size_kb;
    o_file_id := victim.file_id;
    o_image_url := victim.image_url;
    RETURN NEXT;
  END LOOP;

  RETURN;
END $$;

GRANT EXECUTE ON FUNCTION public.gallery_kiriman_cleanup(uuid) TO anon, authenticated;

-- Verifikasi:
-- SELECT * FROM public.gallery_kiriman_cleanup(
--   (SELECT id FROM public.villages WHERE slug = 'gayabaru'));

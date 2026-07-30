/*
# Create edu_videos table for Galeri Video Edukasi

1. Purpose
   Stores metadata for educational videos shown in the public Galeri Video Edukasi.
   The actual video files (MP4) and thumbnails live as static files in public/videos
   and public/thumbnails. This table holds the title, description, category, duration,
   file path, thumbnail path, and display order. Admin can add/edit/delete/reorder.

2. New Tables
   - edu_videos
     - id (uuid, primary key)
     - title (text, not null)
     - description (text)
     - category (text) — one of: Hipertensi, Pola Hidup Sehat, CERDIK, Aktivitas Fisik, Gizi Seimbang, Pemeriksaan Tekanan Darah
     - duration (text) — display string e.g. "02:15"
     - video_url (text) — path to mp4, e.g. /videos/edukasi-hipertensi.mp4
     - thumbnail_url (text) — path to jpg, e.g. /thumbnails/hipertensi.jpg
     - goal (text) — tujuan edukasi
     - sort_order (integer, default 0) — admin-controlled ordering
     - views (integer, default 0) — dummy view count
     - created_at (timestamptz)

3. Security
   - RLS enabled.
   - This is a public kiosk app with no Supabase Auth session; the anon key is the only
     key available. All policies use TO anon, authenticated so the app can read/write its
     own data. Data is intentionally public (educational videos).

4. Seed
   - Inserts 5 default video rows pointing to the expected public/ files.
*/

CREATE TABLE IF NOT EXISTS edu_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Hipertensi',
  duration text NOT NULL DEFAULT '00:00',
  video_url text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  goal text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE edu_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_rw_edu_videos" ON edu_videos;
CREATE POLICY "anon_rw_edu_videos" ON edu_videos FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_edu_videos_sort ON edu_videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_edu_videos_category ON edu_videos(category);

INSERT INTO edu_videos (title, description, category, duration, video_url, thumbnail_url, goal, sort_order, views) VALUES
('Mengenal Hipertensi', 'Pelajari pengertian, penyebab, dan bahaya hipertensi bagi tubuh.', 'Hipertensi', '02:15', '/videos/edukasi-hipertensi.mp4', '/thumbnails/hipertensi.jpg', 'Memahami dasar-dasar hipertensi agar dapat mencegah dan mendeteksi dini.', 1, 124),
('Pola Hidup Sehat', 'Tips menjaga pola hidup sehat untuk mencegah hipertensi.', 'Pola Hidup Sehat', '03:05', '/videos/edukasi-pola-hidup-sehat.mp4', '/thumbnails/pola-hidup.jpg', 'Mendorong masyarakat menerapkan pola hidup sehat setiap hari.', 2, 98),
('Diet Rendah Garam', 'Panduan konsumsi garam yang aman untuk penderita hipertensi.', 'Gizi Seimbang', '02:40', '/videos/edukasi-diet-rendah-garam.mp4', '/thumbnails/diet.jpg', 'Mengedukasi batas aman konsumsi garam dan pilihan makanan sehat.', 3, 76),
('Aktivitas Fisik', 'Jenis olahraga yang aman dan dianjurkan untuk penderita hipertensi.', 'Aktivitas Fisik', '03:20', '/videos/edukasi-aktivitas-fisik.mp4', '/thumbnails/olahraga.jpg', 'Mendorong rutin aktivitas fisik 30 menit per hari.', 4, 65),
('Cek Tekanan Darah', 'Cara mengukur tekanan darah sendiri di rumah dengan benar.', 'Pemeriksaan Tekanan Darah', '02:50', '/videos/edukasi-cek-tekanan-darah.mp4', '/thumbnails/cek-tensi.jpg', 'Mengajarkan teknik pengukuran tekanan darah yang akurat.', 5, 112)
ON CONFLICT DO NOTHING;
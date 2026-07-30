/*
# Create quiz tables for Quiz Edukasi Hipertensi

1. Purpose
   Stores the question bank and per-user quiz results for the Quiz Edukasi feature.
   Questions are managed by admin (CRUD). Results are written by the app when a user
   completes a quiz, scoped to the logged-in profile_id. Admin can read all results
   for statistics but cannot modify results.

2. New Tables
   - quiz_questions
     - id (uuid, primary key)
     - question (text, not null) — the question text
     - options (jsonb, not null) — array of 4 strings
     - correct_index (integer, not null) — 0-based index into options
     - explanation (text) — short explanation shown in review
     - category (text) — topic category for grouping
     - sort_order (integer, default 0)
     - created_at (timestamptz)
   - quiz_results
     - id (uuid, primary key)
     - profile_id (uuid, references profiles, ON DELETE CASCADE)
     - profile_name (text) — denormalized for admin stats
     - score (integer) — 0-100
     - correct_count (integer)
     - wrong_count (integer)
     - total_questions (integer)
     - duration_sec (integer) — time taken in seconds
     - passed (boolean) — true if score >= 70
     - category (text) — result category label
     - answers (jsonb) — array of { questionId, selectedIndex, correctIndex }
     - created_at (timestamptz)

3. Security
   - RLS enabled on both tables.
   - This is a public kiosk app with no Supabase Auth session; the anon key is the only
     key available. All policies use TO anon, authenticated so the app can read/write
     its own data. Quiz questions are intentionally public (educational content).
     Quiz results are keyed by profile_id but readable/writable via anon since there is
     no authenticated session in this app's architecture.

4. Seed
   - Inserts 10 default quiz questions covering: pengertian, faktor risiko, gejala,
     komplikasi, pencegahan, CERDIK, pemeriksaan tekanan darah, pengobatan, pola hidup
     sehat, and mitos/fakta.
*/

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  explanation text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Umum',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_rw_quiz_questions" ON quiz_questions;
CREATE POLICY "anon_rw_quiz_questions" ON quiz_questions FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_quiz_q_sort ON quiz_questions(sort_order);
CREATE INDEX IF NOT EXISTS idx_quiz_q_category ON quiz_questions(category);

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  profile_name text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  duration_sec integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  category text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_rw_quiz_results" ON quiz_results;
CREATE POLICY "anon_rw_quiz_results" ON quiz_results FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_quiz_r_profile ON quiz_results(profile_id);
CREATE INDEX IF NOT EXISTS idx_quiz_r_created ON quiz_results(created_at);

INSERT INTO quiz_questions (question, options, correct_index, explanation, category, sort_order) VALUES
('Apa yang dimaksud dengan hipertensi?', '["Penyakit tekanan darah rendah","Kondisi tekanan darah tinggi yang persisten","Penyakit jantung bawaan","Gangguan pencernaan"]'::jsonb, 1, 'Hipertensi adalah kondisi di mana tekanan darah pada dinding arteri lebih tinggi dari nilai normal dalam waktu lama.', 'Pengertian', 1),
('Berapa batas tekanan darah yang dikategorikan hipertensi menurut JNC 7?', '["<120/80 mmHg","120-139/80-89 mmHg",">= 140/90 mmHg","< 100/60 mmHg"]'::jsonb, 2, 'Menurut JNC 7, hipertensi didefinisikan sebagai tekanan darah >= 140/90 mmHg.', 'Pemeriksaan Tekanan Darah', 2),
('Manakah faktor risiko utama hipertensi yang dapat diubah?', '["Usia","Riwayat keluarga","Kebiasaan merokok","Jenis kelamin"]'::jsonb, 2, 'Merokok adalah faktor risiko yang dapat diubah, sedangkan usia, riwayat keluarga, dan jenis kelamin tidak dapat diubah.', 'Faktor Risiko', 3),
('Gejala apa yang sering muncul pada tekanan darah sangat tinggi?', '["Tidak ada gejala sama sekali","Sakit kepala, pusing, penglihatan kabur","Nafsu makan meningkat","Sering tertawa"]'::jsonb, 1, 'Pada tekanan darah sangat tinggi dapat muncul sakit kepala, pusing, penglihatan kabur, dan sesak napas.', 'Gejala', 4),
('Komplikasi serius yang dapat ditimbulkan hipertensi tidak terkontrol adalah?', '["Batuk pilek","Stroke dan serangan jantung","Kulit kering","Rambut rontok"]'::jsonb, 1, 'Hipertensi tidak terkontrol dapat menyebabkan stroke, serangan jantung, gagal jantung, kerusakan ginjal, dan kerusakan mata.', 'Komplikasi', 5),
('Apa kepanjangan dari CERDIK dalam pencegahan hipertensi?', '["Cek, Enyahkan, Rajin, Diet, Istirahat, Kendalikan","Cuci, Esok, Rutin, Dagang, Ibadah, Kerja","Cegah, Edukasi, Rawat, Damai, Indah, Kuat","Cita-cita, Ekonomi, Rasa, Doa, Iman, Kebijaksanaan"]'::jsonb, 0, 'CERDIK: Cek kesehatan rutin, Enyahkan asap rokok, Rajin aktivitas fisik, Diet sehat, Istirahat cukup, Kendalikan stres.', 'CERDIK', 6),
('Berapa batas konsumsi garam per hari yang dianjurkan untuk mencegah hipertensi?', '["Tidak perlu membatasi","< 5 gram (1 sendok teh)","20 gram per hari","50 gram per hari"]'::jsonb, 1, 'WHO merekomendasikan konsumsi garam kurang dari 5 gram (1 sendok teh) per hari untuk mencegah hipertensi.', 'Pola Hidup Sehat', 7),
('Pengobatan hipertensi sebaiknya dilakukan bagaimana?', '["Menghentikan obat saat tekanan normal","Minum obat sesuai anjuran dokter secara teratur","Mengganti obat sendiri","Hanya dengan jamu"]'::jsonb, 1, 'Pengobatan hipertensi harus dilakukan teratur sesuai anjuran dokter, tidak boleh berhenti sendiri saat tekanan darah sudah normal.', 'Pengobatan', 8),
('Manakah pernyataan yang BENAR tentang hipertensi?', '["Hipertensi hanya menyerang orang tua","Hipertensi bisa terjadi pada semua usia","Hipertensi tidak berbahaya","Hipertensi tidak perlu diperiksa"]'::jsonb, 1, 'Hipertensi dapat terjadi pada semua usia, termasuk usia produktif. Semakin dini dideteksi, semakin baik pengelolaannya.', 'Mitos & Fakta', 9),
('Aktivitas fisik yang dianjurkan untuk penderita hipertensi adalah?', '["Olahraga berat setiap hari","Tidak boleh olahraga sama sekali","Aktivitas fisik sedang 30 menit/hari, 5x/minggu","Hanya angkat beban maksimal"]'::jsonb, 2, 'Aktivitas fisik sedang seperti jalan cepat, bersepeda santai, atau berenang selama 30 menit per hari, 5 kali seminggu dianjurkan untuk penderita hipertensi.', 'Pola Hidup Sehat', 10)
ON CONFLICT DO NOTHING;
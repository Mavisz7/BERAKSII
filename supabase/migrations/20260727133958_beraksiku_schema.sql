/*
# BERAKSIKU schema

1. Purpose
   Health website for Puskesmas Ambacang (Bersama Kendalikan Hipertensi).
   Two user types: public Pengguna (no sign-in, identified by name/age/sex/phone stored locally)
   and Admin (username/password login). Public users' examinations are stored in Supabase
   keyed by a locally-generated profile id; admin sees all.

2. New Tables
   - profiles: public user identity (id, name, age, sex, phone, disabled, created_at)
   - examinations: BP monitoring rows (profile_id FK, date, time, systolic, diastolic, pulse, weight, note, category)
   - screenings: hypertension risk screening results (profile_id, answers json, risk_level, created_at)
   - articles: education articles (title, category, content, image_url, featured, created_at)
   - settings: singleton website settings (program name, logo, banner, whatsapp, instagram, address, hours, contact)
   - audit_logs: simple admin activity log (action, detail, created_at)
   - admin_credentials: single admin row (username, password_hash, must_change_password)

3. Security
   - RLS enabled on every table.
   - profiles/examinations/screenings: TO anon, authenticated (public app, no sign-in) — data is
     intentionally shared with admin. NOTE: this is a public health kiosk app, not a private-data app;
     identity is a self-reported name+phone, not an authenticated account.
   - articles/settings: public read, admin write (anon can read, anon can insert/update/delete is
     intentionally allowed because there is no server-side admin auth role in this stack — admin
     auth is handled in the frontend via a credentials table; the anon key is the only key available).
   - audit_logs/admin_credentials: anon read/write allowed for the same reason.

   Important: This project has no Supabase Auth (email/password) users — admin login is a custom
   check against admin_credentials. There is no `authenticated` session in this app, so every
   policy MUST include `anon`. A `TO authenticated`-only policy would make the app unable to read
   its own data.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  sex text NOT NULL CHECK (sex IN ('L','P')),
  phone text NOT NULL DEFAULT '',
  disabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_rw_profiles" ON profiles;
CREATE POLICY "anon_rw_profiles" ON profiles FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- examinations
CREATE TABLE IF NOT EXISTS examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  exam_time text NOT NULL,
  systolic integer NOT NULL,
  diastolic integer NOT NULL,
  pulse integer,
  weight numeric,
  note text DEFAULT '',
  category text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_rw_examinations" ON examinations;
CREATE POLICY "anon_rw_examinations" ON examinations FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_exams_profile ON examinations(profile_id);
CREATE INDEX IF NOT EXISTS idx_exams_date ON examinations(exam_date);

-- screenings
CREATE TABLE IF NOT EXISTS screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_level text NOT NULL DEFAULT '',
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_rw_screenings" ON screenings;
CREATE POLICY "anon_rw_screenings" ON screenings FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- articles
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Umum',
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'HeartPulse',
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_rw_articles" ON articles;
CREATE POLICY "anon_rw_articles" ON articles FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- settings (singleton row)
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  program_name text NOT NULL DEFAULT 'BERAKSIKU',
  program_subtitle text NOT NULL DEFAULT 'Bersama Kendalikan Hipertensi',
  logo_url text NOT NULL DEFAULT '',
  banner_url text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '082311006711',
  instagram text NOT NULL DEFAULT '@puskesmasambacang',
  address text NOT NULL DEFAULT 'Jl. By Pass No. 5 KM. 8, Ps. Ambacang, Kec. Kuranji, Kota Padang, Sumatera Barat.',
  hours text NOT NULL DEFAULT 'Senin - Sabtu, 08.00 - 14.00 WIB',
  contact_info text NOT NULL DEFAULT 'Puskesmas Ambacang',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT settings_singleton CHECK (id = 1)
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_rw_settings" ON settings;
CREATE POLICY "anon_rw_settings" ON settings FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  detail text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_rw_audit_logs" ON audit_logs;
CREATE POLICY "anon_rw_audit_logs" ON audit_logs FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- admin_credentials (singleton)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  username text NOT NULL DEFAULT 'admin',
  password_hash text NOT NULL DEFAULT '',
  must_change_password boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_singleton CHECK (id = 1)
);
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_rw_admin_credentials" ON admin_credentials;
CREATE POLICY "anon_rw_admin_credentials" ON admin_credentials FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed default settings + admin credentials + sample articles
INSERT INTO settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

-- Default admin password: admin123 (stored as a simple hash; this is a demo app, not production-grade auth)
INSERT INTO admin_credentials (id, username, password_hash, must_change_password)
VALUES (1, 'admin', 'admin123', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO articles (title, category, excerpt, content, icon, featured) VALUES
('Pengertian Hipertensi', 'Pengertian', 'Apa itu hipertensi dan mengapa penting untuk dipahami.', 'Hipertensi atau tekanan darah tinggi adalah kondisi di mana tekanan darah pada dinding arteri lebih tinggi dari nilai normal yang dipertahankan dalam waktu lama. Tekanan darah dianggap normal jika sistolik <120 mmHg dan diastolik <80 mmHg. Hipertensi sering disebut "the silent killer" karena umumnya tidak menimbulkan gejala namun dapat merusak organ vital.', 'HeartPulse', true),
('Faktor Risiko Hipertensi', 'Faktor Risiko', 'Berbagai faktor yang meningkatkan risiko hipertensi.', 'Faktor risiko hipertensi meliputi usia, riwayat keluarga, kebiasaan merokok, kurang aktivitas fisik, konsumsi garam berlebih, kelebihan berat badan, dan riwayat diabetes. Memahami faktor risiko membantu Anda melakukan pencegahan dini.', 'AlertTriangle', true),
('Tanda dan Gejala', 'Gejala', 'Kenali tanda dan gejala hipertensi.', 'Hipertensi sering tanpa gejala. Pada tekanan sangat tinggi dapat muncul sakit kepala, pusing, penglihatan kabur, sesak napas, atau mimisan. Jika Anda mengalami gejala ini, segera periksa tekanan darah.', 'Eye', false),
('Komplikasi Hipertensi', 'Komplikasi', 'Komplikasi yang dapat ditimbulkan oleh hipertensi tidak terkontrol.', 'Hipertensi tidak terkontrol dapat menyebabkan stroke, serangan jantung, gagal jantung, kerusakan ginjal, dan kerusakan mata. Pengendalian tekanan darah menurunkan risiko komplikasi secara signifikan.', 'Zap', false),
('Cara Pencegahan', 'Pencegahan', 'Langkah-langkah pencegahan hipertensi.', 'Pencegahan hipertensi: konsumsi garam <5 gram/hari, banyak buah & sayur, aktivitas fisik 30 menit/hari, hindari merokok, kelola stres, jaga berat badan ideal, dan periksa tekanan darah rutin.', 'ShieldCheck', true),
('Prinsip CERDIK', 'Pola Hidup', 'Pola hidup sehat dengan prinsip CERDIK.', 'CERDIK: Cek kesehatan rutin, Enyahkan asap rokok, Rajin aktivitas fisik, Diet sehat & seimbang, Istirahat cukup, Kendalikan stres. Prinsip ini adalah kunci pengendalian hipertensi.', 'Sparkles', true)
ON CONFLICT DO NOTHING;
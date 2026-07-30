import { useCallback, useEffect, useState } from 'react';
import type { QuizQuestion, QuizResult, QuizAnswer, Badge } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

const LS_QUESTIONS = 'beraksiku_quiz_questions';
const LS_RESULTS = 'beraksiku_quiz_results';

const fallbackQuestions: QuizQuestion[] = [
  { id: 'q1', question: 'Apa yang dimaksud dengan hipertensi?', options: ['Penyakit tekanan darah rendah', 'Kondisi tekanan darah tinggi yang persisten', 'Penyakit jantung bawaan', 'Gangguan pencernaan'], correct_index: 1, explanation: 'Hipertensi adalah kondisi di mana tekanan darah pada dinding arteri lebih tinggi dari nilai normal dalam waktu lama.', category: 'Pengertian', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'q2', question: 'Berapa batas tekanan darah yang dikategorikan hipertensi menurut JNC 7?', options: ['<120/80 mmHg', '120-139/80-89 mmHg', '>= 140/90 mmHg', '< 100/60 mmHg'], correct_index: 2, explanation: 'Menurut JNC 7, hipertensi didefinisikan sebagai tekanan darah >= 140/90 mmHg.', category: 'Pemeriksaan Tekanan Darah', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'q3', question: 'Manakah faktor risiko utama hipertensi yang dapat diubah?', options: ['Usia', 'Riwayat keluarga', 'Kebiasaan merokok', 'Jenis kelamin'], correct_index: 2, explanation: 'Merokok adalah faktor risiko yang dapat diubah, sedangkan usia, riwayat keluarga, dan jenis kelamin tidak dapat diubah.', category: 'Faktor Risiko', sort_order: 3, created_at: new Date().toISOString() },
  { id: 'q4', question: 'Gejala apa yang sering muncul pada tekanan darah sangat tinggi?', options: ['Tidak ada gejala sama sekali', 'Sakit kepala, pusing, penglihatan kabur', 'Nafsu makan meningkat', 'Sering tertawa'], correct_index: 1, explanation: 'Pada tekanan darah sangat tinggi dapat muncul sakit kepala, pusing, penglihatan kabur, dan sesak napas.', category: 'Gejala', sort_order: 4, created_at: new Date().toISOString() },
  { id: 'q5', question: 'Komplikasi serius yang dapat ditimbulkan hipertensi tidak terkontrol adalah?', options: ['Batuk pilek', 'Stroke dan serangan jantung', 'Kulit kering', 'Rambut rontok'], correct_index: 1, explanation: 'Hipertensi tidak terkontrol dapat menyebabkan stroke, serangan jantung, gagal jantung, kerusakan ginjal, dan kerusakan mata.', category: 'Komplikasi', sort_order: 5, created_at: new Date().toISOString() },
  { id: 'q6', question: 'Apa kepanjangan dari CERDIK dalam pencegahan hipertensi?', options: ['Cek, Enyahkan, Rajin, Diet, Istirahat, Kendalikan', 'Cuci, Esok, Rutin, Dagang, Ibadah, Kerja', 'Cegah, Edukasi, Rawat, Damai, Indah, Kuat', 'Cita-cita, Ekonomi, Rasa, Doa, Iman, Kebijaksanaan'], correct_index: 0, explanation: 'CERDIK: Cek kesehatan rutin, Enyahkan asap rokok, Rajin aktivitas fisik, Diet sehat, Istirahat cukup, Kendalikan stres.', category: 'CERDIK', sort_order: 6, created_at: new Date().toISOString() },
  { id: 'q7', question: 'Berapa batas konsumsi garam per hari yang dianjurkan untuk mencegah hipertensi?', options: ['Tidak perlu membatasi', '< 5 gram (1 sendok teh)', '20 gram per hari', '50 gram per hari'], correct_index: 1, explanation: 'WHO merekomendasikan konsumsi garam kurang dari 5 gram (1 sendok teh) per hari untuk mencegah hipertensi.', category: 'Pola Hidup Sehat', sort_order: 7, created_at: new Date().toISOString() },
  { id: 'q8', question: 'Pengobatan hipertensi sebaiknya dilakukan bagaimana?', options: ['Menghentikan obat saat tekanan normal', 'Minum obat sesuai anjuran dokter secara teratur', 'Mengganti obat sendiri', 'Hanya dengan jamu'], correct_index: 1, explanation: 'Pengobatan hipertensi harus dilakukan teratur sesuai anjuran dokter, tidak boleh berhenti sendiri saat tekanan darah sudah normal.', category: 'Pengobatan', sort_order: 8, created_at: new Date().toISOString() },
  { id: 'q9', question: 'Manakah pernyataan yang BENAR tentang hipertensi?', options: ['Hipertensi hanya menyerang orang tua', 'Hipertensi bisa terjadi pada semua usia', 'Hipertensi tidak berbahaya', 'Hipertensi tidak perlu diperiksa'], correct_index: 1, explanation: 'Hipertensi dapat terjadi pada semua usia, termasuk usia produktif. Semakin dini dideteksi, semakin baik pengelolaannya.', category: 'Mitos & Fakta', sort_order: 9, created_at: new Date().toISOString() },
  { id: 'q10', question: 'Aktivitas fisik yang dianjurkan untuk penderita hipertensi adalah?', options: ['Olahraga berat setiap hari', 'Tidak boleh olahraga sama sekali', 'Aktivitas fisik sedang 30 menit/hari, 5x/minggu', 'Hanya angkat beban maksimal'], correct_index: 2, explanation: 'Aktivitas fisik sedang seperti jalan cepat, bersepeda santai, atau berenang selama 30 menit per hari, 5 kali seminggu dianjurkan untuk penderita hipertensi.', category: 'Pola Hidup Sehat', sort_order: 10, created_at: new Date().toISOString() },
];

function loadLocalQuestions(): QuizQuestion[] {
  const saved = localStorage.getItem(LS_QUESTIONS);
  return saved ? (JSON.parse(saved) as QuizQuestion[]) : fallbackQuestions;
}

function loadLocalResults(): QuizResult[] {
  const saved = localStorage.getItem(LS_RESULTS);
  return saved ? (JSON.parse(saved) as QuizResult[]) : [];
}

export function useQuizQuestions() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) { setQuestions(loadLocalQuestions()); setLoading(false); return; }
    const { data } = await supabase.from('quiz_questions').select('*').order('sort_order', { ascending: true });
    if (data && (data as QuizQuestion[]).length) {
      setQuestions(data as QuizQuestion[]);
    } else {
      setQuestions(fallbackQuestions);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  async function add(q: Omit<QuizQuestion, 'id' | 'created_at'>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quiz_questions').insert(q).select().single();
      if (error) throw new Error(error.message);
      setQuestions((prev) => [...prev, data as QuizQuestion].sort((a, b) => a.sort_order - b.sort_order));
      return data as QuizQuestion;
    }
    const row: QuizQuestion = { ...q, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const next = [...loadLocalQuestions(), row];
    localStorage.setItem(LS_QUESTIONS, JSON.stringify(next));
    setQuestions(next);
    return row;
  }

  async function update(id: string, patch: Partial<QuizQuestion>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quiz_questions').update(patch).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      setQuestions((prev) => prev.map((q) => (q.id === id ? (data as QuizQuestion) : q)).sort((a, b) => a.sort_order - b.sort_order));
      return;
    }
    const next = loadLocalQuestions().map((q) => (q.id === id ? { ...q, ...patch } : q));
    localStorage.setItem(LS_QUESTIONS, JSON.stringify(next));
    setQuestions(next);
  }

  async function remove(id: string) {
    if (isSupabaseConfigured) await supabase.from('quiz_questions').delete().eq('id', id);
    else { localStorage.setItem(LS_QUESTIONS, JSON.stringify(loadLocalQuestions().filter((q) => q.id !== id))); }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  return { questions, loading, refetch, add, update, remove };
}

export function useQuizResults() {
  const { profile } = useUser();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!profile) { setResults([]); setLoading(false); return; }
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });
      setResults((data as QuizResult[]) ?? []);
    } else {
      const all = loadLocalResults().filter((r) => r.profile_id === profile.id);
      all.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
      setResults(all);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => { refetch(); }, [refetch]);

  async function save(result: Omit<QuizResult, 'id' | 'created_at'>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quiz_results').insert(result).select().single();
      if (error) throw new Error(error.message);
      setResults((prev) => [data as QuizResult, ...prev]);
      return data as QuizResult;
    }
    const row: QuizResult = { ...result, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const next = [row, ...loadLocalResults()];
    localStorage.setItem(LS_RESULTS, JSON.stringify(next));
    setResults((prev) => [row, ...prev]);
    return row;
  }

  return { results, loading, refetch, save };
}

export function computeBadges(results: QuizResult[]): Badge[] {
  const count = results.length;
  const has90 = results.some((r) => r.score >= 90);
  const has100 = results.some((r) => r.score >= 100);
  return [
    { key: 'pemula', label: 'Pemula', description: 'Menyelesaikan quiz pertama', icon: 'Award', earned: count >= 1 },
    { key: 'pembelajar', label: 'Pembelajar Aktif', description: 'Menyelesaikan quiz 3 kali', icon: 'BookOpen', earned: count >= 3 },
    { key: 'sahabat', label: 'Sahabat BERAKSI', description: 'Memperoleh nilai minimal 90', icon: 'Heart', earned: has90 },
    { key: 'ahli', label: 'Ahli Hipertensi', description: 'Memperoleh nilai 100', icon: 'Crown', earned: has100 },
  ];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffleQuestion(q: QuizQuestion): QuizQuestion {
  const indices = [0, 1, 2, 3];
  const shuffled = shuffleArray(indices);
  const newOptions = shuffled.map((i) => q.options[i]);
  const newCorrect = shuffled.indexOf(q.correct_index);
  return { ...q, options: newOptions, correct_index: newCorrect };
}

export function getResultCategory(score: number): string {
  if (score >= 90) return 'Sangat Baik';
  if (score >= 80) return 'Baik';
  if (score >= 70) return 'Cukup';
  return 'Perlu Belajar Lagi';
}

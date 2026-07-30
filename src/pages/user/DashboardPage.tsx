import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, ClipboardCheck, BookOpen, Activity, History, LineChart,
  ArrowRight, ShieldCheck, Stethoscope, Phone, Brain, Award, Crown, Heart,
  Video, CalendarDays, TrendingUp, TrendingDown, Minus, Bell, Play,
  Sparkles, Lightbulb, ChevronRight, Building2, User as UserIcon,
} from 'lucide-react';
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useUser } from '@/contexts/UserContext';
import { useSettings } from '@/hooks/useSettings';
import { useExaminations } from '@/hooks/useExaminations';
import { useQuizResults, computeBadges } from '@/hooks/useQuiz';
import { useVideos, getLastWatched } from '@/hooks/useVideos';
import { bpCategoryBg, bpCategoryText } from '@/lib/bp';
import { formatDate, formatBP } from '@/lib/format';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Article } from '@/lib/types';

const quickActions = [
  { to: '/skrining', label: 'Skrining Hipertensi', desc: 'Cek risiko hipertensimu', icon: ClipboardCheck, color: 'from-brand-500 to-brand-600' },
  { to: '/monitoring', label: 'Monitoring', desc: 'Catat tekanan darah', icon: Activity, color: 'from-accent-500 to-accent-600' },
  { to: '/video', label: 'Video Edukasi', desc: 'Tonton video kesehatan', icon: Video, color: 'from-cyan-500 to-accent-500' },
  { to: '/edukasi', label: 'Materi Edukasi', desc: 'Pelajari hipertensi', icon: BookOpen, color: 'from-brand-500 to-leaf-600' },
  { to: '/quiz', label: 'Quiz Edukasi', desc: 'Uji pemahamanmu', icon: Brain, color: 'from-violet-500 to-brand-500' },
  { to: '/grafik', label: 'Grafik Tekanan Darah', desc: 'Pantau perkembangan', icon: LineChart, color: 'from-accent-500 to-brand-500' },
  { to: '/kontak', label: 'Profil Puskesmas', desc: 'Hubungi kami', icon: Building2, color: 'from-slate-500 to-slate-700' },
  { to: '/riwayat', label: 'Profil Saya', desc: 'Riwayat pemeriksaan', icon: UserIcon, color: 'from-amber-500 to-orange-500' },
];

const fallbackArticles: Article[] = [
  { id: '1', title: 'Pengertian Hipertensi', category: 'Pengertian', excerpt: 'Apa itu hipertensi dan mengapa penting untuk dipahami.', content: '', image_url: '', icon: 'HeartPulse', featured: true, created_at: '' },
  { id: '2', title: 'Faktor Risiko Hipertensi', category: 'Faktor Risiko', excerpt: 'Berbagai faktor yang meningkatkan risiko hipertensi.', content: '', image_url: '', icon: 'ShieldCheck', featured: true, created_at: '' },
  { id: '5', title: 'Cara Pencegahan', category: 'Pencegahan', excerpt: 'Langkah pencegahan hipertensi yang bisa Anda lakukan.', content: '', image_url: '', icon: 'Sparkles', featured: true, created_at: '' },
];

const dailyTips = [
  'Batasi konsumsi garam maksimal 1 sendok teh per hari.',
  'Luangkan waktu berjalan kaki minimal 30 menit setiap hari.',
  'Konsumsi lebih banyak buah dan sayur segar.',
  'Kurangi stres dengan relaksasi dan tidur cukup.',
  'Hindari merokok dan asap rokok untuk jantung sehat.',
  'Periksa tekanan darah secara rutin, minimal sebulan sekali.',
  'Jaga berat badan ideal dengan pola makan seimbang.',
  'Batasi konsumsi kafein dan minuman manis.',
];

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function todayString() {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function tipOfDay() {
  const day = new Date().getDate();
  return dailyTips[day % dailyTips.length];
}

export function DashboardPage() {
  const { profile, loading } = useUser();
  const { settings } = useSettings();
  const { exams } = useExaminations();
  const { results: quizResults } = useQuizResults();
  const { videos } = useVideos();
  const [articles, setArticles] = useState<Article[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
        if (isSupabaseConfigured) {
          const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false }).limit(3);
          setArticles((data as Article[])?.length ? (data as Article[]) : fallbackArticles);
        } else {
          setArticles(fallbackArticles);
        }
      } catch {
        setArticles(fallbackArticles);
      }
    })();
  }, []);

  if (loading) return <PageLoader />;

  const latest = exams[0];
  const prev = exams[1];
  const latestQuiz = quizResults[0];
  const badges = computeBadges(quizResults);
  const badgeIcons: Record<string, typeof Award> = { Award, BookOpen, Heart, Crown };
  const lastWatched = getLastWatched();
  const recentVideos = videos.slice(0, 3);

  // Health Score: based on activities
  const activities = {
    screening: Boolean(localStorage.getItem('beraksiku_last_screening')),
    education: articles.length > 0,
    video: Boolean(lastWatched),
    quiz: quizResults.length > 0,
    monitoring: exams.length > 0,
  };
  const activityCount = Object.values(activities).filter(Boolean).length;
  useEffect(() => {
    const target = Math.round((activityCount / 5) * 100);
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      setScore(cur);
    }, 20);
    return () => clearInterval(t);
  }, [activityCount]);

  // Progress BERAKSI (6 activities)
  const progressItems = [
    { label: 'Sudah Skrining', done: activities.screening },
    { label: 'Sudah Baca Edukasi', done: activities.education },
    { label: 'Sudah Tonton Video', done: activities.video },
    { label: 'Sudah Kerjakan Quiz', done: activities.quiz },
    { label: 'Sudah Monitoring TD', done: activities.monitoring },
  ];
  const progressDone = progressItems.filter((p) => p.done).length;
  const progressPct = Math.round((progressDone / progressItems.length) * 100);

  // BP change
  let bpChange: { dir: 'up' | 'down' | 'stable'; text: string } | null = null;
  if (latest && prev) {
    const diff = latest.systolic - prev.systolic;
    if (diff > 0) bpChange = { dir: 'up', text: `Naik ${diff} mmHg` };
    else if (diff < 0) bpChange = { dir: 'down', text: `Turun ${Math.abs(diff)} mmHg` };
    else bpChange = { dir: 'stable', text: 'Stabil' };
  }

  // Mini chart data (last 7, reversed to chronological)
  const chartData = useMemo(() => {
    return exams.slice(0, 7).reverse().map((e) => ({
      date: formatDate(e.exam_date).slice(0, 5),
      Sistolik: e.systolic,
      Diastolik: e.diastolic,
    }));
  }, [exams]);

  // Reminder logic
  let reminder: { text: string; tone: 'info' | 'success' | 'warning' };
  if (!latest) {
    reminder = { text: 'Ayo lakukan pemeriksaan tekanan darah pertamamu.', tone: 'info' };
  } else {
    const days = Math.floor((Date.now() - new Date(latest.exam_date).getTime()) / 86400000);
    if (days >= 30) reminder = { text: `Sudah ${days} hari sejak pemeriksaan terakhir. Ayo periksa kembali.`, tone: 'warning' };
    else if (days >= 7) reminder = { text: `Sudah ${days} hari sejak pemeriksaan terakhir. Ayo lakukan pemeriksaan minggu ini.`, tone: 'info' };
    else reminder = { text: 'Pertahankan kebiasaan baikmu.', tone: 'success' };
  }

  const healthScoreStatus = score >= 80 ? 'Baik' : score >= 60 ? 'Cukup' : score >= 40 ? 'Perlu Aktif' : 'Mulai Aktif';
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#0ea5e9' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 text-white p-6 sm:p-8 shadow-xl shadow-brand-600/20 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-4 bottom-0 opacity-10"><HeartPulse className="w-32 h-32" /></div>
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-white/80 text-sm mb-1 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" /> {todayString()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1">
              Halo, {profile?.name?.split(' ')[0] ?? 'Pengguna'} 👋
            </h1>
            <p className="text-white/85">Selamat datang di {settings.program_name || 'BERAKSIKU'}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="relative p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 transition-colors" aria-label="Notifikasi">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-warning-400 ring-2 ring-brand-700" />
            </button>
            {profile && (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl font-bold ring-2 ring-white/30">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HEALTH SUMMARY */}
      {profile && (
        <section className="animate-slide-up">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-brand-500" /> Ringkasan Kesehatan Saya
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* BP */}
            <div className="card p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-rose-500" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Tekanan Darah Terakhir</p>
              </div>
              {latest ? (
                <>
                  <p className="text-2xl font-extrabold mb-1">{formatBP(latest.systolic, latest.diastolic)}</p>
                  <span className={`badge ${bpCategoryBg[latest.category]}`}>{latest.category}</span>
                </>
              ) : (
                <p className="text-sm text-slate-400 py-2">Belum ada data</p>
              )}
            </div>
            {/* Pulse */}
            <div className="card p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-accent-500" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Denyut Nadi Terakhir</p>
              </div>
              {latest?.pulse ? (
                <p className="text-2xl font-extrabold">{latest.pulse} <span className="text-sm font-normal text-slate-400">bpm</span></p>
              ) : (
                <p className="text-sm text-slate-400 py-2">Belum ada data</p>
              )}
            </div>
            {/* Last exam */}
            <div className="card p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-brand-500" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Pemeriksaan Terakhir</p>
              </div>
              {latest ? (
                <>
                  <p className="text-lg font-bold">{formatDate(latest.exam_date)}</p>
                  <p className="text-xs text-slate-400">{latest.exam_time}</p>
                </>
              ) : (
                <p className="text-sm text-slate-400 py-2">Belum ada data</p>
              )}
            </div>
            {/* Change */}
            <div className="card p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  {bpChange?.dir === 'up' ? <TrendingUp className="w-5 h-5 text-danger-500" />
                    : bpChange?.dir === 'down' ? <TrendingDown className="w-5 h-5 text-brand-500" />
                    : <Minus className="w-5 h-5 text-slate-400" />}
                </div>
                <p className="text-xs text-slate-500 font-medium">Perubahan</p>
              </div>
              {bpChange ? (
                <p className={`text-lg font-bold ${bpChange.dir === 'up' ? 'text-danger-600 dark:text-danger-400' : bpChange.dir === 'down' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'}`}>
                  {bpChange.text}
                </p>
              ) : (
                <p className="text-sm text-slate-400 py-2">Belum ada perbandingan</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* HEALTH SCORE + PROGRESS */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Health Score */}
        <div className="card p-6 lg:col-span-1 animate-slide-up">
          <h2 className="font-bold text-lg mb-1">Health Score</h2>
          <p className="text-xs text-slate-500 mb-4">Indikator edukasi, bukan diagnosis medis.</p>
          <div className="flex flex-col items-center">
            <ProgressCircle value={score} color={scoreColor} />
            <p className="text-sm font-semibold mt-3" style={{ color: scoreColor }}>{healthScoreStatus}</p>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            Skor dihitung berdasarkan aktivitas: skrining, monitoring, edukasi, video, dan quiz.
          </p>
          {activityCount === 0 && (
            <p className="text-xs text-brand-600 dark:text-brand-400 text-center mt-2 font-medium">
              Mulai gunakan fitur BERAKSIKU untuk mendapatkan Health Score.
            </p>
          )}
        </div>

        {/* Progress BERAKSI */}
        <div className="card p-6 lg:col-span-2 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Progress BERAKSI</h2>
            <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">{progressPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-5">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-sm text-slate-500 mb-4">{progressDone} dari {progressItems.length} aktivitas selesai.</p>
          <div className="space-y-2.5">
            {progressItems.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${p.done ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  {p.done ? '✓' : ''}
                </div>
                <span className={`text-sm ${p.done ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="animate-slide-up">
        <h2 className="font-bold text-lg mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.to} to={a.to} className="card p-5 group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold text-sm mb-0.5 group-hover:text-brand-600 transition-colors">{a.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MINI CHART */}
      <section className="card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <LineChart className="w-5 h-5 text-brand-500" /> Grafik Mini Tekanan Darah
          </h2>
          <Link to="/grafik" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">Lihat detail</Link>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <ReLineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="Sistolik" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="Diastolik" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </ReLineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={<LineChart className="w-8 h-8" />}
            title="Belum ada data pemeriksaan"
            message="Mulai catat tekanan darahmu untuk melihat grafik perkembangan."
            action={<Link to="/monitoring" className="btn-primary">Catat Pemeriksaan <ArrowRight className="w-4 h-4" /></Link>}
          />
        )}
      </section>

      {/* VIDEO TERBARU + ARTIKEL TERBARU */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Videos */}
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2"><Video className="w-5 h-5 text-accent-500" /> Video Edukasi Terbaru</h2>
            <Link to="/video" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {recentVideos.map((v) => (
              <Link key={v.id} to={`/video/${v.id}`} className="card p-3 flex gap-3 group hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
                <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-7 h-7 text-white" fill="currentColor" />
                  </div>
                  <span className="absolute bottom-1 right-1 text-[10px] font-mono bg-black/70 text-white px-1.5 py-0.5 rounded">{v.duration}</span>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="font-semibold text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">{v.title}</p>
                  <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300 mt-1">{v.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-brand-500" /> Edukasi Terbaru</h2>
            <Link to="/edukasi" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {articles.map((a) => (
              <Link key={a.id} to="/edukasi" className="card p-4 group hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-leaf-500 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">{a.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{a.excerpt}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* QUIZ TERAKHIR + BADGES */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Quiz */}
        <div className="card p-6 animate-slide-up">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-violet-500" /> Hasil Quiz Terakhir
          </h2>
          {latestQuiz ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                  <p className={`text-2xl font-extrabold ${latestQuiz.passed ? 'text-brand-600 dark:text-brand-400' : 'text-danger-600 dark:text-danger-400'}`}>{latestQuiz.score}</p>
                  <p className="text-xs text-slate-500">Nilai</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                  <p className="text-sm font-bold pt-1">{latestQuiz.category}</p>
                  <p className="text-xs text-slate-500">Kategori</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                  <p className="text-sm font-bold pt-1">{formatDate(latestQuiz.created_at?.slice(0, 10) ?? '')}</p>
                  <p className="text-xs text-slate-500">Tanggal</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/riwayat-quiz" className="btn-ghost text-sm py-2 flex-1">Detail</Link>
                <Link to="/quiz" className="btn-primary text-sm py-2 flex-1">Ulangi Quiz</Link>
              </div>
            </>
          ) : (
            <EmptyState
              icon={<Brain className="w-8 h-8" />}
              title="Belum ada quiz"
              message="Kerjakan quiz pertamamu untuk mengukur pemahaman."
              action={<Link to="/quiz" className="btn-primary">Mulai Quiz <ArrowRight className="w-4 h-4" /></Link>}
            />
          )}
        </div>

        {/* Badges */}
        <div className="card p-6 animate-slide-up">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" /> Pencapaian Saya
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((b) => {
              const Icon = badgeIcons[b.icon] ?? Award;
              return (
                <div key={b.key} className={`rounded-2xl p-3 text-center transition-all ${b.earned ? 'bg-gradient-to-br from-amber-50 to-brand-50 dark:from-amber-500/10 dark:to-brand-500/10 border border-amber-200 dark:border-amber-500/30' : 'bg-slate-50 dark:bg-slate-800/50 opacity-50'}`}>
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${b.earned ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold">{b.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PENGINGAT + TIPS */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Reminder */}
        <div className={`card p-6 animate-slide-up border-l-4 ${reminder.tone === 'warning' ? 'border-l-warning-500' : reminder.tone === 'success' ? 'border-l-brand-500' : 'border-l-accent-500'}`}>
          <h2 className="font-bold text-lg flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-brand-500" /> Pengingat
          </h2>
          <p className="text-slate-600 dark:text-slate-300">{reminder.text}</p>
          {reminder.tone !== 'success' && (
            <Link to="/monitoring" className="btn-primary text-sm py-2 mt-4">Catat Sekarang <ArrowRight className="w-4 h-4" /></Link>
          )}
        </div>

        {/* Tips */}
        <div className="card p-6 animate-slide-up bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-500/10 dark:to-accent-500/10">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-amber-500" /> Tips Hari Ini
          </h2>
          <p className="text-slate-700 dark:text-slate-200 font-medium">{tipOfDay()}</p>
        </div>
      </section>

      {/* FOOTER DASHBOARD */}
      <footer className="text-center py-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-sm">{settings.program_name || 'BERAKSIKU'}</p>
            <p className="text-xs text-slate-500">{settings.program_subtitle || 'Bersama Kendalikan Hipertensi'}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">{settings.contact_info || 'Puskesmas Ambacang'} — {settings.address || 'Kota Padang'}</p>
      </footer>
    </div>
  );
}

function ProgressCircle({ value, color }: { value: number; color: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-800" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color }}>{value}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import {
  HeartPulse, ClipboardCheck, BookOpen, Activity, History, LineChart,
  ArrowRight, ShieldCheck, Activity as ActivityIcon, Stethoscope, Phone, Brain, Award, Crown, Heart, BookOpen as BookIcon,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useSettings } from '@/hooks/useSettings';
import { useExaminations } from '@/hooks/useExaminations';
import { useQuizResults, computeBadges } from '@/hooks/useQuiz';
import { bpCategoryBg } from '@/lib/bp';
import { formatDate, formatBP } from '@/lib/format';
import { PageLoader } from '@/components/ui/Spinner';

const quickActions = [
  { to: '/skrining', label: 'Skrining Hipertensi', desc: 'Cek risiko hipertensimu', icon: ClipboardCheck, color: 'from-brand-500 to-brand-600' },
  { to: '/edukasi', label: 'Edukasi', desc: 'Pelajari tentang hipertensi', icon: BookOpen, color: 'from-leaf-500 to-leaf-600' },
  { to: '/quiz', label: 'Quiz Edukasi', desc: 'Uji pemahamanmu', icon: Brain, color: 'from-violet-500 to-brand-500' },
  { to: '/monitoring', label: 'Monitoring', desc: 'Catat tekanan darah', icon: Activity, color: 'from-cyan-500 to-brand-500' },
  { to: '/riwayat', label: 'Riwayat Monitoring', desc: 'Lihat pemeriksaan', icon: History, color: 'from-amber-500 to-orange-500' },
  { to: '/grafik', label: 'Grafik Tekanan Darah', desc: 'Pantau perkembangan', icon: LineChart, color: 'from-violet-500 to-brand-500' },
  { to: '/kontak', label: 'Kontak Puskesmas', desc: 'Hubungi kami', icon: Phone, color: 'from-slate-500 to-slate-700' },
];

export function DashboardPage() {
  const { profile, loading } = useUser();
  const { settings } = useSettings();
  const { exams } = useExaminations();
  const { results: quizResults } = useQuizResults();

  if (loading) return <PageLoader />;
  const latest = exams[0];
  const latestQuiz = quizResults[0];
  const badges = computeBadges(quizResults);
  const badgeIcons: Record<string, typeof Award> = { Award, BookOpen: BookIcon, Heart, Crown };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-leaf-700 text-white p-6 sm:p-10 shadow-xl shadow-brand-600/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-8 bottom-0 opacity-20"><HeartPulse className="w-40 h-40" /></div>
        <div className="relative max-w-2xl">
          <span className="badge bg-white/20 text-white mb-3">Program {settings.program_name}</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
            {settings.program_name}
          </h1>
          <p className="text-white/90 text-lg mb-5">{settings.program_subtitle}</p>
          <p className="text-white/80 mb-6 max-w-xl">
            Media edukasi, skrining, monitoring, dan pencatatan hipertensi milik {settings.contact_info}.
            Kendalikan tekanan darahmu mulai hari ini.
          </p>
          <div className="flex flex-wrap gap-3">
            {!profile ? (
              <>
                <Link to="/daftar" className="btn bg-white text-brand-700 hover:bg-white/90 px-5 py-3">
                  Mulai Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/skrining" className="btn bg-white/15 text-white hover:bg-white/25 px-5 py-3">
                  Cek Risiko
                </Link>
              </>
            ) : (
              <Link to="/monitoring" className="btn bg-white text-brand-700 hover:bg-white/90 px-5 py-3">
                Catat Pemeriksaan <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Latest result */}
      {profile && latest && (
        <section className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-brand-500" /> Hasil Pemeriksaan Terakhir
            </h2>
            <Link to="/riwayat" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <p className="text-xs text-slate-500 mb-1">Tekanan Darah</p>
              <p className="text-2xl font-bold">{formatBP(latest.systolic, latest.diastolic)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <p className="text-xs text-slate-500 mb-1">Tanggal</p>
              <p className="text-lg font-semibold">{formatDate(latest.exam_date)}</p>
              <p className="text-xs text-slate-500">{latest.exam_time}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col justify-center">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <span className={`badge w-fit ${bpCategoryBg[latest.category]}`}>{latest.category}</span>
            </div>
          </div>
        </section>
      )}

      {/* Latest quiz result + badges */}
      {profile && (latestQuiz || badges.some((b) => b.earned)) && (
        <section className="grid md:grid-cols-2 gap-6">
          {latestQuiz && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-violet-500" /> Hasil Quiz Terakhir
                </h2>
                <Link to="/riwayat-quiz" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">
                  Lihat semua
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
                  <p className={`text-3xl font-extrabold ${latestQuiz.passed ? 'text-leaf-600 dark:text-leaf-400' : 'text-rose-600 dark:text-rose-400'}`}>{latestQuiz.score}</p>
                  <p className="text-xs text-slate-500">Nilai</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
                  <p className="text-sm font-bold">{latestQuiz.category}</p>
                  <p className="text-xs text-slate-500">Kategori</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
                  <p className="text-sm font-bold">{formatDate(latestQuiz.created_at?.slice(0, 10) ?? '')}</p>
                  <p className="text-xs text-slate-500">Tanggal</p>
                </div>
              </div>
            </div>
          )}
          {badges.some((b) => b.earned) && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-500" /> Pencapaian Saya
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.map((b) => {
                  const Icon = badgeIcons[b.icon] ?? Award;
                  return (
                    <div key={b.key} className={`rounded-xl p-3 text-center transition-all ${b.earned ? 'bg-gradient-to-br from-amber-50 to-brand-50 dark:from-amber-500/10 dark:to-brand-500/10 border border-amber-200 dark:border-amber-500/30' : 'bg-slate-50 dark:bg-slate-800/50 opacity-50'}`}>
                      <div className={`w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center ${b.earned ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold">{b.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* About hypertension */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-2">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" /> Apa itu Hipertensi?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Hipertensi atau tekanan darah tinggi adalah kondisi di mana tekanan darah pada dinding arteri
            melebihi nilai normal dalam waktu lama. Tekanan darah normal adalah sistolik di bawah 120 mmHg
            dan diastolik di bawah 80 mmHg. Hipertensi sering disebut <em>the silent killer</em> karena
            umumnya tidak menimbulkan gejala, namun dapat merusak organ vital seperti jantung, otak, dan ginjal.
          </p>
          <Link to="/edukasi" className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium mt-3 hover:underline">
            Pelajari lebih lanjut <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="card p-6 bg-gradient-to-br from-leaf-50 to-brand-50 dark:from-leaf-500/10 dark:to-brand-500/10">
          <h3 className="font-bold mb-3 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-leaf-600" /> Manfaat</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-2"><ActivityIcon className="w-4 h-4 text-leaf-500 mt-0.5 shrink-0" /> Skrining risiko gratis</li>
            <li className="flex gap-2"><ActivityIcon className="w-4 h-4 text-leaf-500 mt-0.5 shrink-0" /> Catat & pantau tekanan darah</li>
            <li className="flex gap-2"><ActivityIcon className="w-4 h-4 text-leaf-500 mt-0.5 shrink-0" /> Grafik perkembangan</li>
            <li className="flex gap-2"><ActivityIcon className="w-4 h-4 text-leaf-500 mt-0.5 shrink-0" /> Edukasi pola hidup sehat</li>
          </ul>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-bold text-lg mb-4">Menu Cepat</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.to} to={a.to} className="card p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold mb-0.5 group-hover:text-brand-600 transition-colors">{a.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{a.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

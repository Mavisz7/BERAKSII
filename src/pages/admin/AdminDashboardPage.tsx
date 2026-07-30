import { Users, Activity, CalendarCheck, CalendarDays, HeartPulse, AlertTriangle, TrendingUp, Video, Eye, Brain, GraduationCap, Trophy, BarChart3, TrendingDown } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAdminData } from '@/hooks/useAdminData';
import { PageLoader } from '@/components/ui/Spinner';

const categoryColors: Record<string, string> = {
  Normal: '#16a34a',
  Meningkat: '#f59e0b',
  'Hipertensi Stadium 1': '#fb923c',
  'Hipertensi Stadium 2': '#ef4444',
  'Krisis Hipertensi': '#e11d48',
};

export function AdminDashboardPage() {
  const { stats, loading } = useAdminData();

  if (loading || !stats) return <PageLoader />;

  const cards = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'from-brand-500 to-brand-600' },
    { label: 'Total Pemeriksaan', value: stats.totalExams, icon: Activity, color: 'from-leaf-500 to-leaf-600' },
    { label: 'Pemeriksaan Hari Ini', value: stats.examsToday, icon: CalendarCheck, color: 'from-amber-500 to-orange-500' },
    { label: 'Pemeriksaan Bulan Ini', value: stats.examsThisMonth, icon: CalendarDays, color: 'from-cyan-500 to-brand-500' },
    { label: 'Pengguna Normal', value: stats.normalUsers, icon: HeartPulse, color: 'from-emerald-500 to-leaf-600' },
    { label: 'Pengguna Hipertensi', value: stats.hypertensiveUsers, icon: AlertTriangle, color: 'from-rose-500 to-red-600' },
    { label: 'Jumlah Video Edukasi', value: stats.totalVideos, icon: Video, color: 'from-violet-500 to-brand-500' },
    { label: 'Total Penayangan', value: stats.totalVideoViews, icon: Eye, color: 'from-cyan-500 to-leaf-500' },
    { label: 'Peserta Quiz', value: stats.quizParticipants, icon: Brain, color: 'from-violet-500 to-purple-600' },
    { label: 'Total Quiz Dikerjakan', value: stats.quizTotal, icon: GraduationCap, color: 'from-brand-500 to-cyan-500' },
    { label: 'Nilai Rata-rata', value: stats.quizAvgScore, icon: TrendingUp, color: 'from-leaf-500 to-emerald-600' },
    { label: 'Nilai Tertinggi', value: stats.quizHighScore, icon: Trophy, color: 'from-amber-500 to-orange-500' },
    { label: 'Nilai Terendah', value: stats.quizLowScore, icon: TrendingDown, color: 'from-rose-500 to-red-600' },
    { label: 'Persentase Kelulusan', value: `${stats.quizPassRate}%`, icon: GraduationCap, color: 'from-leaf-500 to-brand-500' },
  ];

  const pieData = Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }));
  const videoCatData = Object.entries(stats.videoCategories).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Dashboard Admin" subtitle="Statistik & ringkasan program BERAKSIKU" icon={<TrendingUp className="w-6 h-6" />} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-extrabold">{c.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold mb-4">Jumlah Pemeriksaan per Bulan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" name="Pemeriksaan" fill="#1f6df0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h3 className="font-bold mb-4">Kategori Video Edukasi</h3>
          {videoCatData.length === 0 ? (
            <p className="text-center text-slate-400 py-20">Belum ada video.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={videoCatData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {videoCatData.map((d) => (
                    <Cell key={d.name} fill={categoryColors[d.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-6">
          <h3 className="font-bold mb-4">Distribusi Kategori Tekanan Darah</h3>
          {pieData.length === 0 ? (
            <p className="text-center text-slate-400 py-20">Belum ada data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={categoryColors[d.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quiz charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-6">
          <h3 className="font-bold mb-4">Distribusi Nilai Quiz</h3>
          {stats.quizTotal === 0 ? (
            <p className="text-center text-slate-400 py-20">Belum ada data quiz.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.quizScoreDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" name="Peserta" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card p-6">
          <h3 className="font-bold mb-4">Peserta Quiz per Hari</h3>
          {stats.quizPerDay.length === 0 ? (
            <p className="text-center text-slate-400 py-20">Belum ada data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.quizPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" name="Peserta" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

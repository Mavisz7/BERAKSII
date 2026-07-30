import { useMemo, useState } from 'react';
import { LineChart as LineChartIcon, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { useExaminations } from '@/hooks/useExaminations';
import { useUser } from '@/contexts/UserContext';
import { PageLoader } from '@/components/ui/Spinner';
import { Link } from 'react-router-dom';

type Range = '7' | '30' | '90' | 'all';

const ranges: { key: Range; label: string }[] = [
  { key: '7', label: '7 Hari' },
  { key: '30', label: '30 Hari' },
  { key: '90', label: '3 Bulan' },
  { key: 'all', label: 'Semua Data' },
];

export function ChartsPage() {
  const { profile } = useUser();
  const { exams, loading } = useExaminations();
  const [range, setRange] = useState<Range>('30');

  const data = useMemo(() => {
    if (!exams.length) return [];
    const cutoff = new Date();
    if (range !== 'all') cutoff.setDate(cutoff.getDate() - Number(range));
    const filtered = exams
      .filter((e) => range === 'all' || new Date(e.exam_date) >= cutoff)
      .sort((a, b) => (a.exam_date + a.exam_time).localeCompare(b.exam_date + b.exam_time));
    return filtered.map((e) => ({
      date: e.exam_date,
      label: `${e.exam_date.slice(8, 10)}/${e.exam_date.slice(5, 7)}`,
      Sistolik: e.systolic,
      Diastolik: e.diastolic,
      Nadi: e.pulse ?? null,
    }));
  }, [exams, range]);

  if (loading) return <PageLoader />;

  if (!profile) {
    return (
      <div>
        <PageHeader title="Grafik Tekanan Darah" icon={<LineChartIcon className="w-6 h-6" />} />
        <div className="card p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Silakan masuk atau daftar untuk melihat grafik tekanan darah Anda.</p>
          <Link to="/daftar" className="btn-primary">Daftar Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Grafik Tekanan Darah" subtitle="Pantau perkembangan tekanan darah Anda" icon={<LineChartIcon className="w-6 h-6" />} />

      <div className="flex flex-wrap gap-2 mb-6">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`btn text-sm py-2 px-4 ${range === r.key ? 'bg-brand-600 text-white' : 'btn-ghost'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Belum ada data pada rentang ini.</p>
          <Link to="/monitoring" className="btn-primary">Catat Pemeriksaan</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ChartCard title="Tekanan Sistolik" data={data} dataKey="Sistolik" color="#1f6df0" unit="mmHg" />
          <ChartCard title="Tekanan Diastolik" data={data} dataKey="Diastolik" color="#16a34a" unit="mmHg" />
          <ChartCard title="Denyut Nadi" data={data} dataKey="Nadi" color="#f59e0b" unit="bpm" />
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, data, dataKey, color, unit }: { title: string; data: Record<string, unknown>[]; dataKey: string; color: string; unit: string }) {
  return (
    <div className="card p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} unit={` ${unit}`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

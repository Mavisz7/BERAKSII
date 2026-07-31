import { useEffect, useState } from 'react';
import { BookOpen, HeartPulse, AlertTriangle, Eye, Zap, ShieldCheck, Sparkles, ChevronRight, ArrowLeft, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { SkeletonCard } from '@/components/ui/Spinner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Article } from '@/lib/types';

const iconMap: Record<string, typeof HeartPulse> = {
  HeartPulse, AlertTriangle, Eye, Zap, ShieldCheck, Sparkles, BookOpen,
};

const fallbackArticles: Article[] = [
  { id: '1', title: 'Pengertian Hipertensi', category: 'Pengertian', excerpt: 'Apa itu hipertensi dan mengapa penting.', content: 'Hipertensi atau tekanan darah tinggi adalah kondisi di mana tekanan darah pada dinding arteri lebih tinggi dari nilai normal yang dipertahankan dalam waktu lama. Tekanan darah normal: sistolik <120 mmHg dan diastolik <80 mmHg. Hipertensi sering disebut "the silent killer" karena umumnya tidak menimbulkan gejala namun dapat merusak organ vital.', image_url: '', icon: 'HeartPulse', featured: true, created_at: '' },
  { id: '2', title: 'Faktor Risiko Hipertensi', category: 'Faktor Risiko', excerpt: 'Berbagai faktor yang meningkatkan risiko.', content: 'Faktor risiko: usia, riwayat keluarga, merokok, kurang aktivitas fisik, konsumsi garam berlebih, kelebihan berat badan, dan riwayat diabetes. Memahami faktor risiko membantu pencegahan dini.', image_url: '', icon: 'AlertTriangle', featured: true, created_at: '' },
  { id: '3', title: 'Tanda dan Gejala', category: 'Gejala', excerpt: 'Kenali tanda hipertensi.', content: 'Hipertensi sering tanpa gejala. Pada tekanan sangat tinggi dapat muncul sakit kepala, pusing, penglihatan kabur, sesak napas, atau mimisan. Segera periksa tekanan darah jika mengalami gejala ini.', image_url: '', icon: 'Eye', featured: false, created_at: '' },
  { id: '4', title: 'Komplikasi Hipertensi', category: 'Komplikasi', excerpt: 'Komplikasi hipertensi tidak terkontrol.', content: 'Hipertensi tidak terkontrol dapat menyebabkan stroke, serangan jantung, gagal jantung, kerusakan ginjal, dan kerusakan mata. Pengendalian tekanan darah menurunkan risiko komplikasi.', image_url: '', icon: 'Zap', featured: false, created_at: '' },
  { id: '5', title: 'Cara Pencegahan', category: 'Pencegahan', excerpt: 'Langkah pencegahan hipertensi.', content: 'Pencegahan: konsumsi garam <5 gram/hari, banyak buah & sayur, aktivitas fisik 30 menit/hari, hindari merokok, kelola stres, jaga berat badan ideal, periksa tekanan darah rutin.', image_url: '', icon: 'ShieldCheck', featured: true, created_at: '' },
  { id: '6', title: '7 Prinsip BERAKSI', category: 'Pola Hidup', excerpt: 'Pola hidup sehat BERAKSI.', content: 'BERAKSI: Batasi garam dan lemak, Enyahkan asap rokok, Rajin aktivitas fisik, Atur pola makan sehat, Kelola stres, Stop alkohol, Ikuti pemeriksaan tekanan darah rutin. Prinsip ini adalah kunci pengendalian hipertensi.', image_url: '', icon: 'Sparkles', featured: true, created_at: '' },
];

export function EducationPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Article | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured) { setArticles(fallbackArticles); setLoading(false); return; }
      const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      setArticles((data as Article[])?.length ? (data as Article[]) : fallbackArticles);
      setLoading(false);
    })();
  }, []);

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Edukasi Hipertensi" subtitle="Pelajari tentang hipertensi & pola hidup sehat" icon={<BookOpen className="w-6 h-6" />} />

      <div className="relative max-w-md mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Cari artikel edukasi..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a) => {
            const Icon = iconMap[a.icon] ?? BookOpen;
            return (
              <button key={a.id} onClick={() => setSelected(a)} className="card p-6 text-left group hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 flex items-center justify-center mb-4 shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 mb-2">{a.category}</span>
                <h3 className="font-bold text-lg mb-1 group-hover:text-brand-600 transition-colors">{a.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{a.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium mt-3">
                  Baca selengkapnya <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} size="lg" title={selected?.title}>
        {selected && (
          <div>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 mb-3">{selected.category}</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{selected.content}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Play, Search, Clock, Eye, ArrowRight, History, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useVideos, getLastWatched, clearLastWatched } from '@/hooks/useVideos';
import { PageLoader } from '@/components/ui/Spinner';
import type { EduVideo, VideoCategory } from '@/lib/types';
import { formatDate } from '@/lib/format';

const categories: (VideoCategory | 'Semua')[] = [
  'Semua', 'Hipertensi', 'Pola Hidup Sehat', 'CERDIK', 'Aktivitas Fisik', 'Gizi Seimbang', 'Pemeriksaan Tekanan Darah',
];

const categoryColor: Record<string, string> = {
  'Hipertensi': 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  'Pola Hidup Sehat': 'bg-leaf-100 text-leaf-700 dark:bg-leaf-500/15 dark:text-leaf-300',
  'CERDIK': 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Aktivitas Fisik': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'Gizi Seimbang': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  'Pemeriksaan Tekanan Darah': 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
};

export function VideoGalleryPage() {
  const { videos, loading, refetch } = useVideos();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<VideoCategory | 'Semua'>('Semua');
  const navigate = useNavigate();
  const lastWatched = getLastWatched();

  useEffect(() => { refetch(); }, [refetch]);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchCat = cat === 'Semua' || v.category === cat;
      const matchQuery =
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.description.toLowerCase().includes(query.toLowerCase()) ||
        v.category.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [videos, query, cat]);

  const recent = useMemo(() => [...videos].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')).slice(0, 3), [videos]);
  const popular = useMemo(() => [...videos].sort((a, b) => b.views - a.views).slice(0, 3), [videos]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <PageHeader title="Galeri Video Edukasi" subtitle="Media edukasi kesehatan kapan saja" icon={<Video className="w-6 h-6" />} />

      {/* Continue watching */}
      {lastWatched && (
        <section className="card p-5 flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-brand-50 to-leaf-50 dark:from-brand-500/10 dark:to-leaf-500/10">
          <div className="relative w-full sm:w-40 shrink-0">
            <img src={lastWatched.thumbnail_url} alt={lastWatched.title} className="w-full aspect-video rounded-xl object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
              <Play className="w-8 h-8 text-white" fill="currentColor" />
            </span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1 justify-center sm:justify-start mb-1">
              <History className="w-3.5 h-3.5" /> Lanjutkan Menonton
            </p>
            <h3 className="font-bold mb-1">{lastWatched.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Durasi: {lastWatched.duration}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/video/${lastWatched.id}`)} className="btn-primary text-sm py-2">Lanjutkan <ArrowRight className="w-4 h-4" /></button>
            <button onClick={clearLastWatched} className="btn-ghost text-sm py-2">Hapus</button>
          </div>
        </section>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-brand-500" /> Video Terbaru</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((v) => <VideoCard key={v.id} video={v} onClick={() => navigate(`/video/${v.id}`)} />)}
          </div>
        </section>
      )}

      {/* Popular / recommended */}
      {popular.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Video Rekomendasi</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((v) => <VideoCard key={v.id} video={v} onClick={() => navigate(`/video/${v.id}`)} />)}
          </div>
        </section>
      )}

      {/* All videos with filter */}
      <section>
        <h2 className="font-bold text-lg mb-4">Semua Video</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" placeholder="Cari video..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`btn text-xs py-2 px-3 ${cat === c ? 'bg-brand-600 text-white' : 'btn-ghost'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
            Tidak ada video yang cocok.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v) => <VideoCard key={v.id} video={v} onClick={() => navigate(`/video/${v.id}`)} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function VideoCard({ video, onClick }: { video: EduVideo; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card overflow-hidden text-left group hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={video.thumbnail_url}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
          <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-brand-600 ml-0.5" fill="currentColor" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md">{video.duration}</span>
      </div>
      <div className="p-4">
        <span className={`badge mb-2 ${categoryColor[video.category] ?? 'bg-slate-100 text-slate-700'}`}>{video.category}</span>
        <h3 className="font-bold mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">{video.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{video.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {video.views}x ditonton</span>
          <span>{video.created_at ? formatDate(video.created_at.slice(0, 10)) : ''}</span>
        </div>
        <span className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 font-medium mt-3">
          Tonton Sekarang <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
}

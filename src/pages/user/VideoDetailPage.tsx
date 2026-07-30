import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, Activity, LayoutDashboard, Calendar, Clock, Tag, Eye, HeartPulse } from 'lucide-react';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { useVideos, saveLastWatched } from '@/hooks/useVideos';
import { PageLoader } from '@/components/ui/Spinner';
import { useSettings } from '@/hooks/useSettings';
import { formatDate } from '@/lib/format';

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { videos, loading, incrementViews } = useVideos();
  const { settings } = useSettings();
  const [played, setPlayed] = useState(false);

  const video = videos.find((v) => v.id === id);

  useEffect(() => {
    if (video) saveLastWatched(video);
  }, [video]);

  if (loading) return <PageLoader />;

  if (!video) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center">
          <HeartPulse className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Video tidak ditemukan</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Video yang Anda cari mungkin telah dihapus.</p>
        <Link to="/video" className="btn-primary">Kembali ke Galeri</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VideoPlayer
        src={video.video_url}
        poster={video.thumbnail_url}
        onPlay={() => {
          if (!played) { setPlayed(true); incrementViews(video.id); }
        }}
      />

      {/* Info */}
      <div className="card p-6">
        <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 mb-3">{video.category}</span>
        <h1 className="text-2xl font-bold mb-3">{video.title}</h1>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{video.description}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <InfoRow icon={<Tag className="w-4 h-4" />} label="Kategori" value={video.category} />
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Durasi" value={video.duration} />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Tanggal Ditambahkan" value={video.created_at ? formatDate(video.created_at.slice(0, 10)) : '-'} />
          <InfoRow icon={<Eye className="w-4 h-4" />} label="Penayangan" value={`${video.views}x`} />
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
          <p className="text-sm font-semibold mb-1">Tujuan Edukasi</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{video.goal}</p>
        </div>
        <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-50 to-leaf-50 dark:from-brand-500/10 dark:to-leaf-500/10 p-4">
          <p className="text-sm font-semibold mb-1">Nama Program</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{settings.program_name} ({settings.program_subtitle})</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/video')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Kembali ke Galeri</button>
        <Link to="/skrining" className="btn-primary"><ClipboardCheck className="w-4 h-4" /> Mulai Skrining Hipertensi</Link>
        <Link to="/monitoring" className="btn-leaf"><Activity className="w-4 h-4" /> Monitoring Hipertensi</Link>
        <Link to="/" className="btn-outline"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}

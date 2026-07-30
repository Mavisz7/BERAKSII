import { useCallback, useEffect, useState } from 'react';
import type { EduVideo } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const LS_KEY = 'beraksiku_videos';
const LS_LAST_WATCHED = 'beraksiku_last_video';

const fallbackVideos: EduVideo[] = [
  { id: 'v1', title: 'Mengenal Hipertensi', description: 'Pelajari pengertian, penyebab, dan bahaya hipertensi bagi tubuh.', category: 'Hipertensi', duration: '02:15', video_url: '/videos/edukasi-hipertensi.mp4', thumbnail_url: '/thumbnails/hipertensi.jpg', goal: 'Memahami dasar-dasar hipertensi agar dapat mencegah dan mendeteksi dini.', sort_order: 1, views: 124, created_at: new Date().toISOString() },
  { id: 'v2', title: 'Pola Hidup Sehat', description: 'Tips menjaga pola hidup sehat untuk mencegah hipertensi.', category: 'Pola Hidup Sehat', duration: '03:05', video_url: '/videos/edukasi-pola-hidup-sehat.mp4', thumbnail_url: '/thumbnails/pola-hidup.jpg', goal: 'Mendorong masyarakat menerapkan pola hidup sehat setiap hari.', sort_order: 2, views: 98, created_at: new Date().toISOString() },
  { id: 'v3', title: 'Diet Rendah Garam', description: 'Panduan konsumsi garam yang aman untuk penderita hipertensi.', category: 'Gizi Seimbang', duration: '02:40', video_url: '/videos/edukasi-diet-rendah-garam.mp4', thumbnail_url: '/thumbnails/diet.jpg', goal: 'Mengedukasi batas aman konsumsi garam dan pilihan makanan sehat.', sort_order: 3, views: 76, created_at: new Date().toISOString() },
  { id: 'v4', title: 'Aktivitas Fisik', description: 'Jenis olahraga yang aman dan dianjurkan untuk penderita hipertensi.', category: 'Aktivitas Fisik', duration: '03:20', video_url: '/videos/edukasi-aktivitas-fisik.mp4', thumbnail_url: '/thumbnails/olahraga.jpg', goal: 'Mendorong rutin aktivitas fisik 30 menit per hari.', sort_order: 4, views: 65, created_at: new Date().toISOString() },
  { id: 'v5', title: 'Cek Tekanan Darah', description: 'Cara mengukur tekanan darah sendiri di rumah dengan benar.', category: 'Pemeriksaan Tekanan Darah', duration: '02:50', video_url: '/videos/edukasi-cek-tekanan-darah.mp4', thumbnail_url: '/thumbnails/cek-tensi.jpg', goal: 'Mengajarkan teknik pengukuran tekanan darah yang akurat.', sort_order: 5, views: 112, created_at: new Date().toISOString() },
];

function loadLocal(): EduVideo[] {
  const saved = localStorage.getItem(LS_KEY);
  return saved ? (JSON.parse(saved) as EduVideo[]) : fallbackVideos;
}

export function useVideos() {
  const [videos, setVideos] = useState<EduVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) { setVideos(loadLocal()); setLoading(false); return; }
    const { data } = await supabase.from('edu_videos').select('*').order('sort_order', { ascending: true });
    if (data && (data as EduVideo[]).length) {
      setVideos(data as EduVideo[]);
    } else {
      setVideos(fallbackVideos);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  async function add(v: Omit<EduVideo, 'id' | 'created_at' | 'views'>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('edu_videos').insert({ ...v, views: 0 }).select().single();
      if (error) throw new Error(error.message);
      setVideos((prev) => [...prev, data as EduVideo].sort((a, b) => a.sort_order - b.sort_order));
      return data as EduVideo;
    }
    const row: EduVideo = { ...v, id: crypto.randomUUID(), views: 0, created_at: new Date().toISOString() };
    const next = [...loadLocal(), row];
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setVideos(next);
    return row;
  }

  async function update(id: string, patch: Partial<EduVideo>) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('edu_videos').update(patch).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      setVideos((prev) => prev.map((v) => (v.id === id ? (data as EduVideo) : v)).sort((a, b) => a.sort_order - b.sort_order));
      return;
    }
    const next = loadLocal().map((v) => (v.id === id ? { ...v, ...patch } : v));
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setVideos(next);
  }

  async function remove(id: string) {
    if (isSupabaseConfigured) await supabase.from('edu_videos').delete().eq('id', id);
    else { localStorage.setItem(LS_KEY, JSON.stringify(loadLocal().filter((v) => v.id !== id))); }
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }

  async function incrementViews(id: string) {
    if (isSupabaseConfigured) {
      const cur = videos.find((v) => v.id === id);
      if (!cur) return;
      await supabase.from('edu_videos').update({ views: cur.views + 1 }).eq('id', id);
    }
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, views: v.views + 1 } : v)));
  }

  return { videos, loading, refetch, add, update, remove, incrementViews };
}

export function saveLastWatched(video: EduVideo) {
  localStorage.setItem(LS_LAST_WATCHED, JSON.stringify({ id: video.id, title: video.title, thumbnail_url: video.thumbnail_url, video_url: video.video_url, duration: video.duration }));
}

export function getLastWatched(): { id: string; title: string; thumbnail_url: string; video_url: string; duration: string } | null {
  const saved = localStorage.getItem(LS_LAST_WATCHED);
  return saved ? JSON.parse(saved) : null;
}

export function clearLastWatched() {
  localStorage.removeItem(LS_LAST_WATCHED);
}

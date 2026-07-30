import { useEffect, useRef, useState } from 'react';
import { Video, Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown, Eye, Star, Upload, Film, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useVideos } from '@/hooks/useVideos';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';
import { PageLoader } from '@/components/ui/Spinner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { EduVideo, VideoCategory } from '@/lib/types';

const categoryOptions: VideoCategory[] = [
  'Hipertensi', 'Pola Hidup Sehat', 'CERDIK', 'Aktivitas Fisik', 'Gizi Seimbang', 'Pemeriksaan Tekanan Darah',
];

const categoryColor: Record<string, string> = {
  'Hipertensi': 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  'Pola Hidup Sehat': 'bg-leaf-100 text-leaf-700 dark:bg-leaf-500/15 dark:text-leaf-300',
  'CERDIK': 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Aktivitas Fisik': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'Gizi Seimbang': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  'Pemeriksaan Tekanan Darah': 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
};

export function AdminVideosPage() {
  const { videos, loading, add, update, remove, refetch } = useVideos();
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState<EduVideo | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = videos.filter((v) => v.title.toLowerCase().includes(query.toLowerCase()));

  async function move(v: EduVideo, dir: -1 | 1) {
    const idx = videos.findIndex((x) => x.id === v.id);
    const swap = videos[idx + dir];
    if (!swap) return;
    const newOrder = v.sort_order;
    await update(v.id, { sort_order: swap.sort_order });
    await update(swap.id, { sort_order: newOrder });
    await audit('Ubah urutan video', `${v.title} -> ${dir === -1 ? 'naik' : 'turun'}`);
    refetch();
  }

  async function doDelete(id: string) {
    await remove(id);
    await audit('Hapus video', id);
    toast('success', 'Video dihapus.');
  }

  async function toggleFeatured(_v: EduVideo) {
    // featured not in schema; using views as a proxy for "recommended" is already handled.
    toast('info', 'Video rekomendasi diurutkan otomatis berdasarkan jumlah penayangan.');
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Video Edukasi"
        subtitle="Kelola video edukasi kesehatan"
        icon={<Video className="w-6 h-6" />}
        action={<button className="btn-primary" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Tambah Video</button>}
      />
      <div className="relative max-w-md mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Cari video..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
          Belum ada video.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v, i) => (
            <div key={v.id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-32 shrink-0">
                <img src={v.thumbnail_url} alt={v.title} className="w-full aspect-video rounded-lg object-cover bg-slate-100 dark:bg-slate-800" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">{v.duration}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`badge mb-1 ${categoryColor[v.category] ?? ''}`}>{v.category}</span>
                <h3 className="font-bold truncate">{v.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{v.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {v.views}</span>
                  <span>Urutan: {v.sort_order}</span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 sm:items-end justify-between">
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" disabled={i === 0} onClick={() => move(v, -1)} title="Naik"><ArrowUp className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" disabled={i === filtered.length - 1} onClick={() => move(v, 1)} title="Turun"><ArrowDown className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => toggleFeatured(v)} title="Rekomendasi"><Star className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setEdit(v)} title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600" onClick={() => setConfirmDelete(v.id)} title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(edit || creating) && (
        <Modal open onClose={() => { setEdit(null); setCreating(false); }} title={creating ? 'Tambah Video' : 'Edit Video'} size="lg">
          <VideoForm
            video={edit}
            onSave={async (v) => {
              try {
                if (creating) {
                  await add(v);
                  await audit('Tambah video', v.title);
                } else if (edit) {
                  await update(edit.id, v);
                  await audit('Edit video', edit.title);
                }
                toast('success', 'Video disimpan.');
                setEdit(null); setCreating(false); refetch();
              } catch (e) {
                toast('error', (e as Error).message);
              }
            }}
          />
        </Modal>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && doDelete(confirmDelete)}
        title="Hapus Video"
        message="Yakin ingin menghapus video ini?"
      />
    </div>
  );
}

function VideoForm({ video, onSave }: { video: EduVideo | null; onSave: (v: Omit<EduVideo, 'id' | 'created_at' | 'views'>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: video?.title ?? '',
    description: video?.description ?? '',
    category: (video?.category ?? 'Hipertensi') as VideoCategory,
    duration: video?.duration ?? '00:00',
    video_url: video?.video_url ?? '',
    thumbnail_url: video?.thumbnail_url ?? '',
    goal: video?.goal ?? '',
    sort_order: video?.sort_order ?? 1,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [videoFileName, setVideoFileName] = useState('');
  const [thumbFileName, setThumbFileName] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  function sanitizeFileName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9.\-]/g, '-').replace(/-+/g, '-');
  }

  function detectDuration(file: File): Promise<string> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        const total = v.duration;
        if (isFinite(total)) {
          const m = Math.floor(total / 60);
          const s = Math.floor(total % 60);
          resolve(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        } else {
          resolve('00:00');
        }
        URL.revokeObjectURL(url);
      };
      v.onerror = () => { resolve('00:00'); URL.revokeObjectURL(url); };
      v.src = url;
    });
  }

  async function uploadVideo(file: File) {
    if (file.size > 100 * 1024 * 1024) {
      toast('error', 'Ukuran video maksimal 100 MB.');
      return;
    }
    setUploadingVideo(true);
    setVideoProgress(0);
    setVideoFileName(file.name);
    try {
      const safeName = sanitizeFileName(file.name);
      const path = `videos/${Date.now()}-${safeName}`;
      const duration = await detectDuration(file);
      if (isSupabaseConfigured) {
        const { error } = await supabase.storage.from('edu-videos').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('edu-videos').getPublicUrl(path);
        setForm((f) => ({ ...f, video_url: data.publicUrl, duration }));
      } else {
        setForm((f) => ({ ...f, video_url: URL.createObjectURL(file), duration }));
      }
      setVideoProgress(100);
      toast('success', 'Video berhasil diunggah.');
    } catch (e) {
      toast('error', `Gagal mengunggah video: ${(e as Error).message}`);
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  }

  async function uploadThumb(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast('error', 'Ukuran thumbnail maksimal 5 MB.');
      return;
    }
    setUploadingThumb(true);
    setThumbProgress(0);
    setThumbFileName(file.name);
    try {
      const safeName = sanitizeFileName(file.name);
      const path = `thumbnails/${Date.now()}-${safeName}`;
      if (isSupabaseConfigured) {
        const { error } = await supabase.storage.from('edu-videos').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('edu-videos').getPublicUrl(path);
        setForm((f) => ({ ...f, thumbnail_url: data.publicUrl }));
      } else {
        setForm((f) => ({ ...f, thumbnail_url: URL.createObjectURL(file) }));
      }
      setThumbProgress(100);
      toast('success', 'Thumbnail berhasil diunggah.');
    } catch (e) {
      toast('error', `Gagal mengunggah thumbnail: ${(e as Error).message}`);
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = '';
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSaving(true); onSave(form).finally(() => setSaving(false)); }} className="space-y-4">
      <div><label className="label">Judul</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="label">Kategori</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as VideoCategory })}>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="label">Durasi (mm:ss)</label><input className="input" placeholder="02:15" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
      </div>
      <div><label className="label">Deskripsi</label><textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div><label className="label">Tujuan Edukasi</label><input className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></div>

      {/* Video upload zone */}
      <div>
        <label className="label">File Video MP4</label>
        <div
          className="relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 text-center hover:border-brand-400 transition-colors cursor-pointer"
          onClick={() => !uploadingVideo && videoInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10'); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10'); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10'); const f = e.dataTransfer.files[0]; if (f) uploadVideo(f); }}
        >
          <input ref={videoInputRef} type="file" accept="video/mp4,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(f); }} />
          {uploadingVideo ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              <p className="text-sm text-slate-500">Mengunggah {videoFileName}...</p>
              <div className="w-full max-w-xs h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-brand-500 transition-all" style={{ width: `${videoProgress}%` }} />
              </div>
            </div>
          ) : form.video_url ? (
            <div className="flex items-center gap-2 justify-center text-sm">
              <CheckCircle2 className="w-5 h-5 text-leaf-500" />
              <span className="text-leaf-700 dark:text-leaf-300 font-medium">Video siap</span>
              <span className="text-slate-400 truncate max-w-[150px]">{videoFileName || form.video_url}</span>
              <button type="button" className="text-brand-600 hover:underline ml-1" onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}>Ganti</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="w-6 h-6 text-slate-400" />
              <p className="text-sm text-slate-500">Klik atau seret file MP4 ke sini</p>
              <p className="text-xs text-slate-400">Maksimal 100 MB</p>
            </div>
          )}
        </div>
        <input className="input mt-2" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="Atau tempel URL video" />
      </div>

      {/* Thumbnail upload zone */}
      <div>
        <label className="label">Thumbnail (JPG/PNG)</label>
        <div className="flex gap-3">
          <div
            className="relative rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 text-center hover:border-brand-400 transition-colors cursor-pointer flex-1"
            onClick={() => !uploadingThumb && thumbInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10'); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-brand-500', 'bg-brand-50', 'dark:bg-brand-500/10'); const f = e.dataTransfer.files[0]; if (f) uploadThumb(f); }}
          >
            <input ref={thumbInputRef} type="file" accept="image/jpeg,image/png,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadThumb(f); }} />
            {uploadingThumb ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                <p className="text-sm text-slate-500">Mengunggah {thumbFileName}...</p>
              </div>
            ) : form.thumbnail_url ? (
              <div className="flex items-center gap-2 justify-center text-sm">
                <CheckCircle2 className="w-5 h-5 text-leaf-500" />
                <span className="text-leaf-700 dark:text-leaf-300 font-medium">Thumbnail siap</span>
                <button type="button" className="text-brand-600 hover:underline" onClick={(e) => { e.stopPropagation(); thumbInputRef.current?.click(); }}>Ganti</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImageIcon className="w-6 h-6 text-slate-400" />
                <p className="text-sm text-slate-500">Klik atau seret gambar ke sini</p>
                <p className="text-xs text-slate-400">Maksimal 5 MB</p>
              </div>
            )}
          </div>
          {form.thumbnail_url && !uploadingThumb && (
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              <img src={form.thumbnail_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
            </div>
          )}
        </div>
        <input className="input mt-2" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="Atau tempel URL thumbnail" />
      </div>

      <div><label className="label">Urutan Tampil</label><input type="number" className="input" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>

      <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Video'}</button>
    </form>
  );
}

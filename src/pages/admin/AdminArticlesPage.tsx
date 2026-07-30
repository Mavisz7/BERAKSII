import { useEffect, useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Star, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';
import { PageLoader } from '@/components/ui/Spinner';
import type { Article } from '@/lib/types';

const iconOptions = ['HeartPulse', 'AlertTriangle', 'Eye', 'Zap', 'ShieldCheck', 'Sparkles', 'BookOpen'];

export function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function refetch() {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    setArticles((data as Article[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refetch(); }, []);

  async function toggleFeatured(a: Article) {
    if (!isSupabaseConfigured) return;
    await supabase.from('articles').update({ featured: !a.featured }).eq('id', a.id);
    await audit('Ubah artikel unggulan', `${a.title} -> ${!a.featured}`);
    toast('success', 'Status artikel diperbarui.');
    refetch();
  }

  async function doDelete(id: string) {
    if (!isSupabaseConfigured) return;
    await supabase.from('articles').delete().eq('id', id);
    await audit('Hapus artikel', id);
    toast('success', 'Artikel dihapus.');
    refetch();
  }

  const filtered = articles.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Edukasi"
        subtitle="Kelola artikel edukasi hipertensi"
        icon={<BookOpen className="w-6 h-6" />}
        action={<button className="btn-primary" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Tambah Artikel</button>}
      />
      <div className="relative max-w-md mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Cari artikel..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">Belum ada artikel.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{a.category}</span>
                <button onClick={() => toggleFeatured(a)} title="Tampil di beranda">
                  <Star className={`w-5 h-5 ${a.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              </div>
              <h3 className="font-bold mb-1">{a.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{a.excerpt}</p>
              <div className="flex gap-2">
                <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => setEdit(a)}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button className="btn-ghost text-xs py-1.5 px-3 text-rose-600" onClick={() => setConfirmDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(edit || creating) && (
        <Modal open onClose={() => { setEdit(null); setCreating(false); }} title={creating ? 'Tambah Artikel' : 'Edit Artikel'} size="lg">
          <ArticleForm
            article={edit}
            onSave={async (v) => {
              if (!isSupabaseConfigured) return;
              if (creating) {
                const { error } = await supabase.from('articles').insert(v);
                if (error) { toast('error', error.message); return; }
                await audit('Tambah artikel', v.title ?? '');
              } else if (edit) {
                await supabase.from('articles').update(v).eq('id', edit.id);
                await audit('Edit artikel', edit.title);
              }
              toast('success', 'Artikel disimpan.');
              setEdit(null); setCreating(false); refetch();
            }}
          />
        </Modal>
      )}

      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && doDelete(confirmDelete)} title="Hapus Artikel" message="Yakin ingin menghapus artikel ini?" />
    </div>
  );
}

function ArticleForm({ article, onSave }: { article: Article | null; onSave: (v: Partial<Article>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: article?.title ?? '',
    category: article?.category ?? 'Umum',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '',
    image_url: article?.image_url ?? '',
    icon: article?.icon ?? 'HeartPulse',
    featured: article?.featured ?? false,
  });
  const [saving, setSaving] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSaving(true); onSave(form).finally(() => setSaving(false)); }} className="space-y-4">
      <div><label className="label">Judul</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Kategori</label><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
        <div><label className="label">Ikon</label>
          <select className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
            {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Ringkasan</label><input className="input" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
      <div><label className="label">URL Gambar (opsional)</label><input className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
      <div><label className="label">Konten</label><textarea className="input min-h-[160px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-slate-300" />
        Tampilkan di halaman utama
      </label>
      <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Artikel'}</button>
    </form>
  );
}

import { useMemo, useState } from 'react';
import { Users, Search, Eye, Pencil, Trash2, Ban, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useAdminData } from '@/hooks/useAdminData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';
import { PageLoader } from '@/components/ui/Spinner';
import type { Profile } from '@/lib/types';

export function AdminUsersPage() {
  const { profiles, loading, refetch } = useAdminData();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [detail, setDetail] = useState<Profile | null>(null);
  const [edit, setEdit] = useState<Profile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = profiles.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) || p.phone.includes(query)
    );
    r = [...r].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? '');
      const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return r;
  }, [profiles, query, sortKey, sortDir]);

  const pageSize = 10;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function onSort(key: string) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  async function saveEdit(v: Partial<Profile>) {
    if (!edit) return;
    if (isSupabaseConfigured) await supabase.from('profiles').update(v).eq('id', edit.id);
    await audit('Edit pengguna', `${edit.name} (${edit.id})`);
    toast('success', 'Data pengguna diperbarui.');
    setEdit(null);
    refetch();
  }

  async function toggleDisable(p: Profile) {
    if (!isSupabaseConfigured) return;
    await supabase.from('profiles').update({ disabled: !p.disabled }).eq('id', p.id);
    await audit(p.disabled ? 'Aktifkan pengguna' : 'Nonaktifkan pengguna', `${p.name} (${p.id})`);
    toast('success', p.disabled ? 'Pengguna diaktifkan.' : 'Pengguna dinonaktifkan.');
    refetch();
  }

  async function doDelete(id: string) {
    if (!isSupabaseConfigured) return;
    await supabase.from('profiles').delete().eq('id', id);
    await audit('Hapus pengguna', id);
    toast('success', 'Pengguna dihapus.');
    refetch();
  }

  if (loading) return <PageLoader />;

  const columns = [
    { key: 'name', label: 'Nama', sortable: true, render: (p: Profile) => <span className="font-medium">{p.name}</span> },
    { key: 'age', label: 'Umur', sortable: true },
    { key: 'sex', label: 'L/P', sortable: true, render: (p: Profile) => (p.sex === 'L' ? 'Laki-laki' : 'Perempuan') },
    { key: 'phone', label: 'No. HP' },
    { key: 'disabled', label: 'Status', render: (p: Profile) => p.disabled
      ? <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">Nonaktif</span>
      : <span className="badge bg-leaf-100 text-leaf-700 dark:bg-leaf-500/15 dark:text-leaf-300">Aktif</span> },
    {
      key: 'actions', label: 'Aksi', render: (p: Profile) => (
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setDetail(p)} title="Detail"><Eye className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setEdit(p)} title="Edit"><Pencil className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => toggleDisable(p)} title={p.disabled ? 'Aktifkan' : 'Nonaktifkan'}>
            {p.disabled ? <CheckCircle2 className="w-4 h-4 text-leaf-600" /> : <Ban className="w-4 h-4 text-amber-600" />}
          </button>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600" onClick={() => setConfirmDelete(p.id)} title="Hapus"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Manajemen Pengguna" subtitle="Kelola data pengguna website" icon={<Users className="w-6 h-6" />} />
      <div className="relative max-w-md mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Cari nama atau nomor HP..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
      </div>
      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(p) => p.id}
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        onSort={onSort}
        sortKey={sortKey}
        sortDir={sortDir}
        empty="Tidak ada pengguna."
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Pengguna">
        {detail && (
          <div className="space-y-2 text-sm">
            <Row label="Nama" value={detail.name} />
            <Row label="Umur" value={`${detail.age} tahun`} />
            <Row label="Jenis Kelamin" value={detail.sex === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <Row label="No. HP" value={detail.phone} />
            <Row label="Status" value={detail.disabled ? 'Nonaktif' : 'Aktif'} />
          </div>
        )}
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Pengguna">
        {edit && <EditForm profile={edit} onSave={saveEdit} />}
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && doDelete(confirmDelete)}
        title="Hapus Pengguna"
        message="Yakin ingin menghapus pengguna ini? Semua data pemeriksaan terkait juga akan dihapus."
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EditForm({ profile, onSave }: { profile: Profile; onSave: (v: Partial<Profile>) => Promise<void> }) {
  const [form, setForm] = useState({ name: profile.name, age: profile.age, sex: profile.sex, phone: profile.phone });
  const [saving, setSaving] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSaving(true); onSave(form).finally(() => setSaving(false)); }} className="space-y-4">
      <div><label className="label">Nama</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Umur</label><input type="number" className="input" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} required min={1} max={120} /></div>
        <div><label className="label">Jenis Kelamin</label>
          <select className="input" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as 'L' | 'P' })}>
            <option value="L">Laki-laki</option><option value="P">Perempuan</option>
          </select>
        </div>
      </div>
      <div><label className="label">No. HP</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
      <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}

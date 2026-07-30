import { useMemo, useState } from 'react';
import { Activity, Search, Eye, Pencil, Trash2, Trash } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useAdminData } from '@/hooks/useAdminData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';
import { PageLoader } from '@/components/ui/Spinner';
import { bpCategoryBg, categorizeBP } from '@/lib/bp';
import { formatDate, formatBP } from '@/lib/format';
import type { Examination } from '@/lib/types';

type ExamRow = Examination & { profiles: { name: string } };

export function AdminExamsPage() {
  const { exams, loading, refetch } = useAdminData();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('exam_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [detail, setDetail] = useState<ExamRow | null>(null);
  const [edit, setEdit] = useState<ExamRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let r = (exams as ExamRow[]).filter((e) => {
      const name = e.profiles?.name?.toLowerCase() ?? '';
      return name.includes(query.toLowerCase()) || e.exam_date.includes(query);
    });
    r = [...r].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? '');
      const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return r;
  }, [exams, query, sortKey, sortDir]);

  const pageSize = 10;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function onSort(key: string) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  function toggleSelect(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  }
  function toggleSelectAll() {
    setSelected((s) => s.length === pageRows.length ? [] : pageRows.map((r) => r.id));
  }

  async function saveEdit(v: Partial<Examination>) {
    if (!edit) return;
    const patch = { ...v };
    if (v.systolic != null && v.diastolic != null) patch.category = categorizeBP(v.systolic, v.diastolic);
    if (isSupabaseConfigured) await supabase.from('examinations').update(patch).eq('id', edit.id);
    await audit('Edit pemeriksaan', edit.id);
    toast('success', 'Pemeriksaan diperbarui.');
    setEdit(null); refetch();
  }

  async function doDelete(id: string) {
    if (!isSupabaseConfigured) return;
    await supabase.from('examinations').delete().eq('id', id);
    await audit('Hapus pemeriksaan', id);
    toast('success', 'Pemeriksaan dihapus.');
    refetch();
  }

  async function doBulkDelete(ids: string[]) {
    if (!isSupabaseConfigured) return;
    await supabase.from('examinations').delete().in('id', ids);
    await audit('Hapus massal pemeriksaan', `${ids.length} data`);
    toast('success', `${ids.length} pemeriksaan dihapus.`);
    setSelected([]); refetch();
  }

  if (loading) return <PageLoader />;

  const columns = [
    { key: '_select', label: '', render: (e: ExamRow) => (
      <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggleSelect(e.id)} className="rounded border-slate-300" />
    )},
    { key: 'profiles', label: 'Nama', sortable: false, render: (e: ExamRow) => <span className="font-medium">{e.profiles?.name ?? '-'}</span> },
    { key: 'exam_date', label: 'Tanggal', sortable: true, render: (e: ExamRow) => formatDate(e.exam_date) },
    { key: 'exam_time', label: 'Waktu', sortable: true },
    { key: 'systolic', label: 'Tekanan', render: (e: ExamRow) => formatBP(e.systolic, e.diastolic) },
    { key: 'category', label: 'Status', render: (e: ExamRow) => <span className={`badge ${bpCategoryBg[e.category]}`}>{e.category}</span> },
    { key: 'actions', label: 'Aksi', render: (e: ExamRow) => (
      <div className="flex gap-1">
        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setDetail(e)} title="Detail"><Eye className="w-4 h-4" /></button>
        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setEdit(e)} title="Edit"><Pencil className="w-4 h-4" /></button>
        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600" onClick={() => setConfirmDelete(e.id)} title="Hapus"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Manajemen Pemeriksaan"
        subtitle="Kelola seluruh riwayat pemeriksaan"
        icon={<Activity className="w-6 h-6" />}
        action={selected.length > 0 ? (
          <button className="btn-danger" onClick={() => setConfirmBulk(selected)}>
            <Trash className="w-4 h-4" /> Hapus Terpilih ({selected.length})
          </button>
        ) : undefined}
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Cari nama atau tanggal (yyyy-mm-dd)..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        </div>
        <button className="btn-ghost text-sm" onClick={toggleSelectAll}>
          {selected.length === pageRows.length && pageRows.length > 0 ? 'Batal Pilih' : 'Pilih Semua Halaman'}
        </button>
      </div>
      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(e) => e.id}
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        onSort={onSort}
        sortKey={sortKey}
        sortDir={sortDir}
        empty="Tidak ada pemeriksaan."
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Pemeriksaan">
        {detail && (
          <div className="space-y-2 text-sm">
            <Row label="Nama" value={detail.profiles?.name ?? '-'} />
            <Row label="Tanggal" value={formatDate(detail.exam_date)} />
            <Row label="Waktu" value={detail.exam_time} />
            <Row label="Tekanan Darah" value={formatBP(detail.systolic, detail.diastolic)} />
            <Row label="Status" value={<span className={`badge ${bpCategoryBg[detail.category]}`}>{detail.category}</span>} />
            <Row label="Denyut Nadi" value={detail.pulse ? `${detail.pulse} bpm` : '-'} />
            <Row label="Berat Badan" value={detail.weight ? `${detail.weight} kg` : '-'} />
            <Row label="Catatan" value={detail.note || '-'} />
          </div>
        )}
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Pemeriksaan">
        {edit && <EditExamForm exam={edit} onSave={saveEdit} />}
      </Modal>

      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && doDelete(confirmDelete)} title="Hapus Pemeriksaan" message="Yakin ingin menghapus pemeriksaan ini?" />
      <ConfirmModal open={!!confirmBulk} onClose={() => setConfirmBulk(null)} onConfirm={() => confirmBulk && doBulkDelete(confirmBulk)} title="Hapus Beberapa Pemeriksaan" message={`Yakin ingin menghapus ${confirmBulk?.length ?? 0} pemeriksaan terpilih?`} />
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

function EditExamForm({ exam, onSave }: { exam: ExamRow; onSave: (v: Partial<Examination>) => Promise<void> }) {
  const [form, setForm] = useState({
    exam_date: exam.exam_date, exam_time: exam.exam_time,
    systolic: exam.systolic, diastolic: exam.diastolic,
    pulse: exam.pulse ?? '', weight: exam.weight ?? '', note: exam.note ?? '',
  });
  const [saving, setSaving] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSaving(true); onSave({
      exam_date: form.exam_date, exam_time: form.exam_time,
      systolic: Number(form.systolic), diastolic: Number(form.diastolic),
      pulse: form.pulse ? Number(form.pulse) : null,
      weight: form.weight ? Number(form.weight) : null,
      note: form.note,
    }).finally(() => setSaving(false)); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Tanggal</label><input type="date" className="input" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} required /></div>
        <div><label className="label">Waktu</label><input type="time" className="input" value={form.exam_time} onChange={(e) => setForm({ ...form, exam_time: e.target.value })} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Sistolik</label><input type="number" className="input" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: Number(e.target.value) })} required min={60} max={250} /></div>
        <div><label className="label">Diastolik</label><input type="number" className="input" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: Number(e.target.value) })} required min={40} max={150} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Nadi</label><input type="number" className="input" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} /></div>
        <div><label className="label">Berat (kg)</label><input type="number" step="0.1" className="input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
      </div>
      <div><label className="label">Catatan</label><textarea className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
      <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan'}</button>
    </form>
  );
}

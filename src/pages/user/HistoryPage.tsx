import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Eye, Pencil, Trash2, Trash, Activity, Clock, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useExaminations } from '@/hooks/useExaminations';
import { useUser } from '@/contexts/UserContext';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { bpCategoryBg, categorizeBP } from '@/lib/bp';
import { formatDate, formatBP } from '@/lib/format';
import type { Examination } from '@/lib/types';
import { PageLoader } from '@/components/ui/Spinner';

export function HistoryPage() {
  const { profile } = useUser();
  const { exams, loading, remove, removeAll, update } = useExaminations();
  const [detail, setDetail] = useState<Examination | null>(null);
  const [edit, setEdit] = useState<Examination | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (loading) return <PageLoader />;

  if (!profile) {
    return (
      <div>
        <PageHeader title="Riwayat Monitoring" icon={<History className="w-6 h-6" />} />
        <div className="card p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Silakan masuk atau daftar untuk melihat riwayat pemeriksaan Anda.</p>
          <Link to="/daftar" className="btn-primary">Daftar Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Riwayat Monitoring"
        subtitle="Seluruh pemeriksaan tekanan darah Anda"
        icon={<History className="w-6 h-6" />}
        action={exams.length > 0 ? (
          <button className="btn-danger" onClick={() => setConfirmClear(true)}>
            <Trash className="w-4 h-4" /> Hapus Semua
          </button>
        ) : undefined}
      />

      {exams.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Belum ada riwayat pemeriksaan. Yuk, lakukan pemeriksaan tekanan darah pertamamu!
          </p>
          <Link to="/monitoring" className="btn-primary">Catat Pemeriksaan</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((e) => (
            <div key={e.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-lg">{formatBP(e.systolic, e.diastolic)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {formatDate(e.exam_date)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {e.exam_time}
                  </p>
                </div>
                <span className={`badge ${bpCategoryBg[e.category]}`}>{e.category}</span>
              </div>
              {e.pulse != null && <p className="text-sm text-slate-500 dark:text-slate-400">Denyut nadi: {e.pulse} bpm</p>}
              {e.weight != null && <p className="text-sm text-slate-500 dark:text-slate-400">Berat: {e.weight} kg</p>}
              {e.note && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">"{e.note}"</p>}
              <div className="flex gap-2 mt-4">
                <button className="btn-ghost text-xs py-1.5 px-2.5" onClick={() => setDetail(e)}><Eye className="w-3.5 h-3.5" /> Detail</button>
                <button className="btn-ghost text-xs py-1.5 px-2.5" onClick={() => setEdit(e)}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button className="btn-ghost text-xs py-1.5 px-2.5 text-rose-600 dark:text-rose-400" onClick={() => setConfirmDelete(e.id)}><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Pemeriksaan">
        {detail && (
          <div className="space-y-3">
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

      {/* Edit */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Pemeriksaan">
        {edit && (
          <EditForm
            exam={edit}
            onSave={async (v) => {
              await update(edit.id, v);
              toast('success', 'Pemeriksaan diperbarui.');
              setEdit(null);
            }}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => { if (confirmDelete) { await remove(confirmDelete); toast('success', 'Riwayat dihapus.'); } }}
        title="Hapus Riwayat"
        message="Yakin ingin menghapus riwayat pemeriksaan ini? Tindakan ini tidak dapat dibatalkan."
      />
      <ConfirmModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => { await removeAll(); toast('success', 'Semua riwayat dihapus.'); }}
        title="Hapus Semua Riwayat"
        message="Yakin ingin menghapus SEMUA riwayat pemeriksaan? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function EditForm({ exam, onSave }: { exam: Examination; onSave: (v: Partial<Examination>) => Promise<void> }) {
  const [form, setForm] = useState({
    exam_date: exam.exam_date,
    exam_time: exam.exam_time,
    systolic: exam.systolic,
    diastolic: exam.diastolic,
    pulse: exam.pulse ?? '',
    weight: exam.weight ?? '',
    note: exam.note ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      exam_date: form.exam_date,
      exam_time: form.exam_time,
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      pulse: form.pulse ? Number(form.pulse) : null,
      weight: form.weight ? Number(form.weight) : null,
      note: form.note,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tanggal</label>
          <input type="date" className="input" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} required />
        </div>
        <div>
          <label className="label">Waktu</label>
          <input type="time" className="input" value={form.exam_time} onChange={(e) => setForm({ ...form, exam_time: e.target.value })} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Sistolik</label>
          <input type="number" className="input" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: Number(e.target.value) })} required min={60} max={250} />
        </div>
        <div>
          <label className="label">Diastolik</label>
          <input type="number" className="input" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: Number(e.target.value) })} required min={40} max={150} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nadi</label>
          <input type="number" className="input" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} />
        </div>
        <div>
          <label className="label">Berat (kg)</label>
          <input type="number" step="0.1" className="input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Catatan</label>
        <textarea className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
    </form>
  );
}

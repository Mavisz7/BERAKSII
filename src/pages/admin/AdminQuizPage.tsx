import { useEffect, useState } from 'react';
import { Brain, Plus, Pencil, Trash2, Search, GripVertical } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useQuizQuestions } from '@/hooks/useQuiz';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';
import { PageLoader } from '@/components/ui/Spinner';
import type { QuizQuestion } from '@/lib/types';

const categoryOptions = [
  'Pengertian', 'Faktor Risiko', 'Gejala', 'Komplikasi', 'Pencegahan',
  'CERDIK', 'Pemeriksaan Tekanan Darah', 'Pengobatan', 'Pola Hidup Sehat', 'Mitos & Fakta', 'Umum',
];

const categoryColor: Record<string, string> = {
  'Pengertian': 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  'Faktor Risiko': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'Gejala': 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  'Komplikasi': 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  'Pencegahan': 'bg-leaf-100 text-leaf-700 dark:bg-leaf-500/15 dark:text-leaf-300',
  'CERDIK': 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  'Pemeriksaan Tekanan Darah': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  'Pengobatan': 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  'Pola Hidup Sehat': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'Mitos & Fakta': 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  'Umum': 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300',
};

export function AdminQuizPage() {
  const { questions, loading, add, update, remove, refetch } = useQuizQuestions();
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState<QuizQuestion | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = questions.filter((q) =>
    q.question.toLowerCase().includes(query.toLowerCase()) || q.category.toLowerCase().includes(query.toLowerCase())
  );

  async function doDelete(id: string) {
    await remove(id);
    await audit('Hapus soal quiz', id);
    toast('success', 'Soal dihapus.');
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Manajemen Quiz"
        subtitle="Kelola bank soal Quiz Edukasi Hipertensi"
        icon={<Brain className="w-6 h-6" />}
        action={<button className="btn-primary" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Tambah Soal</button>}
      />
      <div className="relative max-w-md mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-10" placeholder="Cari soal atau kategori..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-40" />
          Belum ada soal.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="text-slate-300 mt-1"><GripVertical className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                    <span className={`badge ${categoryColor[q.category] ?? ''}`}>{q.category}</span>
                  </div>
                  <p className="font-semibold mb-2">{q.question}</p>
                  <div className="grid sm:grid-cols-2 gap-1.5 mb-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`text-sm rounded-lg px-3 py-1.5 ${idx === q.correct_index ? 'bg-leaf-50 dark:bg-leaf-500/10 text-leaf-700 dark:text-leaf-300 font-medium' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'}`}>
                        {String.fromCharCode(65 + idx)}. {opt} {idx === q.correct_index && '✓'}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">Pembahasan: {q.explanation}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setEdit(q)} title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600" onClick={() => setConfirmDelete(q.id)} title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(edit || creating) && (
        <Modal open onClose={() => { setEdit(null); setCreating(false); }} title={creating ? 'Tambah Soal' : 'Edit Soal'} size="lg">
          <QuestionForm
            question={edit}
            onSave={async (v) => {
              try {
                if (creating) {
                  await add(v);
                  await audit('Tambah soal quiz', v.question.slice(0, 50));
                } else if (edit) {
                  await update(edit.id, v);
                  await audit('Edit soal quiz', edit.id);
                }
                toast('success', 'Soal disimpan.');
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
        title="Hapus Soal"
        message="Yakin ingin menghapus soal ini?"
      />
    </div>
  );
}

function QuestionForm({ question, onSave }: { question: QuizQuestion | null; onSave: (v: Omit<QuizQuestion, 'id' | 'created_at'>) => Promise<void> }) {
  const [form, setForm] = useState({
    question: question?.question ?? '',
    options: question?.options ?? ['', '', '', ''],
    correct_index: question?.correct_index ?? 0,
    explanation: question?.explanation ?? '',
    category: question?.category ?? 'Umum',
    sort_order: question?.sort_order ?? 1,
  });
  const [saving, setSaving] = useState(false);

  function updateOption(idx: number, val: string) {
    const next = [...form.options];
    next[idx] = val;
    setForm({ ...form, options: next });
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (form.options.some((o) => !o.trim())) { toast('error', 'Semua pilihan jawaban harus diisi.'); return; }
      setSaving(true);
      onSave(form).finally(() => setSaving(false));
    }} className="space-y-4">
      <div>
        <label className="label">Pertanyaan</label>
        <textarea className="input min-h-[70px]" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Kategori</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Urutan</label>
          <input type="number" className="input" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="label">Pilihan Jawaban (pilih jawaban benar)</label>
        <div className="space-y-2">
          {form.options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, correct_index: idx })}
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all ${
                  form.correct_index === idx
                    ? 'bg-leaf-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-leaf-100'
                }`}
                title="Tandai sebagai jawaban benar"
              >
                {String.fromCharCode(65 + idx)}
              </button>
              <input
                className="input"
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                required
              />
              {form.correct_index === idx && <span className="badge bg-leaf-100 text-leaf-700 dark:bg-leaf-500/15 dark:text-leaf-300 shrink-0">Benar</span>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Pembahasan</label>
        <textarea className="input min-h-[60px]" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Menyimpan...' : 'Simpan Soal'}</button>
    </form>
  );
}

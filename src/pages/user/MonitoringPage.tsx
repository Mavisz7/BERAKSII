import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Save, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/ui/PageHeader';
import { useUser } from '@/contexts/UserContext';
import { useExaminations } from '@/hooks/useExaminations';
import { toast } from '@/components/ui/Toast';
import { categorizeBP, bpCategoryBg, isDangerous } from '@/lib/bp';
import type { BPCategory } from '@/lib/types';

interface FormValues {
  exam_date: string;
  exam_time: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  weight?: number;
  note?: string;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function MonitoringPage() {
  const { profile } = useUser();
  const { add } = useExaminations();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState<BPCategory | null>(null);
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormValues>({
    defaultValues: { exam_date: todayDate(), exam_time: nowTime() },
  });

  const systolic = watch('systolic');
  const diastolic = watch('diastolic');
  let liveCategory: BPCategory | null = null;
  if (systolic && diastolic) liveCategory = categorizeBP(Number(systolic), Number(diastolic));

  async function onSubmit(v: FormValues) {
    if (!profile) { toast('error', 'Silakan masuk atau daftar terlebih dahulu.'); navigate('/daftar'); return; }
    const s = Number(v.systolic); const d = Number(v.diastolic);
    if (s < 60 || s > 250) { toast('error', 'Nilai sistolik tidak masuk akal (60-250).'); return; }
    if (d < 40 || d > 150) { toast('error', 'Nilai diastolik tidak masuk akal (40-150).'); return; }
    setSubmitting(true);
    try {
      await add({
        exam_date: v.exam_date,
        exam_time: v.exam_time,
        systolic: s,
        diastolic: d,
        pulse: v.pulse ? Number(v.pulse) : null,
        weight: v.weight ? Number(v.weight) : null,
        note: v.note ?? '',
      });
      toast('success', 'Pemeriksaan berhasil disimpan.');
      const cat = categorizeBP(s, d);
      if (isDangerous(cat)) setWarning(cat);
      else navigate('/riwayat');
      reset({ exam_date: todayDate(), exam_time: nowTime() });
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Monitoring Hipertensi" subtitle="Catat hasil pemeriksaan tekanan darah Anda" icon={<Activity className="w-6 h-6" />} />
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tanggal Pemeriksaan</label>
              <input type="date" className="input" {...register('exam_date', { required: 'Tanggal wajib diisi' })} />
              {errors.exam_date && <p className="text-xs text-rose-500 mt-1">{errors.exam_date.message}</p>}
            </div>
            <div>
              <label className="label">Waktu Pemeriksaan</label>
              <input type="time" className="input" {...register('exam_time', { required: 'Waktu wajib diisi' })} />
              {errors.exam_time && <p className="text-xs text-rose-500 mt-1">{errors.exam_time.message}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tekanan Sistolik (mmHg)</label>
              <input type="number" className="input" placeholder="contoh: 120" {...register('systolic', { required: 'Sistolik wajib diisi', min: 60, max: 250 })} />
              {errors.systolic && <p className="text-xs text-rose-500 mt-1">Masukkan nilai 60-250.</p>}
            </div>
            <div>
              <label className="label">Tekanan Diastolik (mmHg)</label>
              <input type="number" className="input" placeholder="contoh: 80" {...register('diastolic', { required: 'Diastolik wajib diisi', min: 40, max: 150 })} />
              {errors.diastolic && <p className="text-xs text-rose-500 mt-1">Masukkan nilai 40-150.</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Denyut Nadi (opsional)</label>
              <input type="number" className="input" placeholder="contoh: 75" {...register('pulse', { min: 30, max: 220 })} />
            </div>
            <div>
              <label className="label">Berat Badan / kg (opsional)</label>
              <input type="number" step="0.1" className="input" placeholder="contoh: 65.5" {...register('weight', { min: 20, max: 300 })} />
            </div>
          </div>
          <div>
            <label className="label">Catatan (opsional)</label>
            <textarea className="input min-h-[80px]" placeholder="Misal: setelah olahraga, setelah minum obat..." {...register('note')} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? 'Menyimpan...' : <>Simpan Pemeriksaan <Save className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold mb-3">Pratinjau Status</h3>
            {liveCategory ? (
              <div className="text-center py-4">
                <span className={`badge text-sm px-4 py-1.5 ${bpCategoryBg[liveCategory]}`}>{liveCategory}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                  {liveCategory === 'Normal' && 'Tekanan darah Anda normal. Pertahankan!'}
                  {liveCategory === 'Meningkat' && 'Tekanan meningkat. Perhatikan pola hidup.'}
                  {liveCategory === 'Hipertensi Stadium 1' && 'Hipertensi stadium 1. Konsultasi ke tenaga kesehatan.'}
                  {liveCategory === 'Hipertensi Stadium 2' && 'Tekanan darah cukup tinggi. Segera konsultasi.'}
                  {liveCategory === 'Krisis Hipertensi' && 'Krisis hipertensi! Butuh penanganan segera.'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Isi sistolik & diastolik untuk melihat status.</p>
            )}
          </div>
          <div className="card p-6 bg-gradient-to-br from-brand-50 to-leaf-50 dark:from-brand-500/10 dark:to-leaf-500/10">
            <h3 className="font-bold mb-2">Tips Pengukuran</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5">
              <li>• Istirahat 5 menit sebelum mengukur</li>
              <li>• Duduk dengan tangan sejajar jantung</li>
              <li>• Hindari kopi/rokok 30 menit sebelumnya</li>
              <li>• Ukur di lengan yang sama setiap kali</li>
            </ul>
          </div>
        </div>
      </div>

      {warning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setWarning(null)} />
          <div className="relative card p-6 max-w-md w-full animate-scale-in border-rose-200 dark:border-rose-500/30">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Peringatan Tekanan Darah</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Tekanan darah Anda cukup tinggi ({warning}). Segera konsultasikan ke Puskesmas Ambacang atau fasilitas kesehatan terdekat.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button className="btn-ghost" onClick={() => setWarning(null)}>Tutup</button>
              <button className="btn-primary" onClick={() => { setWarning(null); navigate('/riwayat'); }}>Lihat Riwayat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/ui/PageHeader';
import { useUser } from '@/contexts/UserContext';
import { computeRisk, riskColor, riskAdvice } from '@/lib/screening';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import type { ScreeningAnswers, Sex, RiskLevel } from '@/lib/types';

const questions: { key: keyof ScreeningAnswers; label: string; type: 'number' | 'sex' | 'bool'; placeholder?: string }[] = [
  { key: 'age', label: 'Berapa umur Anda?', type: 'number', placeholder: 'Tahun' },
  { key: 'sex', label: 'Jenis kelamin Anda?', type: 'sex' },
  { key: 'familyHistory', label: 'Apakah ada riwayat hipertensi dalam keluarga?', type: 'bool' },
  { key: 'smoking', label: 'Apakah Anda merokok?', type: 'bool' },
  { key: 'lowActivity', label: 'Apakah aktivitas fisik Anda kurang dari 30 menit/hari?', type: 'bool' },
  { key: 'highSalt', label: 'Apakah Anda sering mengonsumsi garam berlebih?', type: 'bool' },
  { key: 'overweight', label: 'Apakah berat badan Anda berlebih?', type: 'bool' },
  { key: 'diabetes', label: 'Apakah Anda memiliki riwayat diabetes?', type: 'bool' },
];

export function ScreeningPage() {
  const { profile } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<ScreeningAnswers>>({});
  const [result, setResult] = useState<{ score: number; level: RiskLevel } | null>(null);
  const { register, handleSubmit, formState: { errors }, trigger } = useForm<ScreeningAnswers>({ defaultValues: { age: 0 } });

  async function next() {
    const valid = await trigger(['age', 'sex'] as (keyof ScreeningAnswers)[]);
    if (step === 0 && !valid) return;
    setStep((s) => s + 1);
  }

  function answerBool(key: keyof ScreeningAnswers, value: boolean) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  async function finish() {
    const finalAnswers: ScreeningAnswers = {
      age: Number(answers.age ?? 0),
      sex: (answers.sex ?? 'L') as Sex,
      familyHistory: answers.familyHistory ?? false,
      smoking: answers.smoking ?? false,
      lowActivity: answers.lowActivity ?? false,
      highSalt: answers.highSalt ?? false,
      overweight: answers.overweight ?? false,
      diabetes: answers.diabetes ?? false,
    };
    const { score, level } = computeRisk(finalAnswers);
    setResult({ score, level });
    if (isSupabaseConfigured && profile) {
      await supabase.from('screenings').insert({
        profile_id: profile.id,
        answers: finalAnswers,
        risk_level: level,
        score,
      });
    }
    toast('success', 'Skrining selesai. Lihat hasil di bawah.');
  }

  function reset() {
    setStep(0); setAnswers({}); setResult(null);
  }

  const colorMap: Record<RiskLevel, string> = {
    Rendah: 'text-leaf-600 bg-leaf-50 dark:bg-leaf-500/10 dark:text-leaf-400',
    Sedang: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
    Tinggi: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
  };

  if (result) {
    return (
      <div>
        <PageHeader title="Hasil Skrining" subtitle="Tingkat risiko hipertensi Anda" icon={<ClipboardCheck className="w-6 h-6" />} />
        <div className="max-w-2xl mx-auto">
          <div className={`card p-8 text-center animate-scale-in ${result.level === 'Tinggi' ? 'border-rose-200 dark:border-rose-500/30' : ''}`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${colorMap[result.level]}`}>
              {result.level === 'Tinggi' ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tingkat Risiko Hipertensi</p>
            <h2 className={`text-3xl font-extrabold mb-2 ${colorMap[result.level]}`}>{result.level}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Skor risiko: {result.score}</p>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-left">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{riskAdvice[result.level]}</p>
            </div>
            {result.level === 'Tinggi' && (
              <div className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-4 text-left flex gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  Risiko Anda tinggi. Segera konsultasikan ke Puskesmas Ambacang atau fasilitas kesehatan terdekat.
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <button onClick={reset} className="btn-ghost"><RotateCcw className="w-4 h-4" /> Ulangi Skrining</button>
              <button onClick={() => navigate('/monitoring')} className="btn-primary">Catat Tekanan Darah <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = questions[step];
  const isLast = step === questions.length - 1;

  return (
    <div>
      <PageHeader title="Skrining Hipertensi" subtitle="Jawab pertanyaan untuk mengetahui risiko Anda" icon={<ClipboardCheck className="w-6 h-6" />} />
      {!profile && (
        <div className="card p-4 mb-6 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-sm text-amber-700 dark:text-amber-300">
          Anda belum masuk. Hasil skrining tetap dapat dilihat, namun tidak tersimpan ke akun. <a href="/daftar" className="font-semibold underline">Daftar</a> untuk menyimpan.
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <form onSubmit={handleSubmit(() => (isLast ? finish() : next()))} className="card p-8 animate-fade-in">
          <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-2">Pertanyaan {step + 1} dari {questions.length}</p>
          <h2 className="text-xl font-bold mb-6">{current.label}</h2>

          {current.type === 'number' && (
            <div>
              <input
                type="number"
                className="input"
                placeholder={current.placeholder}
                {...register('age', { required: 'Umur wajib diisi', min: 1, max: 120 })}
                onInput={(e) => setAnswers((a) => ({ ...a, age: Number((e.target as HTMLInputElement).value) }))}
              />
              {errors.age && <p className="text-xs text-rose-500 mt-1">Masukkan umur yang valid (1-120).</p>}
            </div>
          )}
          {current.type === 'sex' && (
            <div className="grid grid-cols-2 gap-3">
              {(['L', 'P'] as Sex[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, sex: s }))}
                  className={`rounded-xl border-2 p-4 font-semibold transition-all ${answers.sex === s ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'}`}
                >
                  {s === 'L' ? 'Laki-laki' : 'Perempuan'}
                </button>
              ))}
            </div>
          )}
          {current.type === 'bool' && (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => answerBool(current.key, true)} className={`rounded-xl border-2 p-4 font-semibold transition-all ${answers[current.key] === true ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700 hover:border-rose-300'}`}>Ya</button>
              <button type="button" onClick={() => answerBool(current.key, false)} className={`rounded-xl border-2 p-4 font-semibold transition-all ${answers[current.key] === false ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-500/10 text-leaf-700 dark:text-leaf-300' : 'border-slate-200 dark:border-slate-700 hover:border-leaf-300'}`}>Tidak</button>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Kembali</button>
            ) : <span />}
            <button type="submit" className="btn-primary">
              {isLast ? <>Lihat Hasil <ArrowRight className="w-4 h-4" /></> : <>Lanjut <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

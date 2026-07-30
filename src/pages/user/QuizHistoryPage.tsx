import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Award, Clock, CheckCircle2, XCircle, Eye, RotateCcw, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { useQuizResults, useQuizQuestions, getResultCategory } from '@/hooks/useQuiz';
import { useSettings } from '@/hooks/useSettings';
import { downloadCertificate } from '@/lib/certificate';
import type { QuizResult } from '@/lib/types';
import { formatDate } from '@/lib/format';

export function QuizHistoryPage() {
  const { results, loading } = useQuizResults();
  const { questions } = useQuizQuestions();
  const { settings } = useSettings();
  const [detail, setDetail] = useState<QuizResult | null>(null);

  if (loading) return <PageLoader />;

  const categoryColor: Record<string, string> = {
    'Sangat Baik': 'bg-leaf-100 text-leaf-700 dark:bg-leaf-500/15 dark:text-leaf-300',
    'Baik': 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
    'Cukup': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    'Perlu Belajar Lagi': 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  };

  return (
    <div>
      <PageHeader
        title="Riwayat Quiz"
        subtitle="Seluruh hasil Quiz Edukasi Anda"
        icon={<Brain className="w-6 h-6" />}
        action={<Link to="/quiz" className="btn-primary"><RotateCcw className="w-4 h-4" /> Kerjakan Quiz</Link>}
      />

      {results.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Belum ada riwayat quiz. Yuk, kerjakan quiz pertamamu!
          </p>
          <Link to="/quiz" className="btn-primary">Mulai Quiz <ArrowRight className="w-4 h-4" /></Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <div key={r.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`text-3xl font-extrabold ${r.passed ? 'text-leaf-600 dark:text-leaf-400' : 'text-rose-600 dark:text-rose-400'}`}>{r.score}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(r.created_at?.slice(0, 10) ?? '')}</p>
                </div>
                <span className={`badge ${categoryColor[r.category] ?? ''}`}>{r.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="rounded-lg bg-leaf-50 dark:bg-leaf-500/10 p-2">
                  <p className="text-sm font-bold text-leaf-600 dark:text-leaf-400">{r.correct_count}</p>
                  <p className="text-[10px] text-slate-500">Benar</p>
                </div>
                <div className="rounded-lg bg-rose-50 dark:bg-rose-500/10 p-2">
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{r.wrong_count}</p>
                  <p className="text-[10px] text-slate-500">Salah</p>
                </div>
                <div className="rounded-lg bg-brand-50 dark:bg-brand-500/10 p-2">
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{Math.floor(r.duration_sec / 60)}m {r.duration_sec % 60}s</p>
                  <p className="text-[10px] text-slate-500">Waktu</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost text-xs py-1.5 px-3 flex-1" onClick={() => setDetail(r)}>
                  <Eye className="w-3.5 h-3.5" /> Detail
                </button>
                {r.score >= 80 && (
                  <button
                    className="btn-leaf text-xs py-1.5 px-3"
                    onClick={() => downloadCertificate({ name: r.profile_name, score: r.score, date: r.created_at ?? new Date().toISOString(), settings })}
                  >
                    <Award className="w-3.5 h-3.5" /> Sertifikat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal with review */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail & Pembahasan Quiz" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <div>
                <p className="text-3xl font-extrabold">{detail.score}</p>
                <p className="text-xs text-slate-500">{detail.category}</p>
              </div>
              <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                <p>{formatDate(detail.created_at?.slice(0, 10) ?? '')}</p>
                <p>Benar: {detail.correct_count} | Salah: {detail.wrong_count}</p>
                <p>Waktu: {Math.floor(detail.duration_sec / 60)}m {detail.duration_sec % 60}s</p>
              </div>
            </div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {detail.answers.map((a, i) => {
                const q = questions.find((qq) => qq.id === a.questionId);
                if (!q) return null;
                return (
                  <div key={a.questionId} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === a.correctIndex;
                        const isSelected = idx === a.selectedIndex;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                              isCorrect ? 'bg-leaf-50 dark:bg-leaf-500/10 text-leaf-700 dark:text-leaf-300'
                              : isSelected ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
                              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-leaf-500 shrink-0" />}
                            {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                            {!isCorrect && !isSelected && <span className="w-4 h-4 shrink-0" />}
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 p-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-brand-700 dark:text-brand-300">Pembahasan: </span>{q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

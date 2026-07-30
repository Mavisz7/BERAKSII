import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw, BookOpen, Video, Award, AlertTriangle, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { useUser } from '@/contexts/UserContext';
import { useQuizQuestions, useQuizResults, shuffleArray, shuffleQuestion, getResultCategory } from '@/hooks/useQuiz';
import { useSettings } from '@/hooks/useSettings';
import { downloadCertificate } from '@/lib/certificate';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';
import type { QuizQuestion, QuizAnswer } from '@/lib/types';

const TIMER_SECONDS = 600; // 10 minutes

type Phase = 'intro' | 'quiz' | 'result';

export function QuizPage() {
  const { profile } = useUser();
  const navigate = useNavigate();
  const { questions, loading } = useQuizQuestions();
  const { save } = useQuizResults();
  const { settings } = useSettings();

  const [phase, setPhase] = useState<Phase>('intro');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [result, setResult] = useState<{
    score: number; correct: number; wrong: number; duration: number;
    reviewData: { question: QuizQuestion; selectedIndex: number | null }[];
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Timer
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timeLeft <= 0) { finishQuiz(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  function startQuiz() {
    if (!profile) { toast('error', 'Silakan masuk atau daftar terlebih dahulu.'); navigate('/daftar'); return; }
    const shuffled = shuffleArray(questions).map(shuffleQuestion);
    setQuizQuestions(shuffled);
    setAnswers({});
    setCurrent(0);
    setTimeLeft(TIMER_SECONDS);
    setPhase('quiz');
    startTimeRef.current = Date.now();
  }

  function selectAnswer(qId: string, index: number) {
    setAnswers((a) => ({ ...a, [qId]: index }));
  }

  async function finishQuiz() {
    if (saving) return;
    setSaving(true);
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    let correct = 0;
    const reviewData = quizQuestions.map((q) => {
      const sel = answers[q.id] ?? null;
      if (sel === q.correct_index) correct++;
      return { question: q, selectedIndex: sel };
    });
    const wrong = quizQuestions.length - correct;
    const score = Math.round((correct / quizQuestions.length) * 100);
    const category = getResultCategory(score);

    const reviewAnswers: QuizAnswer[] = quizQuestions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? -1,
      correctIndex: q.correct_index,
    }));

    try {
      await save({
        profile_id: profile!.id,
        profile_name: profile!.name,
        score,
        correct_count: correct,
        wrong_count: wrong,
        total_questions: quizQuestions.length,
        duration_sec: duration,
        passed: score >= 70,
        category,
        answers: reviewAnswers,
      });
      await audit('Quiz selesai', `${profile!.name}: ${score} (${category})`);
    } catch (e) {
      toast('error', (e as Error).message);
    }

    setResult({ score, correct, wrong, duration, reviewData });
    setPhase('result');
    setSaving(false);
  }

  if (loading) return <PageLoader />;

  // INTRO
  if (phase === 'intro') {
    return (
      <div>
        <PageHeader title="Quiz Edukasi Hipertensi" subtitle="Uji pemahaman Anda tentang hipertensi" icon={<Brain className="w-6 h-6" />} />
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-leaf-500 flex items-center justify-center shadow-xl mx-auto mb-5">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Selamat Datang di Quiz Edukasi</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Quiz ini berisi {questions.length} soal pilihan ganda tentang hipertensi.
              Jawab semua soal dalam waktu 10 menit. Soal dan pilihan jawaban diacak setiap kali quiz dimulai.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <InfoBox icon={<Brain className="w-5 h-5" />} label="Soal" value={`${questions.length}`} />
              <InfoBox icon={<Clock className="w-5 h-5" />} label="Waktu" value="10 menit" />
              <InfoBox icon={<Award className="w-5 h-5" />} label="KKM" value="70" />
            </div>
            {!profile && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 text-sm text-amber-700 dark:text-amber-300 mb-4">
                Anda belum masuk. Silakan daftar/masuk untuk menyimpan hasil quiz.
              </div>
            )}
            <button onClick={startQuiz} className="btn-primary px-8 py-3 text-lg">Mulai Quiz <ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    );
  }

  // RESULT
  if (phase === 'result' && result) {
    const { score, correct, wrong, duration, reviewData } = result;
    const category = getResultCategory(score);
    const passed = score >= 70;
    const canCertificate = score >= 80;

    const colorClass = score >= 90
      ? 'text-leaf-600 dark:text-leaf-400'
      : score >= 80
        ? 'text-brand-600 dark:text-brand-400'
        : score >= 70
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-rose-600 dark:text-rose-400';

    return (
      <div>
        <PageHeader title="Hasil Quiz" subtitle="Hasil Quiz Edukasi Hipertensi Anda" icon={<Brain className="w-6 h-6" />} />
        <div className="max-w-2xl mx-auto">
          {/* Score card with animation */}
          <div className="card p-8 text-center animate-scale-in mb-6">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-leaf-50 dark:bg-leaf-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
              <span className={`text-4xl font-extrabold ${colorClass}`}>{score}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Nilai Anda</p>
            <h2 className={`text-2xl font-bold mb-4 ${colorClass}`}>{category}</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatBox label="Benar" value={correct} color="text-leaf-600 dark:text-leaf-400" />
              <StatBox label="Salah" value={wrong} color="text-rose-600 dark:text-rose-400" />
              <StatBox label="Waktu" value={`${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`} color="text-brand-600 dark:text-brand-400" />
            </div>
            {canCertificate && (
              <button
                onClick={() => downloadCertificate({ name: profile!.name, score, date: new Date().toISOString(), settings })}
                className="btn-leaf w-full mb-3"
              >
                <Award className="w-4 h-4" /> Unduh Sertifikat Edukasi BERAKSIKU
              </button>
            )}
            {!passed && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-4 mb-4 text-left flex gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  Nilai Anda masih dapat ditingkatkan. Pelajari kembali materi edukasi dan tonton Video Edukasi BERAKSIKU, kemudian coba kerjakan quiz kembali.
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => navigate('/edukasi')} className="btn-ghost"><BookOpen className="w-4 h-4" /> Baca Materi</button>
              <button onClick={() => navigate('/video')} className="btn-outline"><Video className="w-4 h-4" /> Tonton Video</button>
              <button onClick={startQuiz} className="btn-primary"><RotateCcw className="w-4 h-4" /> Ulangi Quiz</button>
            </div>
          </div>

          {/* Review */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4">Pembahasan Soal</h3>
            <div className="space-y-5">
              {reviewData.map((r, i) => (
                <div key={r.question.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <p className="font-semibold mb-3">{i + 1}. {r.question.question}</p>
                  <div className="space-y-2">
                    {r.question.options.map((opt, idx) => {
                      const isCorrect = idx === r.question.correct_index;
                      const isSelected = idx === r.selectedIndex;
                      const showGreen = isCorrect;
                      const showRed = isSelected && !isCorrect;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                            showGreen ? 'bg-leaf-50 dark:bg-leaf-500/10 text-leaf-700 dark:text-leaf-300 border border-leaf-200 dark:border-leaf-500/30'
                            : showRed ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {showGreen && <CheckCircle2 className="w-4 h-4 text-leaf-500 shrink-0" />}
                          {showRed && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                          {!showGreen && !showRed && <span className="w-4 h-4 shrink-0" />}
                          <span>{opt}</span>
                          {isSelected && <span className="ml-auto text-xs font-medium">(Jawaban Anda)</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-lg bg-brand-50 dark:bg-brand-500/10 p-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-brand-700 dark:text-brand-300">Pembahasan: </span>{r.question.explanation}
                  </div>
                  <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-2">{r.question.category}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <button onClick={() => navigate('/riwayat-quiz')} className="btn-ghost">Lihat Riwayat Quiz</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ
  const q = quizQuestions[current];
  const progress = ((current + 1) / quizQuestions.length) * 100;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const isLow = timeLeft < 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      <PageHeader title="Quiz Edukasi Hipertensi" subtitle="Jawab semua soal dengan teliti" icon={<Brain className="w-6 h-6" />} />

      {/* Progress + timer */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-semibold">Soal {current + 1} / {quizQuestions.length}</span>
          <span className={`flex items-center gap-1 font-mono font-bold ${isLow ? 'text-rose-500' : 'text-brand-600 dark:text-brand-400'}`}>
            <Clock className="w-4 h-4" /> {mm}:{ss}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
          <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400">{answeredCount} dari {quizQuestions.length} terjawab</p>
      </div>

      {/* Question card */}
      <div className="card p-6 animate-fade-in" key={q.id}>
        <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 mb-3">{q.category}</span>
        <h2 className="text-lg font-bold mb-5">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            const selected = answers[q.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => selectAnswer(q.id, idx)}
                className={`w-full text-left rounded-xl border-2 px-4 py-3 font-medium transition-all ${
                  selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold mr-3">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-ghost disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </button>
          {current < quizQuestions.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finishQuiz} disabled={saving} className="btn-leaf">
              <CheckCircle2 className="w-4 h-4" /> Selesai
            </button>
          )}
        </div>
      </div>

      {/* Question navigator */}
      <div className="card p-4 mt-5">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Navigasi Soal</p>
        <div className="flex flex-wrap gap-2">
          {quizQuestions.map((qq, i) => {
            const answered = answers[qq.id] !== undefined;
            const isCurrent = i === current;
            return (
              <button
                key={qq.id}
                onClick={() => setCurrent(i)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'bg-brand-600 text-white'
                    : answered
                      ? 'bg-leaf-100 dark:bg-leaf-500/15 text-leaf-700 dark:text-leaf-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        {answeredCount === quizQuestions.length && (
          <button onClick={finishQuiz} disabled={saving} className="btn-leaf w-full mt-4">
            <CheckCircle2 className="w-4 h-4" /> Selesaikan Quiz
          </button>
        )}
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
      <div className="flex justify-center text-brand-500 mb-1">{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

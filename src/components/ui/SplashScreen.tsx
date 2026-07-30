import { useEffect, useState } from 'react';
import { HeartPulse } from 'lucide-react';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(onDone, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-200/30 dark:bg-brand-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent-200/30 dark:bg-accent-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-xl shadow-brand-500/30 animate-heartbeat">
          <HeartPulse className="w-11 h-11 text-white" strokeWidth={2.5} />
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
          BERAKSIKU
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
          Bersama Kendalikan Hipertensi
        </p>

        <div className="mt-8 w-40 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 animate-progress-fill" />
        </div>
      </div>
    </div>
  );
}

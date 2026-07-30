import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';
export interface Toast { id: number; kind: ToastKind; message: string; }

let pushFn: ((kind: ToastKind, message: string) => void) | null = null;

export function toast(kind: ToastKind, message: string) {
  pushFn?.(kind, message);
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles: Record<ToastKind, string> = {
  success: 'border-success-200 bg-success-50 text-success-800 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-300',
  error: 'border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-300',
  info: 'border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-300',
  warning: 'border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-300',
};

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    pushFn = (kind, message) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, message }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    };
    return () => { pushFn = null; };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.kind];
        return (
          <div key={t.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-in-right ${styles[t.kind]}`}>
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => setToasts((arr) => arr.filter((x) => x.id !== t.id))} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

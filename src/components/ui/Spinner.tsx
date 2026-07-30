export function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-8 h-8 text-brand-500" />
        <p className="text-sm text-slate-400">Memuat data...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-1/3 rounded-lg" />
      <div className="skeleton h-8 w-2/3 rounded-lg" />
      <div className="skeleton h-4 w-1/2 rounded-lg" />
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="card p-4 space-y-2">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonVideo() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-5 w-1/3 rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonVideoGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonVideo key={i} />
      ))}
    </div>
  );
}

export function SkeletonArticle() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-32 w-full rounded-xl" />
      <div className="skeleton h-5 w-1/4 rounded-lg" />
      <div className="skeleton h-6 w-3/4 rounded-lg" />
      <div className="skeleton h-4 w-full rounded-lg" />
      <div className="skeleton h-4 w-2/3 rounded-lg" />
    </div>
  );
}

export function SkeletonArticleGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonArticle key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="skeleton w-9 h-9 rounded-xl" />
        <div className="skeleton h-4 w-24 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-2/3 rounded-lg" />
      <div className="skeleton h-4 w-1/3 rounded-lg" />
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-3">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton h-4 rounded-lg flex-1" style={{ width: `${100 - c * 10}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps<T> {
  columns: { key: string; label: string; render?: (row: T) => ReactNode; sortable?: boolean; className?: string }[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
}

export function DataTable<T>({
  columns, rows, rowKey, empty, page, pageSize, total, onPage, onSort, sortKey, sortDir,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-left border-b border-slate-100 dark:border-slate-800">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider ${c.sortable ? 'cursor-pointer select-none hover:text-brand-600 transition-colors' : ''} ${c.className ?? ''}`}
                  onClick={() => c.sortable && onSort?.(c.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {c.sortable && sortKey === c.key && (
                      sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-brand-500" /> : <ArrowDown className="w-3 h-3 text-brand-500" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {empty ?? 'Tidak ada data.'}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={rowKey(row)} className={`hover:bg-brand-50/40 dark:hover:bg-slate-800/40 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''}`}>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${c.className ?? ''}`}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{start}–{end}</span> dari <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-sm">{page} / {totalPages}</span>
            <button
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

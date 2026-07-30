import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 ${c.sortable ? 'cursor-pointer select-none hover:text-brand-600' : ''} ${c.className ?? ''}`}
                  onClick={() => c.sortable && onSort?.(c.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {c.sortable && sortKey === c.key && (
                      <span className="text-brand-500">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                  {empty ?? 'Tidak ada data.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            Menampilkan {start}–{end} dari {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-medium">{page} / {totalPages}</span>
            <button
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

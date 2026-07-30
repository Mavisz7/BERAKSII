import { useMemo, useState } from 'react';
import { FileText, Download, Printer, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAdminData } from '@/hooks/useAdminData';
import { DataTable } from '@/components/ui/DataTable';
import { PageLoader } from '@/components/ui/Spinner';
import { bpCategoryBg } from '@/lib/bp';
import { formatDate, formatBP } from '@/lib/format';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';
import type { Examination } from '@/lib/types';

type ExamRow = Examination & { profiles: { name: string } };

export function AdminReportsPage() {
  const { exams, loading } = useAdminData();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return (exams as ExamRow[]).filter((e) => {
      if (from && e.exam_date < from) return false;
      if (to && e.exam_date > to) return false;
      return true;
    });
  }, [exams, from, to]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { key: 'profiles', label: 'Nama', render: (e: ExamRow) => e.profiles?.name ?? '-' },
    { key: 'exam_date', label: 'Tanggal', render: (e: ExamRow) => formatDate(e.exam_date) },
    { key: 'exam_time', label: 'Waktu' },
    { key: 'systolic', label: 'Tekanan', render: (e: ExamRow) => formatBP(e.systolic, e.diastolic) },
    { key: 'category', label: 'Status', render: (e: ExamRow) => <span className={`badge ${bpCategoryBg[e.category]}`}>{e.category}</span> },
  ];

  function exportCSV() {
    const headers = ['Nama', 'Tanggal', 'Waktu', 'Sistolik', 'Diastolik', 'Nadi', 'Berat', 'Status', 'Catatan'];
    const rows = filtered.map((e) => [
      e.profiles?.name ?? '-', e.exam_date, e.exam_time, e.systolic, e.diastolic,
      e.pulse ?? '', e.weight ?? '', e.category, (e.note ?? '').replace(/[\n,]/g, ' '),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c)}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    download(blob, `laporan-beraksiku-${Date.now()}.csv`);
    audit('Export laporan', `CSV ${filtered.length} baris`);
    toast('success', 'Laporan Excel/CSV berhasil diunduh.');
  }

  function exportPDF() {
    const win = window.open('', '_blank');
    if (!win) { toast('error', 'Izinkan pop-up untuk mencetak.'); return; }
    const rowsHtml = filtered.map((e) => `
      <tr>
        <td>${e.profiles?.name ?? '-'}</td><td>${formatDate(e.exam_date)}</td><td>${e.exam_time}</td>
        <td>${formatBP(e.systolic, e.diastolic)}</td><td>${e.pulse ?? '-'}</td><td>${e.category}</td>
      </tr>`).join('');
    win.document.write(`
      <html><head><title>Laporan BERAKSIKU</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:32px;color:#0f172a}
        h1{color:#1f6df0}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
        th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}th{background:#eff8ff}
        .meta{color:#64748b;font-size:13px;margin-bottom:8px}
      </style></head><body>
      <h1>Laporan Program BERAKSIKU</h1>
      <p class="meta">Puskesmas Ambacang — Dibuat ${new Date().toLocaleString('id-ID')}</p>
      <p class="meta">Rentang: ${from || 'Awal'} s/d ${to || 'Akhir'} — Total: ${filtered.length} pemeriksaan</p>
      <table><thead><tr><th>Nama</th><th>Tanggal</th><th>Waktu</th><th>Tekanan</th><th>Nadi</th><th>Status</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
    audit('Export laporan', `PDF ${filtered.length} baris`);
  }

  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Laporan" subtitle="Export & cetak laporan pemeriksaan" icon={<FileText className="w-6 h-6" />} />
      <div className="card p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <label className="label flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Dari Tanggal</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Sampai Tanggal</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <button className="btn-leaf" onClick={exportCSV}><Download className="w-4 h-4" /> Excel/CSV</button>
            <button className="btn-primary" onClick={exportPDF}><Printer className="w-4 h-4" /> PDF / Cetak</button>
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={pageRows}
        rowKey={(e) => e.id}
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPage={setPage}
        empty="Tidak ada data pada rentang ini."
      />
    </div>
  );
}

export function formatBP(s: number, d: number): string {
  return `${s}/${d} mmHg`;
}

export function formatDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function waLink(number: string): string {
  const cleaned = number.replace(/[^0-9]/g, '').replace(/^0/, '62');
  return `https://wa.me/${cleaned}`;
}

export function igLink(handle: string): string {
  const h = handle.replace(/^@/, '');
  return `https://instagram.com/${h}`;
}

import { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSettings } from '@/hooks/useSettings';
import { toast } from '@/components/ui/Toast';
import { audit } from '@/lib/audit';

export function AdminSettingsPage() {
  const { settings, update } = useSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await update(form);
    await audit('Ubah pengaturan website', 'Pengaturan diperbarui');
    toast('success', 'Pengaturan website disimpan.');
    setSaving(false);
  }

  return (
    <div>
      <PageHeader title="Pengaturan Website" subtitle="Ubah informasi & tampilan program BERAKSIKU" icon={<SettingsIcon className="w-6 h-6" />} />
      <form onSubmit={save} className="card p-6 max-w-3xl space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Nama Program</label><input className="input" value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} /></div>
          <div><label className="label">Subjudul</label><input className="input" value={form.program_subtitle} onChange={(e) => setForm({ ...form, program_subtitle: e.target.value })} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">URL Logo (opsional)</label><input className="input" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." /></div>
          <div><label className="label">URL Banner (opsional)</label><input className="input" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} placeholder="https://..." /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Nomor WhatsApp</label><input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
          <div><label className="label">Instagram</label><input className="input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
        </div>
        <div><label className="label">Alamat</label><textarea className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Jam Operasional</label><input className="input" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
          <div><label className="label">Informasi Kontak / Nama Puskesmas</label><input className="input" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} /></div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Menyimpan...' : <>Simpan Pengaturan <Save className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}

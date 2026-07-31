import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, LogIn, Phone } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/Toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export function LoginPage() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) { toast('error', 'Nomor HP wajib diisi.'); return; }
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data } = await supabase.from('profiles').select('*').eq('phone', phone.trim()).maybeSingle();
        if (!data) { toast('error', 'Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.'); setLoading(false); return; }
        const p = data as Profile;
        if (p.disabled) { toast('error', 'Akun Anda dinonaktifkan. Hubungi Puskesmas.'); setLoading(false); return; }
        login(p);
        toast('success', `Selamat datang kembali, ${p.name}!`);
        navigate('/dashboard');
      } else {
        const saved = localStorage.getItem('beraksiku_profile');
        if (!saved) { toast('error', 'Belum ada pengguna. Silakan daftar terlebih dahulu.'); setLoading(false); return; }
        const p = JSON.parse(saved) as Profile;
        if (p.phone !== phone.trim()) { toast('error', 'Nomor HP tidak sesuai.'); setLoading(false); return; }
        login(p);
        toast('success', `Selamat datang kembali, ${p.name}!`);
        navigate('/dashboard');
      }
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="card p-8 animate-scale-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 flex items-center justify-center shadow-lg mb-3">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Masuk Pengguna</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
            Masuk dengan nomor HP yang terdaftar untuk melihat riwayatmu.
          </p>
        </div>
        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="label">Nomor HP</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" placeholder="08xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Memproses...' : <>Masuk <LogIn className="w-4 h-4" /></>}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Belum punya akun? <Link to="/daftar" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}

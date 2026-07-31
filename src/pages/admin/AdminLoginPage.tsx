import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, LogIn } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export function AdminLoginPage() {
  const { isAdmin, login, mustChangePassword, changePassword } = useAdmin();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin && !mustChangePassword) return <Navigate to="/admin/dashboard" replace />;

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Gagal masuk.'); return; }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password minimal 6 karakter.'); return; }
    setLoading(true);
    const res = await changePassword(newPassword);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Gagal mengganti password.'); return; }
    navigate('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 flex items-center justify-center shadow-2xl mx-auto mb-3">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel Admin</h1>
          <p className="text-slate-400 text-sm">BERAKSIKU — Puskesmas Ambacang</p>
        </div>
        <div className="card p-8 animate-scale-in">
          {mustChangePassword ? (
            <form onSubmit={onChangePassword} className="space-y-4">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-3 text-sm text-amber-700 dark:text-amber-300 mb-2">
                Untuk keamanan, silakan ganti password bawaan terlebih dahulu.
              </div>
              <div>
                <label className="label">Password Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" className="input pl-10" placeholder="Minimal 6 karakter" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Memproses...' : 'Simpan & Lanjut'}</button>
            </form>
          ) : (
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-10" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" className="input pl-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Memproses...' : <>Masuk <LogIn className="w-4 h-4" /></>}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export function AccessDeniedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-2xl mx-auto mb-6 animate-scale-in">
          <ShieldOff className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">Akses Ditolak</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="btn-primary px-8 py-3"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HeartPulse, UserPlus, ArrowRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/Toast';
import type { Sex } from '@/lib/types';

interface FormValues {
  name: string;
  age: number;
  sex: Sex;
  phone: string;
}

export function RegisterPage() {
  const { register: registerUser } = useUser();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  async function onSubmit(v: FormValues) {
    setSubmitting(true);
    try {
      await registerUser({ name: v.name.trim(), age: Number(v.age), sex: v.sex, phone: v.phone.trim() });
      toast('success', 'Pendaftaran berhasil. Selamat datang!');
      navigate('/');
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="card p-8 animate-scale-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-leaf-500 flex items-center justify-center shadow-lg mb-3">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Daftar Pengguna</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
            Isi data singkat untuk mulai mencatat pemeriksaan tekanan darahmu.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input className="input" placeholder="Nama Anda" {...register('name', { required: 'Nama wajib diisi' })} />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Umur</label>
              <input type="number" className="input" placeholder="Tahun" {...register('age', { required: 'Umur wajib diisi', min: { value: 1, message: 'Umur tidak valid' }, max: { value: 120, message: 'Umur tidak valid' } })} />
              {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age.message}</p>}
            </div>
            <div>
              <label className="label">Jenis Kelamin</label>
              <select className="input" {...register('sex', { required: 'Wajib dipilih' })}>
                <option value="">Pilih...</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              {errors.sex && <p className="text-xs text-rose-500 mt-1">{errors.sex.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Nomor HP</label>
            <input className="input" placeholder="08xxxxxxxxxx" {...register('phone', { required: 'Nomor HP wajib diisi' })} />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? 'Memproses...' : <>Daftar Sekarang <UserPlus className="w-4 h-4" /></>}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Sudah terdaftar? <Link to="/masuk" className="text-brand-600 dark:text-brand-400 font-medium hover:underline inline-flex items-center gap-1">Masuk <ArrowRight className="w-3.5 h-3.5" /></Link>
        </p>
      </div>
    </div>
  );
}

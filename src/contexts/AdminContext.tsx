import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { audit } from '@/lib/audit';

interface AdminCtx {
  isAdmin: boolean;
  loading: boolean;
  mustChangePassword: boolean;
  login: (u: string, p: string) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (p: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const Ctx = createContext<AdminCtx | null>(null);
const LS_KEY = 'beraksiku_admin';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChange] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === '1') {
        if (isSupabaseConfigured) {
          // Re-validate against DB: ensure admin_credentials still exists
          const { data } = await supabase
            .from('admin_credentials')
            .select('must_change_password')
            .eq('id', 1)
            .maybeSingle();
          if (data) {
            setIsAdmin(true);
            setMustChange(Boolean((data as { must_change_password: boolean }).must_change_password));
          } else {
            // Credentials removed/invalid — clear stale session
            localStorage.removeItem(LS_KEY);
          }
        } else {
          // Offline mode: trust localStorage
          setIsAdmin(true);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function login(u: string, p: string) {
    if (!isSupabaseConfigured) {
      if (u === 'admin' && p === 'admin123') {
        setIsAdmin(true);
        setMustChange(true);
        localStorage.setItem(LS_KEY, '1');
        return { ok: true };
      }
      return { ok: false, error: 'Username atau password salah.' };
    }
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return { ok: false, error: 'Gagal menghubungi server.' };
    const cred = data as { username: string; password_hash: string; must_change_password: boolean };
    if (u !== cred.username || p !== cred.password_hash)
      return { ok: false, error: 'Username atau password salah.' };
    setIsAdmin(true);
    setMustChange(cred.must_change_password);
    localStorage.setItem(LS_KEY, '1');
    await audit('Login admin', `Username: ${u}`);
    return { ok: true };
  }

  async function changePassword(p: string) {
    if (!isSupabaseConfigured) {
      setMustChange(false);
      return { ok: true };
    }
    const { error } = await supabase
      .from('admin_credentials')
      .update({ password_hash: p, must_change_password: false })
      .eq('id', 1);
    if (error) return { ok: false, error: error.message };
    setMustChange(false);
    await audit('Ganti password admin', 'Password berhasil diperbarui');
    return { ok: true };
  }

  function logout() {
    setIsAdmin(false);
    localStorage.removeItem(LS_KEY);
  }

  return (
    <Ctx.Provider value={{ isAdmin, loading, mustChangePassword, login, changePassword, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdmin must be used within AdminProvider');
  return c;
}

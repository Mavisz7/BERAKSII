import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UserCtx {
  profile: Profile | null;
  loading: boolean;
  register: (p: Omit<Profile, 'id' | 'created_at' | 'disabled'>) => Promise<Profile>;
  login: (p: Profile) => void;
  update: (p: Partial<Profile>) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<UserCtx | null>(null);
const LS_KEY = 'beraksiku_profile';

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const p = JSON.parse(saved) as Profile;
        if (isSupabaseConfigured) {
          const { data } = await supabase.from('profiles').select('*').eq('id', p.id).maybeSingle();
          if (data && !(data as Profile).disabled) setProfile(data as Profile);
          else if (data && (data as Profile).disabled) {
            localStorage.removeItem(LS_KEY);
          } else setProfile(p);
        } else {
          setProfile(p);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function register(input: Omit<Profile, 'id' | 'created_at' | 'disabled'>) {
    let p: Profile;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ name: input.name, age: input.age, sex: input.sex, phone: input.phone })
        .select()
        .single();
      if (error) throw new Error(error.message);
      p = data as Profile;
    } else {
      p = { ...input, id: crypto.randomUUID() } as Profile;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(p));
    setProfile(p);
    return p;
  }

  async function update(patch: Partial<Profile>) {
    if (!profile) return;
    if (isSupabaseConfigured) {
      await supabase.from('profiles').update(patch).eq('id', profile.id);
    }
    const next = { ...profile, ...patch };
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    setProfile(next);
  }

  function login(p: Profile) {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
    setProfile(p);
  }

  function logout() {
    localStorage.removeItem(LS_KEY);
    setProfile(null);
  }

  return (
    <Ctx.Provider value={{ profile, loading, register, login, update, logout }}>{children}</Ctx.Provider>
  );
}

export function useUser() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useUser must be used within UserProvider');
  return c;
}

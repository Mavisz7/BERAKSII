import { useEffect, useState } from 'react';
import type { SiteSettings } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const LS_KEY = 'beraksiku_settings';
const defaultSettings: SiteSettings = {
  id: 1,
  program_name: 'BERAKSIKU',
  program_subtitle: 'Bersama Kendalikan Hipertensi',
  logo_url: '',
  banner_url: '',
  whatsapp: '082311006711',
  instagram: '@puskesmasambacang',
  address: 'Jl. By Pass No. 5 KM. 8, Ps. Ambacang, Kec. Kuranji, Kota Padang, Sumatera Barat.',
  hours: 'Senin - Sabtu, 08.00 - 14.00 WIB',
  contact_info: 'Puskesmas Ambacang',
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured) { setLoading(false); return; }
      const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
      if (data) {
        const s = data as SiteSettings;
        setSettings(s);
        localStorage.setItem(LS_KEY, JSON.stringify(s));
      }
      setLoading(false);
    })();
  }, []);

  async function update(patch: Partial<SiteSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    if (isSupabaseConfigured) {
      await supabase.from('settings').upsert({ ...next, id: 1 }).eq('id', 1);
    }
  }

  return { settings, loading, update };
}

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing — running in offline/local-only mode.');
}

export const supabase = createClient(url ?? '', anon ?? '', {
  auth: { persistSession: false },
});

export const isSupabaseConfigured = Boolean(url && anon);

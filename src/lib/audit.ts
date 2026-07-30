import { supabase, isSupabaseConfigured } from './supabase';

export async function audit(action: string, detail = '') {
  if (!isSupabaseConfigured) return;
  await supabase.from('audit_logs').insert({ action, detail });
}

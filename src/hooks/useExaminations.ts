import { useCallback, useEffect, useState } from 'react';
import type { Examination } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { categorizeBP } from '@/lib/bp';
import { useUser } from '@/contexts/UserContext';

const LS_KEY = 'beraksiku_exams';

function loadLocal(): Examination[] {
  const saved = localStorage.getItem(LS_KEY);
  return saved ? (JSON.parse(saved) as Examination[]) : [];
}

function saveLocal(rows: Examination[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

export function useExaminations() {
  const { profile } = useUser();
  const [exams, setExams] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!profile) { setExams([]); setLoading(false); return; }
    if (isSupabaseConfigured) {
      const { data } = await supabase
        .from('examinations')
        .select('*')
        .eq('profile_id', profile.id)
        .order('exam_date', { ascending: false })
        .order('exam_time', { ascending: false });
      setExams((data as Examination[]) ?? []);
    } else {
      const all = loadLocal().filter((e) => e.profile_id === profile.id);
      all.sort((a, b) => (b.exam_date + b.exam_time).localeCompare(a.exam_date + a.exam_time));
      setExams(all);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => { refetch(); }, [refetch]);

  async function add(input: Omit<Examination, 'id' | 'profile_id' | 'category' | 'created_at'>) {
    if (!profile) throw new Error('Profil belum tersedia.');
    const category = categorizeBP(input.systolic, input.diastolic);
    const row: Examination = {
      ...input,
      id: crypto.randomUUID(),
      profile_id: profile.id,
      category,
      pulse: input.pulse ?? null,
      weight: input.weight ?? null,
      note: input.note ?? '',
    };
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('examinations')
        .insert({
          profile_id: profile.id,
          exam_date: input.exam_date,
          exam_time: input.exam_time,
          systolic: input.systolic,
          diastolic: input.diastolic,
          pulse: input.pulse ?? null,
          weight: input.weight ?? null,
          note: input.note ?? '',
          category,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      setExams((prev) => [data as Examination, ...prev]);
      return data as Examination;
    }
    const next = [row, ...loadLocal()];
    saveLocal(next);
    setExams((prev) => [row, ...prev]);
    return row;
  }

  async function update(id: string, patch: Partial<Examination>) {
    if (!profile) return;
    let finalPatch = { ...patch };
    if (patch.systolic != null && patch.diastolic != null) {
      finalPatch = { ...finalPatch, category: categorizeBP(patch.systolic, patch.diastolic) };
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('examinations').update(finalPatch).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      setExams((prev) => prev.map((e) => (e.id === id ? (data as Examination) : e)));
    } else {
      const next = loadLocal().map((e) => (e.id === id ? { ...e, ...finalPatch } as Examination : e));
      saveLocal(next);
      setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...finalPatch } as Examination : e)));
    }
  }

  async function remove(id: string) {
    if (isSupabaseConfigured) await supabase.from('examinations').delete().eq('id', id);
    else saveLocal(loadLocal().filter((e) => e.id !== id));
    setExams((prev) => prev.filter((e) => e.id !== id));
  }

  async function removeAll() {
    if (!profile) return;
    if (isSupabaseConfigured) await supabase.from('examinations').delete().eq('profile_id', profile.id);
    else saveLocal(loadLocal().filter((e) => e.profile_id !== profile.id));
    setExams([]);
  }

  return { exams, loading, refetch, add, update, remove, removeAll };
}

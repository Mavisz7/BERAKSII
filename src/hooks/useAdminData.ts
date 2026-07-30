import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, Examination, EduVideo, QuizResult } from '@/lib/types';

interface Stats {
  totalUsers: number;
  totalExams: number;
  examsToday: number;
  examsThisMonth: number;
  normalUsers: number;
  hypertensiveUsers: number;
  byCategory: Record<string, number>;
  byMonth: { month: string; count: number }[];
  totalVideos: number;
  totalVideoViews: number;
  videoCategories: Record<string, number>;
  quizParticipants: number;
  quizTotal: number;
  quizAvgScore: number;
  quizHighScore: number;
  quizLowScore: number;
  quizPassRate: number;
  quizScoreDist: { range: string; count: number }[];
  quizPerDay: { day: string; count: number }[];
  quizWrongCategories: { category: string; count: number }[];
}

export function useAdminData() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    const [pRes, eRes, vRes, qrRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('examinations').select('*, profiles!inner(name)').order('created_at', { ascending: false }),
      supabase.from('edu_videos').select('*').order('sort_order', { ascending: true }),
      supabase.from('quiz_results').select('*').order('created_at', { ascending: false }),
    ]);
    const ps = (pRes.data as Profile[]) ?? [];
    const es = (eRes.data as (Examination & { profiles: { name: string } })[]) ?? [];
    setProfiles(ps);
    setExams(es);
    const vs = (vRes.data as EduVideo[]) ?? [];
    const qrs = (qrRes.data as QuizResult[]) ?? [];

    const today = new Date().toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);
    const byCategory: Record<string, number> = {};
    es.forEach((e) => { byCategory[e.category] = (byCategory[e.category] ?? 0) + 1; });

    const byMonthMap: Record<string, number> = {};
    es.forEach((e) => {
      const m = e.exam_date.slice(0, 7);
      byMonthMap[m] = (byMonthMap[m] ?? 0) + 1;
    });
    const byMonth = Object.entries(byMonthMap).sort().slice(-6).map(([month, count]) => ({ month, count }));

    // per-user latest category
    const latestByUser: Record<string, string> = {};
    es.forEach((e) => { if (!latestByUser[e.profile_id]) latestByUser[e.profile_id] = e.category; });
    let normalUsers = 0, hypertensiveUsers = 0;
    Object.values(latestByUser).forEach((c) => {
      if (c === 'Normal' || c === 'Meningkat') normalUsers++;
      else hypertensiveUsers++;
    });

    const videoCategories: Record<string, number> = {};
    vs.forEach((v) => { videoCategories[v.category] = (videoCategories[v.category] ?? 0) + 1; });

    // Quiz stats
    const quizParticipants = new Set(qrs.map((r) => r.profile_id)).size;
    const quizTotal = qrs.length;
    const quizAvgScore = quizTotal ? Math.round(qrs.reduce((s, r) => s + r.score, 0) / quizTotal) : 0;
    const quizHighScore = quizTotal ? Math.max(...qrs.map((r) => r.score)) : 0;
    const quizLowScore = quizTotal ? Math.min(...qrs.map((r) => r.score)) : 0;
    const quizPassCount = qrs.filter((r) => r.passed).length;
    const quizPassRate = quizTotal ? Math.round((quizPassCount / quizTotal) * 100) : 0;

    const scoreRanges = [
      { range: '0-69', min: 0, max: 69, count: 0 },
      { range: '70-79', min: 70, max: 79, count: 0 },
      { range: '80-89', min: 80, max: 89, count: 0 },
      { range: '90-100', min: 90, max: 100, count: 0 },
    ];
    qrs.forEach((r) => {
      const found = scoreRanges.find((s) => r.score >= s.min && r.score <= s.max);
      if (found) found.count++;
    });
    const quizScoreDist = scoreRanges.map((s) => ({ range: s.range, count: s.count }));

    const quizPerDayMap: Record<string, number> = {};
    qrs.forEach((r) => {
      const d = (r.created_at ?? '').slice(0, 10);
      if (d) quizPerDayMap[d] = (quizPerDayMap[d] ?? 0) + 1;
    });
    const quizPerDay = Object.entries(quizPerDayMap).sort().slice(-7).map(([day, count]) => ({ day, count }));

    const quizWrongMap: Record<string, number> = {};
    qrs.forEach((r) => {
      (r.answers as { correctIndex: number; selectedIndex: number }[]).forEach((a) => {
        if (a.selectedIndex !== a.correctIndex) {
          // We don't have category here; use a generic label
          quizWrongMap['Soal Salah'] = (quizWrongMap['Soal Salah'] ?? 0) + 1;
        }
      });
    });
    const quizWrongCategories = Object.entries(quizWrongMap).map(([category, count]) => ({ category, count }));

    setStats({
      totalUsers: ps.length,
      totalExams: es.length,
      examsToday: es.filter((e) => e.exam_date === today).length,
      examsThisMonth: es.filter((e) => e.exam_date.startsWith(monthPrefix)).length,
      normalUsers,
      hypertensiveUsers,
      byCategory,
      byMonth,
      totalVideos: vs.length,
      totalVideoViews: vs.reduce((sum, v) => sum + (v.views ?? 0), 0),
      videoCategories,
      quizParticipants,
      quizTotal,
      quizAvgScore,
      quizHighScore,
      quizLowScore,
      quizPassRate,
      quizScoreDist,
      quizPerDay,
      quizWrongCategories,
    });
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { stats, profiles, exams, loading, refetch };
}

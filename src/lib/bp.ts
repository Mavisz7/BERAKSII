import type { BPCategory } from './types';

export function categorizeBP(systolic: number, diastolic: number): BPCategory {
  if (systolic >= 180 || diastolic >= 120) return 'Krisis Hipertensi';
  if (systolic >= 140 || diastolic >= 90) return 'Hipertensi Stadium 2';
  if (systolic >= 130 || diastolic >= 85) return 'Hipertensi Stadium 1';
  if (systolic >= 120 || diastolic >= 80) return 'Meningkat';
  return 'Normal';
}

export const bpCategoryColor: Record<BPCategory, string> = {
  Normal: 'emerald',
  Meningkat: 'amber',
  'Hipertensi Stadium 1': 'orange',
  'Hipertensi Stadium 2': 'red',
  'Krisis Hipertensi': 'rose',
};

export const bpCategoryText: Record<BPCategory, string> = {
  Normal: 'text-emerald-600 dark:text-emerald-400',
  Meningkat: 'text-amber-600 dark:text-amber-400',
  'Hipertensi Stadium 1': 'text-orange-600 dark:text-orange-400',
  'Hipertensi Stadium 2': 'text-red-600 dark:text-red-400',
  'Krisis Hipertensi': 'text-rose-600 dark:text-rose-400',
};

export const bpCategoryBg: Record<BPCategory, string> = {
  Normal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Meningkat: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'Hipertensi Stadium 1': 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  'Hipertensi Stadium 2': 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  'Krisis Hipertensi': 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

export function isDangerous(category: BPCategory): boolean {
  return category === 'Hipertensi Stadium 2' || category === 'Krisis Hipertensi';
}

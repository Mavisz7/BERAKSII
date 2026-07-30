import type { RiskLevel, ScreeningAnswers } from './types';

export function computeRisk(a: ScreeningAnswers): { score: number; level: RiskLevel } {
  let score = 0;
  if (a.age >= 55) score += 3;
  else if (a.age >= 40) score += 2;
  else if (a.age >= 18) score += 1;

  if (a.sex === 'L') score += 1;
  if (a.familyHistory) score += 2;
  if (a.smoking) score += 2;
  if (a.lowActivity) score += 1;
  if (a.highSalt) score += 2;
  if (a.overweight) score += 2;
  if (a.diabetes) score += 2;

  let level: RiskLevel = 'Rendah';
  if (score >= 9) level = 'Tinggi';
  else if (score >= 5) level = 'Sedang';

  return { score, level };
}

export const riskColor: Record<RiskLevel, string> = {
  Rendah: 'emerald',
  Sedang: 'amber',
  Tinggi: 'red',
};

export const riskAdvice: Record<RiskLevel, string> = {
  Rendah:
    'Risiko Anda rendah. Pertahankan pola hidup sehat: konsumsi garam secukupnya, aktif bergerak, hindari rokok, dan periksa tekanan darah minimal sekali setahun.',
  Sedang:
    'Risiko Anda sedang. Mulailah membatasi garam, tingkatkan aktivitas fisik 30 menit/hari, kelola stres, dan periksa tekanan darah setiap 6 bulan.',
  Tinggi:
    'Risiko Anda tinggi. Segera konsultasikan ke Puskesmas Ambacang atau fasilitas kesehatan terdekat untuk pemeriksaan dan pengelolaan lebih lanjut.',
};

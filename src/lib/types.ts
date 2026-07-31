export type Sex = 'L' | 'P';

export interface Profile {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  phone: string;
  disabled?: boolean;
  created_at?: string;
}

export type BPCategory =
  | 'Normal'
  | 'Meningkat'
  | 'Hipertensi Stadium 1'
  | 'Hipertensi Stadium 2'
  | 'Krisis Hipertensi';

export interface Examination {
  id: string;
  profile_id: string;
  exam_date: string; // yyyy-mm-dd
  exam_time: string; // HH:mm
  systolic: number;
  diastolic: number;
  pulse?: number | null;
  weight?: number | null;
  note?: string;
  category: BPCategory;
  created_at?: string;
}

export interface ScreeningAnswers {
  age: number;
  sex: Sex;
  familyHistory: boolean;
  smoking: boolean;
  lowActivity: boolean;
  highSalt: boolean;
  overweight: boolean;
  diabetes: boolean;
}

export type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi';

export interface Screening {
  id: string;
  profile_id: string | null;
  answers: ScreeningAnswers;
  risk_level: RiskLevel;
  score: number;
  created_at?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  icon: string;
  featured: boolean;
  created_at?: string;
}

export interface SiteSettings {
  id: number;
  program_name: string;
  program_subtitle: string;
  logo_url: string;
  banner_url: string;
  whatsapp: string;
  instagram: string;
  address: string;
  hours: string;
  contact_info: string;
}

export interface AuditLog {
  id: string;
  action: string;
  detail: string;
  created_at?: string;
}

export type VideoCategory =
  | 'Hipertensi'
  | 'Pola Hidup Sehat'
  | 'BERAKSI'
  | 'Aktivitas Fisik'
  | 'Gizi Seimbang'
  | 'Pemeriksaan Tekanan Darah';

export interface EduVideo {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  duration: string;
  video_url: string;
  thumbnail_url: string;
  goal: string;
  sort_order: number;
  views: number;
  created_at?: string;
}

export type QuizCategory =
  | 'Pengertian'
  | 'Faktor Risiko'
  | 'Gejala'
  | 'Komplikasi'
  | 'Pencegahan'
  | 'BERAKSI'
  | 'Pemeriksaan Tekanan Darah'
  | 'Pengobatan'
  | 'Pola Hidup Sehat'
  | 'Mitos & Fakta'
  | 'Umum';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  category: string;
  sort_order: number;
  created_at?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
}

export type QuizResultCategory = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Belajar Lagi';

export interface QuizResult {
  id: string;
  profile_id: string;
  profile_name: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  total_questions: number;
  duration_sec: number;
  passed: boolean;
  category: string;
  answers: QuizAnswer[];
  created_at?: string;
}

export interface Badge {
  key: string;
  label: string;
  description: string;
  icon: string;
  earned: boolean;
}

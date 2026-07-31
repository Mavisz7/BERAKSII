import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, ClipboardCheck, Video, Activity, Brain, LayoutDashboard,
  LineChart, BookOpen, History, User as UserIcon, ShieldCheck, ArrowRight,
  Play, Users, Stethoscope, ChevronDown, MapPin, Phone, Instagram, Sparkles,
  CheckCircle2, Menu, X, Sun, Moon, Building2,
  Cigarette, Dumbbell, Apple, Wine, Stethoscope as StethoscopeIcon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/hooks/useSettings';
import { useVideos } from '@/hooks/useVideos';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Reveal, useCountUp } from '@/components/ui/Reveal';

const advantages = [
  { icon: ClipboardCheck, title: 'Skrining Hipertensi', desc: 'Deteksi dini risiko hipertensi secara mandiri.', color: 'from-brand-500 to-brand-600' },
  { icon: Video, title: 'Video Edukasi', desc: 'Video singkat yang mudah dipahami.', color: 'from-accent-500 to-accent-600' },
  { icon: Activity, title: 'Monitoring', desc: 'Pantau tekanan darah dari waktu ke waktu.', color: 'from-cyan-500 to-accent-500' },
  { icon: Brain, title: 'Quiz Edukasi', desc: 'Uji pengetahuan setelah belajar.', color: 'from-violet-500 to-brand-500' },
];

const features = [
  { icon: LayoutDashboard, title: 'Dashboard', desc: 'Ringkasan aktivitas & skor kesehatan Anda.', to: '/dashboard' },
  { icon: ClipboardCheck, title: 'Skrining', desc: 'Deteksi dini risiko hipertensi.', to: '/skrining' },
  { icon: Activity, title: 'Monitoring', desc: 'Catat tekanan darah harian.', to: '/monitoring' },
  { icon: LineChart, title: 'Grafik', desc: 'Visualisasi tren tekanan darah.', to: '/grafik' },
  { icon: Video, title: 'Video Edukasi', desc: 'Tonton video kesehatan singkat.', to: '/video' },
  { icon: BookOpen, title: 'Materi Edukasi', desc: 'Artikel tentang hipertensi.', to: '/edukasi' },
  { icon: Brain, title: 'Quiz', desc: 'Uji pemahaman dengan quiz interaktif.', to: '/quiz' },
  { icon: History, title: 'Riwayat', desc: 'Lihat history pemeriksaan Anda.', to: '/riwayat' },
  { icon: UserIcon, title: 'Profil', desc: 'Kelola data pribadi & akun.', to: '/riwayat' },
  { icon: ShieldCheck, title: 'Dashboard Admin', desc: 'Panel administrasi puskesmas.', to: '/admin' },
];

const beraksi = [
  { letter: 'B', icon: Sparkles, title: 'Batasi konsumsi garam dan makanan tinggi lemak', desc: 'Batasi garam maksimal 1 sendok teh per hari dan kurangi makanan tinggi lemak.' },
  { letter: 'E', icon: Cigarette, title: 'Enyahkan asap rokok', desc: 'Hindari rokok aktif maupun pasif untuk menjaga kesehatan jantung dan pembuluh darah.' },
  { letter: 'R', icon: Dumbbell, title: 'Rajin aktivitas fisik', desc: 'Lakukan aktivitas fisik minimal 30 menit setiap hari.' },
  { letter: 'A', icon: Apple, title: 'Atur pola makan sehat', desc: 'Perbanyak buah, sayur, protein sehat dan makanan bergizi seimbang.' },
  { letter: 'K', icon: Brain, title: 'Kelola stres dengan baik', desc: 'Kelola stres melalui relaksasi, ibadah, tidur cukup dan aktivitas positif.' },
  { letter: 'S', icon: Wine, title: 'Stop konsumsi alkohol', desc: 'Hindari minuman beralkohol untuk menjaga tekanan darah tetap stabil.' },
  { letter: 'I', icon: StethoscopeIcon, title: 'Ikuti pemeriksaan tekanan darah secara rutin', desc: 'Periksa tekanan darah secara berkala di rumah maupun fasilitas kesehatan.' },
];

const faqs = [
  { q: 'Apa itu hipertensi?', a: 'Hipertensi atau tekanan darah tinggi adalah kondisi di mana tekanan darah pada dinding arteri lebih tinggi dari nilai normal dalam waktu lama. Hipertensi sering disebut "the silent killer" karena umumnya tidak menimbulkan gejala namun dapat merusak organ vital.' },
  { q: 'Bagaimana cara menggunakan BERAKSIKU?', a: 'Daftar akun, lakukan skrining hipertensi, baca materi edukasi, tonton video, kerjakan quiz, dan catat tekanan darah Anda secara berkala di menu Monitoring. Semua aktivitas tercatat di Dashboard.' },
  { q: 'Apakah website ini gratis?', a: 'Ya, BERAKSIKU sepenuhnya gratis untuk seluruh masyarakat yang dilayani Puskesmas Ambacang.' },
  { q: 'Apakah data saya aman?', a: 'Data Anda disimpan dengan aman dan hanya digunakan untuk keperluan edukasi dan pemantauan kesehatan oleh tenaga kesehatan Puskesmas Ambacang.' },
  { q: 'Bagaimana cara melakukan skrining?', a: 'Buka menu Skrining Hipertensi, jawab beberapa pertanyaan singkat tentang kondisi kesehatan Anda, dan sistem akan menampilkan tingkat risiko hipertensi Anda.' },
];

function Stat({ icon: Icon, value, label, color }: { icon: typeof Users; value: number; label: string; color: string }) {
  const { val, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-3xl font-extrabold tabular-nums">{val}+</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function LandingPage() {
  const { theme, toggle } = useTheme();
  const { settings } = useSettings();
  const { videos } = useVideos();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [stats, setStats] = useState({ users: 0, exams: 0, videos: 0, quizzes: 0 });

  const recentVideos = videos.slice(0, 3);

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured) {
        setStats({ users: 128, exams: 342, videos: 5, quizzes: 89 });
        return;
      }
      try {
        const [u, e, v, q] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('examinations').select('id', { count: 'exact', head: true }),
          supabase.from('edu_videos').select('id', { count: 'exact', head: true }),
          supabase.from('quiz_results').select('id', { count: 'exact', head: true }),
        ]);
        setStats({
          users: u.count ?? 128,
          exams: e.count ?? 342,
          videos: v.count ?? 5,
          quizzes: q.count ?? 89,
        });
      } catch {
        setStats({ users: 128, exams: 342, videos: 5, quizzes: 89 });
      }
    })();
  }, []);

  const navLinks = [
    { href: '#keunggulan', label: 'Keunggulan' },
    { href: '#fitur', label: 'Fitur' },
    { href: '#beraksi', label: 'BERAKSI' },
    { href: '#video', label: 'Video' },
    { href: '#tentang', label: 'Tentang' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-extrabold text-base leading-tight">{settings.program_name}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{settings.program_subtitle}</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Ganti tema">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link to="/daftar" className="btn-primary text-sm py-2 hidden sm:inline-flex">Daftar</Link>
            <Link to="/masuk" className="btn-outline text-sm py-2 hidden sm:inline-flex">Masuk</Link>
            <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileNav((o) => !o)} aria-label="Menu">
              {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileNav && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-1 animate-fade-in-fast">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileNav(false)} className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">{l.label}</a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/daftar" className="btn-primary text-sm py-2 flex-1">Daftar</Link>
              <Link to="/masuk" className="btn-outline text-sm py-2 flex-1">Masuk</Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-200/30 dark:bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-200/30 dark:bg-accent-500/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="animate-slide-up">
            <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Platform Edukasi Digital
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              BERAKSIKU
            </h1>
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Bersama Kendalikan Hipertensi</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-lg">
              Platform edukasi digital Puskesmas Ambacang yang membantu masyarakat mengenali, mencegah, dan mengendalikan hipertensi melalui skrining, edukasi, monitoring tekanan darah, video edukasi, dan quiz interaktif.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/skrining" className="btn-primary text-base px-6 py-3">
                <ClipboardCheck className="w-5 h-5" /> Mulai Skrining
              </Link>
              <Link to="/video" className="btn-outline text-base px-6 py-3">
                <Play className="w-5 h-5" /> Tonton Video Edukasi
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section id="keunggulan" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Mengapa Memilih BERAKSIKU?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Solusi digital terpadu untuk pengendalian hipertensi yang mudah, edukatif, dan terukur.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {advantages.map((a, i) => {
              const Icon = a.icon;
              return (
                <Reveal key={i} delay={i * 80} className="card p-6 card-hover group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{a.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{a.desc}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FITUR UTAMA */}
      <section id="fitur" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Fitur Utama</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Seluruh fitur BERAKSIKU dalam satu platform yang terintegrasi.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={i} delay={i * 50} className="card p-5 card-hover group">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{f.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all">Pelajari <ArrowRight className="w-3 h-3" /></span>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* BERAKSI */}
      <section id="beraksi" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="badge bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300 mb-3">Pola Hidup Sehat</span>
            <h2 className="text-3xl font-extrabold mb-3">7 Prinsip BERAKSI</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Tujuh prinsip utama Program BERAKSI untuk membantu masyarakat mencegah dan mengendalikan hipertensi melalui perubahan gaya hidup sehat.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {beraksi.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={i} delay={i * 70} className="card p-6 card-hover group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {c.letter}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                        <h3 className="font-bold">{c.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* VIDEO EDUKASI */}
      <section id="video" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold mb-1">Video Edukasi Terbaru</h2>
              <p className="text-slate-500 dark:text-slate-400">Tonton materi kesehatan yang mudah dipahami.</p>
            </div>
            <Link to="/video" className="btn-outline text-sm py-2 shrink-0">Lihat Semua <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentVideos.map((v, i) => (
              <Reveal key={v.id} delay={i * 80} className="card overflow-hidden card-hover group">
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-brand-600 ml-0.5" fill="currentColor" />
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 text-xs font-mono bg-black/70 text-white px-2 py-0.5 rounded">{v.duration}</span>
                </div>
                <div className="p-4">
                  <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300 mb-2">{v.category}</span>
                  <h3 className="font-bold text-sm group-hover:text-brand-600 transition-colors line-clamp-2">{v.title}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-brand-600 to-accent-700 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-12">Dampak BERAKSIKU</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <Stat icon={Users} value={stats.users} label="Pengguna" color="from-white/20 to-white/10" />
            <Stat icon={HeartPulse} value={stats.exams} label="Pemeriksaan" color="from-white/20 to-white/10" />
            <Stat icon={Video} value={stats.videos} label="Video Edukasi" color="from-white/20 to-white/10" />
            <Stat icon={Brain} value={stats.quizzes} label="Quiz" color="from-white/20 to-white/10" />
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
        <Reveal className="card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Tentang Puskesmas Ambacang</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
            Puskesmas Ambacang berkomitmen meningkatkan kesehatan masyarakat melalui inovasi digital. BERAKSIKU hadir sebagai platform edukasi terpadu untuk membantu masyarakat mengenali, mencegah, dan mengendalikan hipertensi secara mandiri dan terukur.
          </p>
          <Link to="/kontak" className="btn-primary">Tentang Kami <ArrowRight className="w-4 h-4" /></Link>
        </Reveal>
        </div>
      </section>

      {/* KONTAK + MAPS */}
      <section className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold mb-6">Hubungi Kami</h2>
            <div className="space-y-4">
              <div className="card p-5 flex items-start gap-4 card-hover">
                <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold mb-0.5">Alamat</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{settings.address}</p>
                </div>
              </div>
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="card p-5 flex items-start gap-4 card-hover">
                <div className="w-11 h-11 rounded-xl bg-success-50 dark:bg-success-500/10 text-success-600 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold mb-0.5">WhatsApp</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{settings.whatsapp}</p>
                </div>
              </a>
              <a href={`https://instagram.com/${settings.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="card p-5 flex items-start gap-4 card-hover">
                <div className="w-11 h-11 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 flex items-center justify-center shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold mb-0.5">Instagram</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{settings.instagram}</p>
                </div>
              </a>
            </div>
          </Reveal>
          <Reveal>
            <div className="card overflow-hidden h-full min-h-[400px]">
              <iframe
                title="Lokasi Puskesmas Ambacang"
                src="https://www.google.com/maps?q=Puskesmas+Ambacang+Padang&output=embed"
                className="w-full h-full min-h-[400px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-3">Pertanyaan Umum</h2>
            <p className="text-slate-500 dark:text-slate-400">Jawaban untuk pertanyaan yang sering ditanyakan.</p>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="card overflow-hidden animate-fade-in">
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <Reveal className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-brand-600 to-accent-700 p-8 sm:p-12 text-center text-white shadow-xl shadow-brand-600/20">
          <h2 className="text-3xl font-extrabold mb-3">Siap Mulai Perjalanan Sehatmu?</h2>
          <p className="text-white/85 mb-6 max-w-xl mx-auto">Bergabung dengan ribuan masyarakat yang telah mengendalikan hipertensi bersama BERAKSIKU.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/daftar" className="btn bg-white text-brand-700 hover:bg-slate-100 px-6 py-3 text-base font-semibold">Daftar Sekarang <ArrowRight className="w-5 h-5" /></Link>
            <Link to="/skrining" className="btn bg-white/15 text-white hover:bg-white/25 px-6 py-3 text-base font-semibold">Mulai Skrining</Link>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300 pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-extrabold text-white">{settings.program_name}</p>
                <p className="text-xs text-slate-400">{settings.program_subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{settings.contact_info}</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/skrining" className="hover:text-brand-400 transition-colors">Skrining</Link></li>
              <li><Link to="/edukasi" className="hover:text-brand-400 transition-colors">Edukasi</Link></li>
              <li><Link to="/video" className="hover:text-brand-400 transition-colors">Video</Link></li>
              <li><Link to="/quiz" className="hover:text-brand-400 transition-colors">Quiz</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Kontak</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {settings.address}</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> {settings.whatsapp}</li>
              <li className="flex items-center gap-2"><Instagram className="w-4 h-4 shrink-0" /> {settings.instagram}</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Media Sosial</p>
            <div className="flex gap-2">
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors"><Phone className="w-5 h-5" /></a>
              <a href={`https://instagram.com/${settings.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-accent-600 flex items-center justify-center transition-colors"><Instagram className="w-5 h-5" /></a>
              <Link to="/kontak" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors"><Building2 className="w-5 h-5" /></Link>
            </div>
            <p className="text-xs text-slate-500 mt-4">{settings.hours}</p>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {settings.program_name} — {settings.program_subtitle}
        </div>
      </footer>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto animate-float">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-200/40 to-accent-200/40 dark:from-brand-500/10 dark:to-accent-500/10 rounded-[3rem] blur-2xl" />
      <div className="relative card p-8 rounded-[2.5rem]">
        <svg viewBox="0 0 400 400" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background circle */}
          <circle cx="200" cy="200" r="180" fill="url(#bgGrad)" opacity="0.5" />
          {/* Heart pulse line */}
          <path d="M40 200 L100 200 L120 160 L140 240 L160 180 L180 200 L360 200" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="2s" repeatCount="indefinite" />
          </path>
          {/* Main heart */}
          <g className="animate-pulse">
            <path d="M200 280 C160 250, 130 220, 130 185 C130 165, 145 150, 165 150 C180 150, 195 160, 200 175 C205 160, 220 150, 235 150 C255 150, 270 165, 270 185 C270 220, 240 250, 200 280 Z" fill="url(#heartGrad)" />
          </g>
          {/* EKG inside heart */}
          <path d="M170 200 L185 200 L192 185 L200 215 L208 190 L215 200 L230 200" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Floating cards */}
          <g>
            <rect x="40" y="60" width="100" height="50" rx="12" fill="white" className="drop-shadow-lg" />
            <circle cx="65" cy="85" r="10" fill="#10b981" />
            <rect x="82" y="78" width="45" height="6" rx="3" fill="#cbd5e1" />
            <rect x="82" y="90" width="30" height="5" rx="2.5" fill="#e2e8f0" />
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="3s" repeatCount="indefinite" />
          </g>
          <g>
            <rect x="260" y="100" width="100" height="50" rx="12" fill="white" className="drop-shadow-lg" />
            <circle cx="285" cy="125" r="10" fill="#0ea5e9" />
            <rect x="302" y="118" width="45" height="6" rx="3" fill="#cbd5e1" />
            <rect x="302" y="130" width="30" height="5" rx="2.5" fill="#e2e8f0" />
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-6; 0,0" dur="2.5s" repeatCount="indefinite" />
          </g>
          {/* Stethoscope icon */}
          <g transform="translate(300, 280)">
            <circle cx="0" cy="0" r="22" fill="white" className="drop-shadow-lg" />
            <path d="M-8 -5 Q-8 5 0 5 Q8 5 8 -5" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="0" cy="10" r="4" fill="#10b981" />
          </g>
          {/* Check badge */}
          <g transform="translate(60, 280)">
            <circle cx="0" cy="0" r="20" fill="#10b981" className="drop-shadow-lg" />
            <path d="M-7 0 L-2 6 L8 -5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d1fae5" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#10b981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

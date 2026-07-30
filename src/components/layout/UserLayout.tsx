import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, BookOpen, Activity, History, LineChart,
  Phone, Menu, X, Sun, Moon, HeartPulse, LogIn, UserPlus, LogOut, Settings, Video, Brain, Bell, ChevronDown,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useSettings } from '@/hooks/useSettings';

const userNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/skrining', label: 'Skrining Hipertensi', icon: ClipboardCheck },
  { to: '/edukasi', label: 'Edukasi', icon: BookOpen },
  { to: '/video', label: 'Galeri Video Edukasi', icon: Video },
  { to: '/quiz', label: 'Quiz Edukasi', icon: Brain },
  { to: '/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/riwayat', label: 'Riwayat Monitoring', icon: History },
  { to: '/riwayat-quiz', label: 'Riwayat Quiz', icon: History },
  { to: '/grafik', label: 'Grafik Tekanan Darah', icon: LineChart },
  { to: '/kontak', label: 'Kontak', icon: Phone },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function UserLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { profile, logout } = useUser();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo / brand */}
      <Link to="/" className="flex items-center gap-3 px-5 py-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
          <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-base leading-tight tracking-tight">{settings.program_name || 'BERAKSIKU'}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">{settings.program_subtitle || 'Bersama Kendalikan Hipertensi'}</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Menu Utama</p>
        {userNav.slice(0, 5).map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
              <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <p className="px-3 py-2 mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pemantauan</p>
        {userNav.slice(5).map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
              <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer of sidebar */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
        {profile ? (
          <div className="px-2 py-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{profile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.phone || 'Pengguna'}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="nav-link w-full text-danger-600 dark:text-danger-400">
              <LogOut className="w-5 h-5" /> Keluar
            </button>
          </div>
        ) : (
          <>
            <Link to="/masuk" className="nav-link"><LogIn className="w-5 h-5" /> Masuk Pengguna</Link>
            <Link to="/daftar" className="nav-link"><UserPlus className="w-5 h-5" /> Daftar Pengguna</Link>
          </>
        )}
        <Link to="/admin" className="nav-link text-slate-500 dark:text-slate-400">
          <Settings className="w-5 h-5" /> Panel Admin
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in-fast" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 animate-slide-in shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {profile ? `${greeting()}, ${profile.name.split(' ')[0]}!` : 'Selamat Datang!'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Puskesmas Ambacang</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Notification placeholder */}
              <div className="relative">
                <button
                  className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setNotifOpen((o) => !o)}
                  aria-label="Notifikasi"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-slate-900" />
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 card p-4 z-40 animate-scale-in">
                      <p className="font-semibold text-sm mb-2">Notifikasi</p>
                      <div className="space-y-2">
                        <div className="flex gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/15 flex items-center justify-center shrink-0">
                            <HeartPulse className="w-4 h-4 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Jangan lupa cek tekanan darah</p>
                            <p className="text-[11px] text-slate-400">Pengingat harian</p>
                          </div>
                        </div>
                        <div className="flex gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-500/15 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-accent-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Materi edukasi baru tersedia</p>
                            <p className="text-[11px] text-slate-400">Lihat di menu Edukasi</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-[11px] text-slate-400 mt-3">Tidak ada notifikasi baru lainnya</p>
                    </div>
                  </>
                )}
              </div>

              {/* Theme toggle */}
              <button onClick={toggle} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Ganti tema">
                {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
              </button>

              {/* Avatar */}
              {profile ? (
                <Link to="/riwayat" className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-xs font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </Link>
              ) : (
                <Link to="/masuk" className="btn-primary text-sm py-2 ml-1">Masuk</Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-extrabold">{settings.program_name || 'BERAKSIKU'}</p>
              <p className="text-xs text-slate-500">{settings.program_subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{settings.contact_info}</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Kontak</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{settings.address}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">WhatsApp: {settings.whatsapp}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Instagram: {settings.instagram}</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Jam Operasional</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{settings.hours}</p>
          <div className="flex gap-2 mt-3">
            <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="btn-leaf text-sm py-2">WhatsApp</a>
            <a href={`https://instagram.com/${settings.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="btn-outline text-sm py-2">Instagram</a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {settings.program_name} — {settings.contact_info}
      </div>
    </footer>
  );
}

export function MobileMenuButton() {
  return (
    <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
      <Menu className="w-5 h-5" />
    </button>
  );
}

export { X };

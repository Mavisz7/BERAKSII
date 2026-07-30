import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Activity, FileText, BookOpen, Settings as SettingsIcon,
  Menu, Sun, Moon, HeartPulse, LogOut, ShieldCheck, Video, Brain, Bell,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useSettings } from '@/hooks/useSettings';

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pengguna', label: 'Manajemen Pengguna', icon: Users },
  { to: '/admin/pemeriksaan', label: 'Manajemen Pemeriksaan', icon: Activity },
  { to: '/admin/laporan', label: 'Laporan', icon: FileText },
  { to: '/admin/edukasi', label: 'Manajemen Edukasi', icon: BookOpen },
  { to: '/admin/video', label: 'Manajemen Video', icon: Video },
  { to: '/admin/quiz', label: 'Manajemen Quiz', icon: Brain },
  { to: '/admin/pengaturan', label: 'Pengaturan Website', icon: SettingsIcon },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { logout } = useAdmin();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/admin/dashboard" className="flex items-center gap-3 px-5 py-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-brand-700 flex items-center justify-center shadow-lg shrink-0">
          <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-base leading-tight">Admin Panel</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">{settings.program_name || 'BERAKSIKU'}</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Administrasi</p>
        {adminNav.map((item) => {
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

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
        <Link to="/" className="nav-link"><HeartPulse className="w-5 h-5" /> Lihat Website</Link>
        <button onClick={() => { logout(); navigate('/admin'); }} className="nav-link w-full text-danger-600 dark:text-danger-400">
          <LogOut className="w-5 h-5" /> Keluar Admin
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in-fast" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 animate-slide-in shadow-2xl">{sidebar}</aside>
        </div>
      )}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/15 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Panel Admin</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">Puskesmas Ambacang</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="relative">
                <button
                  className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setNotifOpen((o) => !o)}
                  aria-label="Notifikasi"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900" />
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 card p-4 z-40 animate-scale-in">
                      <p className="font-semibold text-sm mb-2">Notifikasi Sistem</p>
                      <div className="space-y-2">
                        <div className="flex gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/15 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">Pengguna baru terdaftar</p>
                            <p className="text-[11px] text-slate-400">Periksa di Manajemen Pengguna</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-[11px] text-slate-400 mt-3">Tidak ada notifikasi baru</p>
                    </div>
                  </>
                )}
              </div>
              <button onClick={toggle} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Ganti tema">
                {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
              </button>
              <div className="flex items-center gap-2 pl-1.5 sm:pr-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-brand-700 text-white flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <p className="text-sm font-semibold hidden sm:block">Admin</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

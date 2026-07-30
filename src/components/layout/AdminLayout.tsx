import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Activity, FileText, BookOpen, Settings as SettingsIcon,
  Menu, Sun, Moon, HeartPulse, LogOut, ShieldCheck, Video, Brain,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin } from '@/contexts/AdminContext';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const sidebar = (
    <div className="flex flex-col h-full">
      <Link to="/admin/dashboard" className="flex items-center gap-3 px-5 py-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-brand-700 flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-base leading-tight">Admin Panel</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">BERAKSIKU</p>
        </div>
      </Link>
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {adminNav.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <Link to="/" className="nav-link"><HeartPulse className="w-5 h-5" /> Lihat Website</Link>
        <button onClick={() => { logout(); navigate('/admin'); }} className="nav-link w-full text-rose-600 dark:text-rose-400">
          <LogOut className="w-5 h-5" /> Keluar Admin
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 animate-slide-in">{sidebar}</aside>
        </div>
      )}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Panel Admin Puskesmas Ambacang</span>
            </div>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

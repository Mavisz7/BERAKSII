import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import { ToastHost } from '@/components/ui/Toast';
import { UserLayout } from '@/components/layout/UserLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

import { DashboardPage } from '@/pages/user/DashboardPage';
import { ScreeningPage } from '@/pages/user/ScreeningPage';
import { EducationPage } from '@/pages/user/EducationPage';
import { VideoGalleryPage } from '@/pages/user/VideoGalleryPage';
import { VideoDetailPage } from '@/pages/user/VideoDetailPage';
import { QuizPage } from '@/pages/user/QuizPage';
import { QuizHistoryPage } from '@/pages/user/QuizHistoryPage';
import { MonitoringPage } from '@/pages/user/MonitoringPage';
import { HistoryPage } from '@/pages/user/HistoryPage';
import { ChartsPage } from '@/pages/user/ChartsPage';
import { ContactPage } from '@/pages/user/ContactPage';
import { RegisterPage } from '@/pages/user/RegisterPage';
import { LoginPage } from '@/pages/user/LoginPage';

import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminExamsPage } from '@/pages/admin/AdminExamsPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminArticlesPage } from '@/pages/admin/AdminArticlesPage';
import { AdminVideosPage } from '@/pages/admin/AdminVideosPage';
import { AdminQuizPage } from '@/pages/admin/AdminQuizPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

function RequireUser({ children }: { children: ReactNode }) {
  const { profile, loading } = useUser();
  const location = useLocation();
  if (loading) return null;
  if (!profile) return <Navigate to="/daftar" state={{ from: location }} replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, mustChangePassword } = useAdmin();
  const location = useLocation();
  if (!isAdmin) return <Navigate to="/admin" state={{ from: location }} replace />;
  if (mustChangePassword && location.pathname !== '/admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function UserRoute({ children }: { children: ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AdminProvider>
          <BrowserRouter>
            <ToastHost />
            <Routes>
              {/* User routes */}
              <Route path="/" element={<UserRoute><DashboardPage /></UserRoute>} />
              <Route path="/skrining" element={<UserRoute><ScreeningPage /></UserRoute>} />
              <Route path="/edukasi" element={<UserRoute><EducationPage /></UserRoute>} />
              <Route path="/video" element={<UserRoute><VideoGalleryPage /></UserRoute>} />
              <Route path="/video/:id" element={<UserRoute><VideoDetailPage /></UserRoute>} />
              <Route path="/quiz" element={<UserRoute><QuizPage /></UserRoute>} />
              <Route path="/riwayat-quiz" element={<UserRoute><RequireUser><QuizHistoryPage /></RequireUser></UserRoute>} />
              <Route path="/monitoring" element={<UserRoute><RequireUser><MonitoringPage /></RequireUser></UserRoute>} />
              <Route path="/riwayat" element={<UserRoute><RequireUser><HistoryPage /></RequireUser></UserRoute>} />
              <Route path="/grafik" element={<UserRoute><RequireUser><ChartsPage /></RequireUser></UserRoute>} />
              <Route path="/kontak" element={<UserRoute><ContactPage /></UserRoute>} />
              <Route path="/daftar" element={<UserRoute><RegisterPage /></UserRoute>} />
              <Route path="/masuk" element={<UserRoute><LoginPage /></UserRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<RequireAdmin><AdminLayout><AdminDashboardPage /></AdminLayout></RequireAdmin>} />
              <Route path="/admin/pengguna" element={<RequireAdmin><AdminLayout><AdminUsersPage /></AdminLayout></RequireAdmin>} />
              <Route path="/admin/pemeriksaan" element={<RequireAdmin><AdminLayout><AdminExamsPage /></AdminLayout></RequireAdmin>} />
              <Route path="/admin/laporan" element={<RequireAdmin><AdminLayout><AdminReportsPage /></AdminLayout></RequireAdmin>} />
              <Route path="/admin/edukasi" element={<RequireAdmin><AdminLayout><AdminArticlesPage /></AdminLayout></RequireAdmin>} />
              <Route path="/admin/video" element={<RequireAdmin><AdminLayout><AdminVideosPage /></AdminLayout></RequireAdmin>} />
              <Route path="/admin/quiz" element={<RequireAdmin><AdminLayout><AdminQuizPage /></AdminLayout></RequireAdmin>} />
              <Route path="/admin/pengaturan" element={<RequireAdmin><AdminLayout><AdminSettingsPage /></AdminLayout></RequireAdmin>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AdminProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

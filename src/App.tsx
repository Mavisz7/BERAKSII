import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode, useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import { ToastHost } from '@/components/ui/Toast';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { PageTransition } from '@/components/ui/PageTransition';
import { Spinner } from '@/components/ui/Spinner';
import { UserLayout } from '@/components/layout/UserLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

import { LandingPage } from '@/pages/user/LandingPage';
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
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';

/** Blocks unauthenticated users from protected user pages. */
function RequireUser({ children }: { children: ReactNode }) {
  const { profile, loading } = useUser();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner />
    </div>
  );
  if (!profile) return <Navigate to="/masuk" state={{ from: location }} replace />;
  return <>{children}</>;
}

/**
 * Guards every /admin/* route.
 * - While the session is being validated: show a full-screen spinner.
 * - Not authenticated as admin: redirect to the admin login page.
 * - A signed-in regular user who typed the URL manually: show 403 page.
 */
function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { profile, loading: userLoading } = useUser();
  const location = useLocation();

  // Wait until BOTH contexts have resolved their persisted session
  if (adminLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    );
  }

  // Fully authenticated admin — allow through
  if (isAdmin) return <>{children}</>;

  // A regular logged-in user manually navigated to an admin URL
  if (profile) return <AccessDeniedPage />;

  // Not logged in at all — send to admin login, preserve intended destination
  return <Navigate to="/admin" state={{ from: location }} replace />;
}

function UserRoute({ children }: { children: ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <UserProvider>
        <AdminProvider>
          <BrowserRouter>
            {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
            <ToastHost />
            <AnimatedRoutes />
          </BrowserRouter>
        </AdminProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

function AnimatedRoutes() {
  return (
    <PageTransition>
      <Routes>
        {/* Public + user routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<UserRoute><RequireUser><DashboardPage /></RequireUser></UserRoute>} />
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

        {/* Admin routes — ALL protected by RequireAdmin */}
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
    </PageTransition>
  );
}

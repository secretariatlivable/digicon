import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CardsPage } from '@/pages/CardsPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { EcoPage } from '@/pages/EcoPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PublicCardPage } from '@/pages/PublicCardPage';
import { Spinner } from '@/components/ui/GlassCard';
import { type ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/c/:cardId" element={<PublicCardPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/cards" element={<ProtectedRoute><AppLayout><CardsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><AppLayout><ContactsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/eco" element={<ProtectedRoute><AppLayout><EcoPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="digicon-theme">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

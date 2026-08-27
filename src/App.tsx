import type { ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';
import AppLayout from '@/components/AppLayout';

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

/**
 * Loading screen displayed while Supabase authentication
 * state is being resolved.
 */
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black"
      role="status"
      aria-live="polite"
      aria-label="Loading DigiCon"
    >
      <Spinner className="w-8 h-8" />
      <span className="sr-only">Loading DigiCon...</span>
    </div>
  );
}

/**
 * Protects authenticated application routes.
 *
 * Users without an active session are redirected to /auth.
 */
function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

/**
 * Authenticated application shell.
 *
 * AppLayout is intentionally applied only to authenticated
 * application pages so that the public landing page,
 * authentication page, and public digital cards can have
 * their own layouts.
 */
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

/**
 * Application routes.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          Public Marketing / Landing
          ===================================================== */}
      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* =====================================================
          Authentication
          ===================================================== */}
      <Route
        path="/auth"
        element={<AuthPage />}
      />

      {/* =====================================================
          Public Digital Business Card
          ===================================================== */}
      <Route
        path="/c/:cardId"
        element={<PublicCardPage />}
      />

      {/* =====================================================
          Authenticated Application
          ===================================================== */}
      <Route element={<ProtectedLayout />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/cards"
          element={<CardsPage />}
        />

        <Route
          path="/contacts"
          element={<ContactsPage />}
        />

        <Route
          path="/analytics"
          element={<AnalyticsPage />}
        />

        <Route
          path="/eco"
          element={<EcoPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />
      </Route>

      {/* =====================================================
          Unknown Routes
          ===================================================== */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

/**
 * DigiCon application root.
 *
 * Provider order:
 *
 * ThemeProvider
 *   └── AuthProvider
 *         └── BrowserRouter
 *               └── AppRoutes
 */
export default function App() {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="digicon-theme"
    >
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

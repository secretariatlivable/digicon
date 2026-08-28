import type { ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { AppLayout } from '@/components/layout/AppLayout';
import { isSupabaseConfigured, missingSupabaseConfig } from '@/lib/supabase';

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

function LoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-black"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-8 w-8" />
      <span className="sr-only">Loading DigiCon…</span>
    </div>
  );
}

/**
 * Rendered instead of the app when required environment variables are absent.
 * Previously a missing variable threw during module evaluation, which produced
 * an unrecoverable blank page with no operator-facing diagnostics.
 */
function ConfigurationScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold">DigiCon is not configured</h1>
        <p className="mt-4 text-white/60">
          The application cannot start because required environment variables
          are missing from this deployment:
        </p>
        <ul className="mt-4 space-y-1">
          {missingSupabaseConfig.map((name) => (
            <li
              key={name}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-white/50">
          Copy <code className="font-mono">.env.example</code> to{' '}
          <code className="font-mono">.env</code> locally, or set these values in
          your hosting provider&apos;s environment settings, then redeploy.
        </p>
      </div>
    </main>
  );
}

/**
 * Guards authenticated routes. Unauthenticated visitors are sent to `/auth`
 * with a `returnTo` so they land back where they intended after signing in.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!session) {
    const returnTo = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
}

/**
 * Wraps a protected page in the application chrome exactly once.
 * Pages must not render `<AppLayout>` themselves — doing so previously
 * produced two sidebars and doubled the content offset on every route.
 */
function ProtectedPage({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/c/:cardId" element={<PublicCardPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedPage>
            <DashboardPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/cards"
        element={
          <ProtectedPage>
            <CardsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedPage>
            <ContactsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedPage>
            <AnalyticsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/eco"
        element={
          <ProtectedPage>
            <EcoPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedPage>
            <SettingsPage />
          </ProtectedPage>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigurationScreen />;

  return (
    <ThemeProvider defaultTheme="system" storageKey="digicon-theme">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

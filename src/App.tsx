import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { A11yProvider } from '@/lib/a11y';
import { registerServiceWorker } from '@/lib/pwa';
import { AccessibilityTools, SkipLink } from '@/a11y/AccessibilityTools';
import { InstallBar } from '@/pwa/InstallBar';
import { AppLayout } from '@/components/layout/AppLayout';
import { isSupabaseConfigured, missingSupabaseConfig } from '@/lib/supabase';

import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { PublicCardPage } from '@/pages/PublicCardPage';

import { Spinner } from '@/components/ui/GlassCard';

/*
 * Route-level code splitting.
 *
 * The landing page, auth and the public card are what a first-time visitor or
 * a QR scan actually loads, so they stay in the entry bundle. Everything behind
 * the login — including the charting vendor chunk — is fetched only once
 * someone is signed in, which keeps the first paint light on mobile data.
 */
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const CardsPage = lazy(() =>
  import('@/pages/CardsPage').then((m) => ({ default: m.CardsPage })),
);
const ContactsPage = lazy(() =>
  import('@/pages/ContactsPage').then((m) => ({ default: m.ContactsPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);
const EcoPage = lazy(() =>
  import('@/pages/EcoPage').then((m) => ({ default: m.EcoPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

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
      <AppLayout>
        <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
      </AppLayout>
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
  // Registering the worker before the configuration guard means an already
  // installed DigiCon still opens offline even if the deployment loses its
  // environment variables.
  useEffect(() => {
    registerServiceWorker();
  }, []);

  if (!isSupabaseConfigured) return <ConfigurationScreen />;

  return (
    /* A11yProvider sits outside the router so accessibility preferences apply
       on every route — including the public card a stranger opens from a QR. */
    <A11yProvider>
      <ThemeProvider defaultTheme="system" storageKey="digicon-theme">
        <BrowserRouter>
          <AuthProvider>
            <SkipLink />
            <AppRoutes />
            <AccessibilityTools />
            <InstallBar />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </A11yProvider>
  );
}

import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/AppLayout";

import { LandingPage} from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CardsPage } from "@/pages/CardsPage";
import { ContactsPage } from "@/pages/ContactsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { EcoPage } from "@/pages/EcoPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { PublicCardPage } from "@/pages/PublicCardPage";
import { Spinner } from "@/components/ui/GlassCard";

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black"
      role="status"
      aria-live="polite"
      aria-label="Loading DigiCon"
    >
      <Spinner className="h-8 w-8" />
      <span className="sr-only">Loading DigiCon...</span>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

function ProtectedPage({
  children,
}: {
  children: ReactNode;
}) {
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

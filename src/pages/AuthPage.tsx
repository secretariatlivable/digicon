import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  KeyRound,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { DigiConLogo } from "@/components/brand/DigiConLogo";
import { GlassButton, GlassCard, GlassInput, GlassLabel } from "@/components/ui/GlassCard";

type AuthMode = "signin" | "signup" | "reset";

const PRODUCTION_ORIGIN = "https://digicon.cards";

function getSafeReturnTo(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function getRedirectPath(): string {
  if (typeof window === "undefined") return "/auth";
  return window.location.hostname === "digicon.cards"
    ? `${PRODUCTION_ORIGIN}/auth`
    : `${window.location.origin}/auth`;
}

export function AuthPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { session, loading, signIn, signUp, signOut } = useAuth();

  const requestedMode = params.get("mode");
  const initialMode: AuthMode =
    requestedMode === "signup"
      ? "signup"
      : requestedMode === "reset"
        ? "reset"
        : "signin";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const returnTo = useMemo(
    () => getSafeReturnTo(params.get("returnTo")),
    [params],
  );

  useEffect(() => {
    if (!requestedMode) return;

    const nextMode: AuthMode =
      requestedMode === "signup"
        ? "signup"
        : requestedMode === "reset"
          ? "reset"
          : "signin";

    setMode(nextMode);
  }, [requestedMode]);

  useEffect(() => {
    if (!loading && session) {
      navigate(returnTo, { replace: true });
    }
  }, [loading, navigate, returnTo, session]);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage(null);
    setError(null);
    setPassword("");

    const nextParams = new URLSearchParams(params);
    if (nextMode === "signup") nextParams.set("mode", "signup");
    else if (nextMode === "reset") nextParams.set("mode", "reset");
    else nextParams.delete("mode");

    setParams(nextParams, { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "reset") {
        const { error: resetError } = await import("@/lib/supabase").then(
          ({ supabase }) =>
            supabase.auth.resetPasswordForEmail(email.trim(), {
              redirectTo: `${getRedirectPath()}?mode=reset`,
            }),
        );

        if (resetError) {
          throw resetError;
        }

        setMessage(
          "If an account exists for that email, a password-reset email has been sent.",
        );
        return;
      }

      if (mode === "signup") {
        if (fullName.trim().length < 2) {
          throw new Error("Please enter your full name.");
        }

        const result = await signUp(
          email.trim(),
          password,
          fullName.trim(),
          companyName.trim(),
        );

        if (result.error) {
          throw new Error(result.error);
        }

        setMessage(
          "Your account was created. Check your email if confirmation is required, then sign in.",
        );
        setMode("signin");
        return;
      }

      const result = await signIn(email.trim(), password);

      if (result.error) {
        throw new Error(result.error);
      }

      navigate(returnTo, { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to complete authentication.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);

    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to sign out.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <DigiConLogo size="lg" showText={false} />
        <span className="sr-only">Loading DigiCon authentication.</span>
      </main>
    );
  }

  if (session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-black">
        <GlassCard variant="thick" className="w-full max-w-md p-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-digicon-eco" />
            <div>
              <h1 className="text-xl font-bold text-white">
                You are signed in
              </h1>
              <p className="text-sm text-white/50">
                Continue to your DigiCon workspace.
              </p>
            </div>
          </div>

          {error && (
            <div
              className="mt-5 flex gap-2 rounded-glass-sm bg-digicon-error/10 p-3 text-sm text-digicon-error"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 grid gap-3">
            <GlassButton
              type="button"
              className="w-full"
              onClick={() => navigate(returnTo, { replace: true })}
            >
              Continue to DigiCon
            </GlassButton>

            <GlassButton
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => void handleSignOut()}
              disabled={busy}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </GlassButton>
          </div>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-black relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-digicon-primary/15 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-digicon-secondary/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex"
            aria-label="Back to DigiCon home"
          >
            <DigiConLogo size="lg" showText={false} />
          </button>

          <h1 className="mt-4 text-2xl font-bold text-white">
            {mode === "signup"
              ? "Create your DigiCon account"
              : mode === "reset"
                ? "Reset your password"
                : "Welcome back"}
          </h1>

          <p className="mt-2 text-sm text-white/50">
            {mode === "signup"
              ? "Build your digital identity and start connecting."
              : mode === "reset"
                ? "Enter your email and we will send password-reset instructions."
                : "Sign in to manage your digital cards and connections."}
          </p>
        </div>

        <GlassCard variant="thick" className="p-8">
          <div className="mb-6 flex items-start gap-3 rounded-glass-sm border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-digicon-primary" />
            <p className="text-xs leading-5 text-white/55">
              Authentication is handled by Supabase Auth. No Auth0 provider or
              client secret is required by the DigiCon frontend.
            </p>
          </div>

          {(message || error) && (
            <div
              className={`mb-5 flex gap-2 rounded-glass-sm p-3 text-sm ${
                error
                  ? "bg-digicon-error/10 text-digicon-error"
                  : "bg-digicon-eco/10 text-digicon-eco"
              }`}
              role={error ? "alert" : "status"}
            >
              {error ? (
                <AlertCircle className="h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
              <span>{error || message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <GlassLabel htmlFor="full-name">Full name</GlassLabel>
                  <GlassInput
                    id="full-name"
                    autoComplete="name"
                    required
                    minLength={2}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <GlassLabel htmlFor="company-name">
                    Company / organization
                  </GlassLabel>
                  <GlassInput
                    id="company-name"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            <div>
              <GlassLabel htmlFor="email">Email</GlassLabel>
              <GlassInput
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <GlassLabel htmlFor="password">Password</GlassLabel>
                <GlassInput
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
            )}

            <GlassButton
              type="submit"
              className="w-full"
              disabled={busy}
            >
              {mode === "signup" ? (
                <UserPlus className="mr-2 h-4 w-4" />
              ) : mode === "reset" ? (
                <KeyRound className="mr-2 h-4 w-4" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}

              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset email"
                    : "Sign in"}
            </GlassButton>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode !== "signup" && (
              <button
                type="button"
                onClick={() => changeMode("signup")}
                className="block w-full text-white/55 hover:text-white"
              >
                New to DigiCon? <span className="font-medium">Create an account</span>
              </button>
            )}

            {mode !== "signin" && (
              <button
                type="button"
                onClick={() => changeMode("signin")}
                className="block w-full text-white/55 hover:text-white"
              >
                Already have an account? <span className="font-medium">Sign in</span>
              </button>
            )}

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => changeMode("reset")}
                className="block w-full text-white/40 hover:text-white/70"
              >
                Forgot your password?
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

export default AuthPage;

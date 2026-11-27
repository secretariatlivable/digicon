import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { useA11y } from '@/lib/a11y';
import { usePrefersReducedMotion } from '@/lib/motion';
import { translate, type TranslationKey } from '@/lib/i18n';
import { DigiConLogo } from '@/components/brand/DigiConLogo';
import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassLabel,
  Spinner,
} from '@/components/ui/GlassCard';

type Mode = 'signin' | 'signup' | 'reset';

const MIN_PASSWORD_LENGTH = 8;

/** Only same-origin, non-protocol-relative paths are accepted. */
function safeReturnTo(value: string | null): string {
  if (!value) return '/dashboard';
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export function AuthPage({ defaultMode = 'signin' }: { defaultMode?: Mode }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session, loading, signIn, signUp, sendPasswordReset } = useAuth();
  const [lang] = useLanguage();
  const { settings } = useA11y();
  const reducedMotion = usePrefersReducedMotion();
  const calm = settings.calm || reducedMotion;
  const headingRef = useRef<HTMLHeadingElement>(null);

  const t = (key: TranslationKey) => translate(key, lang);

  const initialMode = useMemo<Mode>(() => {
    const raw = params.get('mode');
    if (raw === 'signup' || raw === 'reset' || raw === 'signin') return raw;
    return defaultMode;
  }, [params, defaultMode]);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setMode(initialMode), [initialMode]);

  const returnTo = safeReturnTo(params.get('returnTo'));

  useEffect(() => {
    if (!loading && session) navigate(returnTo, { replace: true });
  }, [loading, session, navigate, returnTo]);

  // Move focus to the heading on mode switch so screen-reader users are
  // informed they are looking at a different form.
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus({ preventScroll: true });
    }
  }, [mode]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t('auth.errorRequiredEmail'));
      return;
    }

    if (mode !== 'reset' && password.length < MIN_PASSWORD_LENGTH) {
      setError(
        t('auth.errorPasswordLength').replace(
          '{0}',
          String(MIN_PASSWORD_LENGTH),
        ),
      );
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setError(t('auth.errorRequiredName'));
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'reset') {
        const { error: resetError } = await sendPasswordReset(trimmedEmail);
        if (resetError) throw new Error(resetError);
        setNotice(t('auth.resetSent'));
        return;
      }

      if (mode === 'signin') {
        const { error: signInError } = await signIn(trimmedEmail, password);
        if (signInError) throw new Error(signInError);
        return;
      }

      const { error: signUpError, needsEmailConfirmation } = await signUp(
        trimmedEmail,
        password,
        fullName,
        companyName,
      );
      if (signUpError) throw new Error(signUpError);

      if (needsEmailConfirmation) {
        setNotice(t('auth.confirmEmail'));
        setPassword('');
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'We could not complete that request. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-black"
        role="status"
        aria-live="polite"
      >
        <Spinner className="h-8 w-8" />
        <span className="sr-only">{t('common.loading')}</span>
      </main>
    );
  }

  const heading =
    mode === 'signup'
      ? t('auth.signUpTitle')
      : mode === 'reset'
        ? t('auth.resetTitle')
        : t('auth.signInTitle');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Ambient background — suppressed when visitor prefers reduced motion */}
      {!calm && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-digicon-primary/15 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-digicon-secondary/15 blur-[120px]" />
        </div>
      )}

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-4 inline-flex"
            aria-label="Back to the DigiCon home page"
          >
            <DigiConLogo size="lg" showText={false} />
          </button>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-white outline-none"
          >
            {heading}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {mode === 'reset'
              ? t('auth.resetDesc')
              : 'Digital business cards and CRM for SMEs and startups.'}
          </p>
        </div>

        <GlassCard variant="thick" className="p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
            aria-describedby={error ? 'auth-error' : undefined}
          >
            {mode === 'signup' && (
              <>
                <div>
                  <GlassLabel htmlFor="auth-full-name">
                    {t('auth.fullName')} *
                  </GlassLabel>
                  <GlassInput
                    id="auth-full-name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div>
                  <GlassLabel htmlFor="auth-company">
                    {t('auth.companyName')}
                  </GlassLabel>
                  <GlassInput
                    id="auth-company"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company"
                  />
                </div>
              </>
            )}

            <div>
              <GlassLabel htmlFor="auth-email">
                {t('auth.email')} *
              </GlassLabel>
              <GlassInput
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <GlassLabel htmlFor="auth-password">
                  {t('auth.password')} *
                </GlassLabel>
                <div className="relative">
                  <GlassInput
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'signup' ? 'new-password' : 'current-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/50 hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div
                id="auth-error"
                className="flex gap-2 rounded-glass-sm bg-digicon-error/10 p-3 text-sm text-digicon-error"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div
                className="flex gap-2 rounded-glass-sm bg-emerald-500/10 p-3 text-sm text-emerald-300"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            <GlassButton type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : mode === 'signup' ? (
                <UserPlus className="mr-2 h-4 w-4" />
              ) : mode === 'reset' ? (
                <Mail className="mr-2 h-4 w-4" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {mode === 'signup'
                ? t('auth.signUp')
                : mode === 'reset'
                  ? t('auth.sendResetLink')
                  : t('auth.signIn')}
            </GlassButton>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode !== 'signin' && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-white/60 underline underline-offset-4 hover:text-white"
              >
                {t('auth.haveAccount')} Sign in
              </button>
            )}
            {mode !== 'signup' && (
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="block w-full text-white/60 underline underline-offset-4 hover:text-white"
              >
                {t('auth.noAccount')} Create an account
              </button>
            )}
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="block w-full text-white/40 underline underline-offset-4 hover:text-white"
              >
                {t('auth.forgotPassword')}
              </button>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-glass-sm border border-line/40 bg-surface-2/50 p-4">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-digicon-eco" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-ink-3">
              Your network belongs to you. You decide what each card shows, who
              can see it, and you can export or delete everything at any time.
            </p>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

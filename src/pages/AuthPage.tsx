import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Building2, AlertCircle } from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { GlassButton, GlassInput, GlassLabel, GlassCard } from '@/components/ui/Glass';
import { DigiConLogo } from '@/components/brand/DigiConLogo';

export function AuthPage() {
  const { signIn, signUp, session } = useAuth();
  const [lang] = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = (k: TranslationKey) => translate(k, lang);

  useEffect(() => {
    if (session) navigate('/dashboard');
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/dashboard');
    } else {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, companyName);
      if (error) setError(error);
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-digicon-primary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-digicon-secondary/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 mb-2">
            <DigiConLogo size="lg" showText={false} />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'signin' ? t('auth.signInTitle') : t('auth.signUpTitle')}
          </h1>
          <p className="text-white/50 text-sm mt-2">
            {mode === 'signin' ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="text-digicon-primary hover:underline font-medium"
            >
              {mode === 'signin' ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </p>
        </div>

        <GlassCard variant="thick" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <GlassLabel>{t('auth.fullName')}</GlassLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <GlassInput
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="pl-11 w-full"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <GlassLabel>{t('auth.companyName')}</GlassLabel>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <GlassInput
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Inc."
                    className="pl-11 w-full"
                  />
                </div>
              </div>
            )}

            <div>
              <GlassLabel>{t('auth.email')}</GlassLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <GlassInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-11 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <GlassLabel>{t('auth.password')}</GlassLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <GlassInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 w-full"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-glass-sm bg-digicon-error/10 border border-digicon-error/20 text-digicon-error text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <GlassButton type="submit" className="w-full" disabled={loading}>
              {loading
                ? (mode === 'signin' ? t('auth.signingIn') : t('auth.signingUp'))
                : (mode === 'signin' ? t('auth.signIn') : t('auth.signUp'))
              }
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

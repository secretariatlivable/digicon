import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Apple, CheckCircle2, LogIn, LogOut, ShieldCheck, Smartphone, User } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from '@/lib/supabase';
import { DigiConLogo } from '@/components/brand/DigiConLogo';
import { GlassButton, GlassCard } from '@/components/ui/GlassCard';

const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
const AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const PRODUCTION_ORIGIN = 'https://digicon.cards';

type WalletResponse = {
  passBase64?: string;
  filename?: string;
  saveUrl?: string;
  error?: string;
};

function redirectUri() {
  if (typeof window === 'undefined') return `${PRODUCTION_ORIGIN}/auth`;
  return window.location.hostname === 'digicon.cards'
    ? `${PRODUCTION_ORIGIN}/auth`
    : `${window.location.origin}/auth`;
}

function base64Blob(value: string, type: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function invokeWallet(name: 'apple-wallet-pass' | 'google-wallet-pass', cardId: string) {
  const { data, error } = await supabase.functions.invoke<WalletResponse>(name, {
    body: { card_id: cardId },
  });
  if (error) throw new Error(error.message || `Unable to call ${name}.`);
  if (!data) throw new Error('Wallet service returned no response.');
  if (data.error) throw new Error(data.error);
  return data;
}

export function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [walletLoading, setWalletLoading] = useState<'apple' | 'google' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    isLoading,
    isAuthenticated,
    user,
    error: auth0Error,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const cardId = useMemo(
    () => (params.get('card_id') || params.get('cardId') || '').trim(),
    [params],
  );

  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = params.get('returnTo');
      if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
        navigate(returnTo, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, params]);

  const configError =
    !AUTH0_DOMAIN || !AUTH0_CLIENT_ID
      ? 'Auth0 is not configured. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID.'
      : null;

  const signIn = async () => {
    setError(null);
    setMessage(null);
    if (configError) {
      setError(configError);
      return;
    }
    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: redirectUri(),
          ...(mode === 'signup' ? { screen_hint: 'signup' } : {}),
        },
        appState: { returnTo: params.get('returnTo') || '/dashboard' },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start Auth0 authentication.');
    }
  };

  const signOut = async () => {
    await logout({ logoutParams: { returnTo: `${window.location.origin}/` } });
  };

  const appleWallet = async () => {
    if (!cardId) {
      setError('A card_id is required to generate an Apple Wallet pass.');
      return;
    }
    setWalletLoading('apple');
    setError(null);
    setMessage(null);
    try {
      const data = await invokeWallet('apple-wallet-pass', cardId);
      if (!data.passBase64) throw new Error('Apple Wallet service did not return a pass.');
      const filename = data.filename?.endsWith('.pkpass')
        ? data.filename
        : `${data.filename || 'digicon-business-card'}.pkpass`;
      download(base64Blob(data.passBase64, 'application/vnd.apple.pkpass'), filename);
      setMessage('Apple Wallet pass generated successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to generate Apple Wallet pass.');
    } finally {
      setWalletLoading(null);
    }
  };

  const googleWallet = async () => {
    if (!cardId) {
      setError('A card_id is required to generate a Google Wallet pass.');
      return;
    }
    setWalletLoading('google');
    setError(null);
    setMessage(null);
    try {
      const data = await invokeWallet('google-wallet-pass', cardId);
      if (!data.saveUrl) {
        throw new Error(
          'Google Wallet service did not return a Save to Google Wallet URL. The google-wallet-pass Edge Function must return saveUrl.',
        );
      }
      window.location.assign(data.saveUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to generate Google Wallet pass.');
    } finally {
      setWalletLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/70">
        <DigiConLogo size="lg" showText={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-digicon-primary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-digicon-secondary/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <button type="button" onClick={() => navigate('/')} className="inline-flex mb-4">
            <DigiConLogo size="lg" showText={false} />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isAuthenticated ? `Welcome${user?.name ? `, ${user.name}` : ''}` : mode === 'signup' ? 'Create your DigiCon account' : 'Welcome back'}
          </h1>
          {!isAuthenticated && (
            <p className="text-white/50 text-sm mt-2">
              Secure sign-in and registration powered by Auth0.
            </p>
          )}
        </div>

        <GlassCard variant="thick" className="p-8">
          {isAuthenticated ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-glass-sm bg-white/5 border border-white/10">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-10 h-10 p-2 text-white/60" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'DigiCon user'}</p>
                  <p className="text-xs text-white/50 truncate">{user?.email || ''}</p>
                </div>
                <CheckCircle2 className="ml-auto w-5 h-5 text-emerald-400" />
              </div>

              {cardId && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-white">Add your DigiCon card to Wallet</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <GlassButton type="button" onClick={appleWallet} disabled={walletLoading !== null} className="w-full">
                      <Apple className="w-4 h-4 mr-2" />
                      {walletLoading === 'apple' ? 'Generating...' : 'Apple Wallet'}
                    </GlassButton>
                    <GlassButton type="button" onClick={googleWallet} disabled={walletLoading !== null} className="w-full">
                      <Smartphone className="w-4 h-4 mr-2" />
                      {walletLoading === 'google' ? 'Generating...' : 'Google Wallet'}
                    </GlassButton>
                  </div>
                </div>
              )}

              {message && <div className="flex gap-2 p-3 rounded-glass-sm bg-emerald-500/10 text-emerald-300 text-sm"><CheckCircle2 className="w-4 h-4" />{message}</div>}
              {error && <div className="flex gap-2 p-3 rounded-glass-sm bg-digicon-error/10 text-digicon-error text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

              <GlassButton type="button" onClick={() => navigate('/dashboard')} className="w-full">
                Continue to DigiCon
              </GlassButton>
              <GlassButton type="button" onClick={signOut} className="w-full">
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 rounded-glass-sm bg-white/5 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-digicon-primary flex-shrink-0" />
                <p className="text-xs text-white/60">
                  DigiCon uses Auth0 Universal Login with Authorization Code Flow + PKCE.
                  Credentials are entered on Auth0, not in this React application.
                </p>
              </div>

              {(configError || auth0Error || error) && (
                <div className="flex gap-2 p-3 rounded-glass-sm bg-digicon-error/10 text-digicon-error text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{configError || auth0Error?.message || error}</span>
                </div>
              )}

              <GlassButton type="button" onClick={signIn} disabled={Boolean(configError)} className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                {mode === 'signup' ? 'Sign up with Auth0' : 'Sign in with Auth0'}
              </GlassButton>

              <p className="text-center text-xs text-white/40">
                You will be redirected to the secure Auth0 Universal Login page.
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

/**
 * DigiCon authentication context.
 *
 * DigiCon uses **Supabase Auth as the single identity provider**. The database
 * schema keys every table off `auth.users(id)` and every RLS policy is written
 * against `auth.uid()`, so a second identity provider cannot grant access to
 * any row. See docs/ADR-001 for the decision record.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  supabase,
  type PlanId,
  type Profile,
  type Subscription,
} from '@/lib/supabase';
import type { Language } from '@/lib/i18n';

export type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  /** Effective plan. Falls back to the free `startup` tier. */
  plan: PlanId;
  /** True only when a provider webhook has confirmed an active subscription. */
  isActiveSubscription: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    companyName: string,
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);

  // Guards against a stale in-flight profile fetch overwriting a newer one.
  const requestId = useRef(0);

  /* -------------------------------------------------------------- */
  /*  Session lifecycle                                              */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
      })
      .catch((cause) => {
        console.error('[DigiCon] Unable to read the auth session:', cause);
      })
      .finally(() => {
        if (active) setSessionResolved(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionResolved(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* -------------------------------------------------------------- */
  /*  Account data (profile + billing state)                         */
  /* -------------------------------------------------------------- */

  const loadAccount = useCallback(async (userId: string | undefined) => {
    const ticket = ++requestId.current;

    if (!userId) {
      setProfile(null);
      setSubscription(null);
      setAccountResolved(true);
      return;
    }

    try {
      const [profileResult, subscriptionResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (ticket !== requestId.current) return;

      if (profileResult.error) {
        console.error('[DigiCon] Profile load failed:', profileResult.error);
      }
      if (subscriptionResult.error) {
        console.error('[DigiCon] Subscription load failed:', subscriptionResult.error);
      }

      setProfile((profileResult.data as Profile | null) ?? null);
      setSubscription((subscriptionResult.data as Subscription | null) ?? null);
    } catch (cause) {
      if (ticket !== requestId.current) return;
      console.error('[DigiCon] Account load failed:', cause);
      setProfile(null);
      setSubscription(null);
    } finally {
      if (ticket === requestId.current) setAccountResolved(true);
    }
  }, []);

  useEffect(() => {
    setAccountResolved(false);
    void loadAccount(session?.user?.id);
  }, [session?.user?.id, loadAccount]);

  /* -------------------------------------------------------------- */
  /*  Actions                                                        */
  /* -------------------------------------------------------------- */

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      companyName: string,
    ) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // The `handle_new_user` database trigger provisions `profiles` and
          // `eco_stats` rows atomically. Client-side inserts are not used:
          // they race with email confirmation and fail RLS when no session
          // exists yet.
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) return { error: error.message, needsEmailConfirmation: false };

      return {
        error: null,
        needsEmailConfirmation: Boolean(data.user && !data.session),
      };
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('[DigiCon] Sign out failed:', error);
    setProfile(null);
    setSubscription(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadAccount(session?.user?.id);
  }, [loadAccount, session?.user?.id]);

  /* -------------------------------------------------------------- */

  const value = useMemo<AuthContextType>(() => {
    const isActiveSubscription = subscription?.status === 'active';

    return {
      session,
      profile,
      subscription,
      plan: isActiveSubscription ? subscription.plan : 'startup',
      isActiveSubscription,
      loading: !sessionResolved || !accountResolved,
      signIn,
      signUp,
      sendPasswordReset,
      signOut,
      refreshProfile,
    };
  }, [
    session,
    profile,
    subscription,
    sessionResolved,
    accountResolved,
    signIn,
    signUp,
    sendPasswordReset,
    signOut,
    refreshProfile,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/**
 * Language preference. Persists to `profiles.language` when a profile exists
 * and otherwise keeps the choice in local component state.
 */
export function useLanguage(): [Language, (next: Language) => void] {
  const { profile, refreshProfile } = useAuth();
  const [localLang, setLocalLang] = useState<Language>('en');

  useEffect(() => {
    if (profile?.language) setLocalLang(profile.language as Language);
  }, [profile?.language]);

  const setLang = useCallback(
    (next: Language) => {
      setLocalLang(next);
      if (!profile) return;

      void supabase
        .from('profiles')
        .update({ language: next, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .then(({ error }) => {
          if (error) {
            console.error('[DigiCon] Language preference not saved:', error);
            return;
          }
          void refreshProfile();
        });
    },
    [profile, refreshProfile],
  );

  return [localLang, setLang];
}

/**
 * DigiCon authentication context.
 *
 * Supabase Auth is the single browser identity provider. The legacy FastAPI
 * session is not used to decide whether a route is protected; the backend API
 * receives the Supabase access token through src/lib/api.ts instead.
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
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  supabase,
  type PlanId,
  type Profile,
  type Subscription,
} from "@/lib/supabase";
import type { Language } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";

/**
 * Normalized user shape consumed by the application.
 * Kept inside the auth module so the build does not depend on a separate
 * @/types file that may not exist in every branch.
 */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "user";
  plan: "free" | "pro";
  title: string;
  company: string;
  phone: string;
  avatar_url: string;
  networking_goal: string;
  onboarded: boolean;
};

export type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  user: AuthUser | null;
  subscription: Subscription | null;
  plan: PlanId;
  isActiveSubscription: boolean;
  isPaid: boolean;
  isAdmin: boolean;
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
  const [hasBusinessCard, setHasBusinessCard] = useState(false);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
      })
      .catch((cause) => {
        console.error("[DigiCon] Unable to read the auth session:", cause);
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

  const loadAccount = useCallback(async (userId: string | undefined) => {
    const ticket = ++requestId.current;

    if (!userId) {
      setProfile(null);
      setSubscription(null);
      setHasBusinessCard(false);
      setAccountResolved(true);
      return;
    }

    try {
      const [profileResult, subscriptionResult, cardResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("business_cards")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle(),
      ]);

      if (ticket !== requestId.current) return;

      if (profileResult.error) console.error("[DigiCon] Profile load failed:", profileResult.error);
      if (subscriptionResult.error) console.error("[DigiCon] Subscription load failed:", subscriptionResult.error);
      if (cardResult.error) console.error("[DigiCon] Card-state load failed:", cardResult.error);

      setProfile((profileResult.data as Profile | null) ?? null);
      setSubscription((subscriptionResult.data as Subscription | null) ?? null);
      setHasBusinessCard(Boolean(cardResult.data));
    } catch (cause) {
      if (ticket !== requestId.current) return;
      console.error("[DigiCon] Account load failed:", cause);
      setProfile(null);
      setSubscription(null);
      setHasBusinessCard(false);
    } finally {
      if (ticket === requestId.current) setAccountResolved(true);
    }
  }, []);

  useEffect(() => {
    setAccountResolved(false);
    void loadAccount(session?.user?.id);
  }, [session?.user?.id, loadAccount]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, companyName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
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
      redirectTo: `${window.location.origin}/login?mode=reset`,
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[DigiCon] Sign out failed:", error);
    // Wipe cached queries so data from the previous session does not leak
    // into the next login or into public pages.
    queryClient.clear();
    setProfile(null);
    setSubscription(null);
    setHasBusinessCard(false);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadAccount(session?.user?.id);
  }, [loadAccount, session?.user?.id]);

  const value = useMemo<AuthContextType>(() => {
    const normalizedStatus = subscription?.status?.trim().toLowerCase();
    const isActiveSubscription = normalizedStatus === "active";
    const normalizedPlan = subscription?.plan?.trim().toLowerCase() as PlanId | undefined;
    const plan = isActiveSubscription && normalizedPlan ? normalizedPlan : "startup";
    const user: AuthUser | null = session?.user
      ? {
          id: session.user.id,
          email: session.user.email ?? profile?.email ?? "",
          name: profile?.full_name ?? session.user.user_metadata?.full_name ?? "",
          role: profile?.role === "admin" ? "super_admin" : "user",
          plan: isActiveSubscription ? "pro" : "free",
          title: "",
          company: profile?.company_name ?? session.user.user_metadata?.company_name ?? "",
          phone: "",
          avatar_url: profile?.avatar_url ?? "",
          networking_goal: "",
          onboarded: hasBusinessCard,
        }
      : null;

    return {
      session,
      profile,
      user,
      subscription,
      plan,
      isActiveSubscription,
      isPaid: isActiveSubscription,
      isAdmin: profile?.role === "admin",
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
    hasBusinessCard,
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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useLanguage(): [Language, (next: Language) => void] {
  const { profile, refreshProfile } = useAuth();
  const [localLang, setLocalLang] = useState<Language>("en");

  useEffect(() => {
    if (profile?.language) setLocalLang(profile.language as Language);
  }, [profile?.language]);

  const setLang = useCallback(
    (next: Language) => {
      setLocalLang(next);
      if (!profile) return;

      void supabase
        .from("profiles")
        .update({ language: next, updated_at: new Date().toISOString() })
        .eq("id", profile.id)
        .then(({ error }) => {
          if (error) {
            console.error("[DigiCon] Language preference not saved:", error);
            return;
          }
          void refreshProfile();
        });
    },
    [profile, refreshProfile],
  );

  return [localLang, setLang];
}

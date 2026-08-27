import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase, type Profile } from "@/lib/supabase";
import type { Language } from "@/lib/i18n";

export type DigiConPlan =
  | "startup"
  | "starter"
  | "growth"
  | "enterprise";

type AuthSession = {
  user: {
    id: string;
    email: string;
  };
};

type AuthContextType = {
  session: AuthSession | null;
  profile: Profile | null;
  plan: DigiConPlan;
  isActiveSubscription: boolean;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    companyName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toSession(
  value: {
    user: { id: string; email?: string | undefined };
  } | null,
): AuthSession | null {
  if (!value) return null;

  return {
    user: {
      id: value.user.id,
      email: value.user.email || "",
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<DigiConPlan>("startup");
  const [isActiveSubscription, setIsActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAccount = async (userId: string) => {
    const [profileResult, subscriptionResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("subscriptions")
        .select("plan,status")
        .eq("user_id", userId)
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    setProfile(profileResult.data as Profile | null);

    const activeSubscription = subscriptionResult.data;
    if (
      activeSubscription &&
      ["starter", "growth", "enterprise"].includes(
        activeSubscription.plan,
      )
    ) {
      setPlan(activeSubscription.plan as DigiConPlan);
      setIsActiveSubscription(true);
    } else {
      setPlan("startup");
      setIsActiveSubscription(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const nextSession = toSession(currentSession);
      setSession(nextSession);

      if (nextSession) {
        await loadAccount(nextSession.user.id);
      } else {
        setProfile(null);
        setPlan("startup");
        setIsActiveSubscription(false);
      }

      if (mounted) setLoading(false);
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;

      const nextSession = toSession(currentSession);
      setSession(nextSession);

      if (event === "SIGNED_OUT" || !nextSession) {
        setProfile(null);
        setPlan("startup");
        setIsActiveSubscription(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      void loadAccount(nextSession.user.id).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return { error: error?.message || null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    companyName: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setProfile(null);
    setPlan("startup");
    setIsActiveSubscription(false);
  };

  const refreshProfile = async () => {
    if (!session?.user.id) return;
    await loadAccount(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        plan,
        isActiveSubscription,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function useLanguage(): [Language, (language: Language) => void] {
  const { profile, refreshProfile } = useAuth();
  const [localLanguage, setLocalLanguage] =
    useState<Language>("en");

  useEffect(() => {
    if (profile?.language) {
      setLocalLanguage(profile.language as Language);
    }
  }, [profile?.language]);

  const setLanguage = (language: Language) => {
    setLocalLanguage(language);

    if (!profile) return;

    void supabase
      .from("profiles")
      .update({ language })
      .eq("id", profile.id)
      .then(() => refreshProfile());
  };

  return [localLanguage, setLanguage];
}

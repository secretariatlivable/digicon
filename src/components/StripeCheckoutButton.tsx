/**
 * DigiCon — Stripe Checkout button.
 *
 * Redirect-based, deliberately. The Edge Function creates a Checkout Session
 * server-side and returns its URL; the browser hands off to Stripe's hosted
 * page. Consequences worth knowing:
 *
 *  - No card data ever touches DigiCon, and no Stripe.js is loaded on the
 *    landing page, so the pricing section stays off the third-party critical
 *    path and the PCI surface stays at SAQ-A.
 *  - 3-D Secure, wallets and local payment methods are Stripe's problem.
 *  - This component NEVER grants entitlements. The verified webhook is the only
 *    writer of billing state — see supabase/functions/stripe-webhook.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  STRIPE_CHECKOUT_FUNCTION,
  getStripePlan,
  type StripePlanId,
} from '@/config/stripePlans';

interface StripeCheckoutButtonProps {
  planId: StripePlanId;
  /** Called just before the redirect, for analytics. */
  onRedirect?: (planId: StripePlanId) => void;
  onError?: (error: unknown) => void;
  className?: string;
}

type CheckoutResponse = {
  url?: string;
  error?: string;
};

export function StripeCheckoutButton({
  planId,
  onRedirect,
  onError,
  className = '',
}: StripeCheckoutButtonProps) {
  const navigate = useNavigate();
  const plan = getStripePlan(planId);

  const [checkingSession, setCheckingSession] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setSignedIn(Boolean(session));
      setCheckingSession(false);
    });

    // Keep the button honest if the visitor signs in or out in another tab.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setSignedIn(Boolean(session));
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const startCheckout = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // The subscription has to bind to a Supabase user, so there is no
        // meaningful anonymous checkout. Send them to sign up and come back.
        navigate(`/auth?mode=signup&plan=${planId}`);
        return;
      }

      const { data, error: invokeError } =
        await supabase.functions.invoke<CheckoutResponse>(
          STRIPE_CHECKOUT_FUNCTION,
          {
            body: {
              digiconPlanId: planId,
              // Where Stripe sends the visitor afterwards. The function
              // validates these against its own allowed origin.
              returnUrl: `${window.location.origin}/settings?billing=success`,
              cancelUrl: `${window.location.origin}/#pricing`,
            },
          },
        );

      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error('Stripe did not return a checkout URL.');

      onRedirect?.(planId);
      window.location.assign(data.url);
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : 'We could not start checkout. Please try again.';
      setError(message);
      onError?.(cause);
    } finally {
      setBusy(false);
    }
  }, [navigate, onError, onRedirect, planId]);

  if (checkingSession) {
    return (
      <div
        className={`flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] ${className}`}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 animate-spin text-white/40" aria-hidden="true" />
        <span className="sr-only">Preparing checkout</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-digicon-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-digicon-primary/25 transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : signedIn ? (
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden="true" />
        )}
        {busy
          ? 'Opening secure checkout…'
          : signedIn
            ? `Subscribe to ${plan.label}`
            : `Sign up for ${plan.label}`}
      </button>

      <p className="mt-2 text-center text-[0.68rem] text-white/35">
        Card, wallet and bank options — processed securely by Stripe.
      </p>

      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-digicon-error">
          {error}
        </p>
      )}
    </div>
  );
}

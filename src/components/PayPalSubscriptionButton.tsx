import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PayPalSubscriptionButton as PayPalSubscriptionButtonV6,
  type OnApproveDataSubscriptions,
  type OnErrorData,
} from "@paypal/react-paypal-js/sdk-v6";

import { supabase } from "@/lib/supabase";
import { getDigiConPlan, type DigiConPlanId } from "@/config/paypalPlans";

interface PayPalSubscriptionButtonProps {
  planId: Exclude<DigiConPlanId, "enterprise">;
  className?: string;
  onApproved?: (subscriptionId: string) => void | Promise<void>;
  onError?: (error: Error) => void;
}

/**
 * Creates the PayPal subscription through a Supabase Edge Function.
 * No PayPal secret is ever exposed to the browser.
 */
export function PayPalSubscriptionButton({
  planId,
  className = "",
  onApproved,
  onError,
}: PayPalSubscriptionButtonProps) {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const plan = getDigiConPlan(planId);

  const createSubscription = useCallback(async () => {
    setMessage(null);

    if (!plan.paypalPlanId) {
      const error = new Error(
        `PayPal ${plan.name} is not configured. Set VITE_PAYPAL_${planId.toUpperCase()}_PLAN_ID.`,
      );
      setMessage(error.message);
      onError?.(error);
      throw error;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const returnTo = `${window.location.pathname}${window.location.search}#pricing`;
      navigate(
        `/auth?mode=signup&returnTo=${encodeURIComponent(returnTo)}`,
      );
      throw new Error(
        "Please sign in or create an account before subscribing.",
      );
    }

    const { data, error } = await supabase.functions.invoke(
      "paypal-create-subscription",
      {
        body: {
          planId: plan.paypalPlanId,
          digiconPlanId: planId,
          returnUrl: `${window.location.origin}/settings?billing=success`,
          cancelUrl: `${window.location.origin}/#pricing`,
        },
      },
    );

    if (error) {
      throw new Error(
        error.message || "Unable to create the PayPal subscription.",
      );
    }

    if (
      typeof data?.subscriptionId !== "string" ||
      !data.subscriptionId.trim()
    ) {
      throw new Error(
        "PayPal did not return a valid subscription ID. Please try again.",
      );
    }

    return { subscriptionId: data.subscriptionId };
  }, [navigate, onError, plan.name, plan.paypalPlanId, planId]);

  const handleApprove = useCallback(
    async (data: OnApproveDataSubscriptions) => {
      if (!data.subscriptionId) {
        const error = new Error(
          "PayPal approved the subscription but did not return an ID.",
        );
        setMessage(error.message);
        onError?.(error);
        return;
      }

      setMessage("Subscription approved. Finalizing your DigiCon account...");

      try {
        await onApproved?.(data.subscriptionId);
      } catch (cause) {
        const error =
          cause instanceof Error
            ? cause
            : new Error("Subscription approval handling failed.");

        setMessage(error.message);
        onError?.(error);
      }
    },
    [onApproved, onError],
  );

  const handleError = useCallback(
    (data: OnErrorData) => {
      const error = new Error(
        data?.message || "PayPal could not start the subscription.",
      );
      setMessage(error.message);
      onError?.(error);
    },
    [onError],
  );

  return (
    <div className={className}>
      <PayPalSubscriptionButtonV6
        createSubscription={createSubscription}
        onApprove={handleApprove}
        onError={handleError}
        presentationMode="auto"
      />

      {message && (
        <p
          className="mt-2 text-xs text-white/60"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}

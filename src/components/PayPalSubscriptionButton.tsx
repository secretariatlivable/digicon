import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  getDigiConPayPalPlan,
  type DigiConPlanId,
} from "@/config/paypalPlans";

const PAYPAL_SDK_ID = "digicon-paypal-subscriptions-sdk";
const PAYPAL_CLIENT_ID =
  (import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined)?.trim() ?? "";

type PayPalSubscriptionData = {
  subscriptionID?: string;
};

type PayPalActions = {
  subscription: {
    create: (options: {
      plan_id: string;
      quantity?: number;
    }) => Promise<string>;
  };
};

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => void;
};

type PayPalButtonsOptions = {
  style?: {
    shape?: "rect";
    color?: "gold" | "blue" | "black" | "silver" | "white";
    layout?: "vertical" | "horizontal";
    label?: "subscribe";
    height?: number;
  };
  createSubscription: (
    data: unknown,
    actions: PayPalActions,
  ) => Promise<string>;
  onApprove: (
    data: PayPalSubscriptionData,
  ) => void | Promise<void>;
  onError: (error: unknown) => void;
  onCancel?: () => void;
};

type PayPalNamespace = {
  Buttons: (
    options: PayPalButtonsOptions,
  ) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

function loadPayPalSdk(): Promise<void> {
  if (window.paypal) return Promise.resolve();

  if (!PAYPAL_CLIENT_ID) {
    return Promise.reject(
      new Error(
        "PayPal is not configured. Set VITE_PAYPAL_CLIENT_ID.",
      ),
    );
  }

  const existing = document.getElementById(PAYPAL_SDK_ID);

  if (existing) {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error("Timed out loading PayPal."));
      }, 15000);

      existing.addEventListener(
        "load",
        () => {
          window.clearTimeout(timeout);
          if (window.paypal) resolve();
          else reject(
            new Error("PayPal loaded without its Checkout API."),
          );
        },
        { once: true },
      );

      existing.addEventListener(
        "error",
        () => {
          window.clearTimeout(timeout);
          reject(new Error("Unable to load PayPal Checkout."));
        },
        { once: true },
      );
    });
  }

  const script = document.createElement("script");
  script.id = PAYPAL_SDK_ID;
  script.src =
    `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID,
    )}&vault=true&intent=subscription&currency=PHP`;
  script.async = true;
  script.dataset.sdkIntegrationSource = "digicon";

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Timed out loading PayPal."));
    }, 15000);

    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.paypal) resolve();
      else reject(
        new Error("PayPal loaded without its Checkout API."),
      );
    };

    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Unable to load PayPal Checkout."));
    };

    document.head.appendChild(script);
  });
}

export interface PayPalSubscriptionButtonProps {
  planId: Exclude<DigiConPlanId, "startup">;
  className?: string;
  onApproved?: (subscriptionId: string) => void | Promise<void>;
}

export function PayPalSubscriptionButton({
  planId,
  className = "",
  onApproved,
}: PayPalSubscriptionButtonProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  const plan = getDigiConPayPalPlan(planId);

  const handleApprove = useCallback(
    async (data: PayPalSubscriptionData) => {
      if (!data.subscriptionID) {
        setError(
          "PayPal approved the subscription but did not return a subscription ID.",
        );
        return;
      }

      setProcessing(true);
      setError(null);

      try {
        await onApproved?.(data.subscriptionID);
        setApproved(true);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Subscription approval handling failed.",
        );
      } finally {
        setProcessing(false);
      }
    },
    [onApproved],
  );

  useEffect(() => {
    let cancelled = false;
    let buttons: PayPalButtonsInstance | undefined;

    const mount = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) setLoading(false);
          return;
        }

        if (!plan.paypalPlanId) {
          throw new Error(
            `${plan.name} is not configured for PayPal checkout.`,
          );
        }

        await loadPayPalSdk();

        if (cancelled || !containerRef.current || !window.paypal) {
          return;
        }

        containerRef.current.replaceChildren();

        buttons = window.paypal.Buttons({
          style: {
            shape: "rect",
            color: planId === "growth" ? "blue" : "gold",
            layout: "vertical",
            label: "subscribe",
            height: 48,
          },

          createSubscription: async (_data, actions) => {
            return actions.subscription.create({
              plan_id: plan.paypalPlanId as string,
              quantity: 1,
            });
          },

          onApprove: handleApprove,

          onCancel: () => {
            if (!cancelled) {
              setProcessing(false);
              setError("PayPal checkout was cancelled.");
            }
          },

          onError: (cause) => {
            console.error("PayPal subscription error:", cause);

            if (!cancelled) {
              setProcessing(false);
              setError(
                "PayPal could not start the subscription. Please try again.",
              );
            }
          },
        });

        await buttons.render(containerRef.current);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to initialize PayPal.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void mount();

    return () => {
      cancelled = true;
      buttons?.close?.();
      containerRef.current?.replaceChildren();
    };
  }, [handleApprove, plan.name, plan.paypalPlanId, planId]);

  if (approved) {
    return (
      <div
        className={`rounded-2xl border border-digicon-eco/30 bg-digicon-eco/10 p-4 ${className}`}
        role="status"
      >
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-digicon-eco" />
          <div>
            <p className="font-semibold text-white">
              Subscription approved
            </p>
            <p className="mt-1 text-sm text-white/60">
              Your subscription was submitted successfully. DigiCon
              will activate paid entitlements after the billing webhook
              is verified.
            </p>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="mt-3 text-sm font-medium text-digicon-eco underline underline-offset-4"
            >
              Open billing settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        aria-busy={loading || processing}
        className={loading ? "min-h-[48px]" : undefined}
      />

      {loading && PAYPAL_CLIENT_ID && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading secure PayPal checkout…
        </div>
      )}

      {processing && (
        <p className="mt-2 flex items-center gap-2 text-xs text-white/50">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Finalizing your subscription…
        </p>
      )}

      {error && (
        <div
          className="mt-2 flex items-start gap-2 rounded-xl border border-digicon-error/30 bg-digicon-error/10 p-3 text-xs text-digicon-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/40">
        <ShieldCheck className="h-3.5 w-3.5" />
        Secure subscription checkout by PayPal
      </div>
    </div>
  );
}
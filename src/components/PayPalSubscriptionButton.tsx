import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  getDigiConPayPalPlan,
  type DigiConPlanId,
} from "@/config/paypalPlans";

export interface PayPalSubscriptionButtonProps {
  planId: Exclude<DigiConPlanId, "startup" | "enterprise">;
  className?: string;
}

type PayPalSubscriptionResponse = {
  subscriptionId: string;
  status: string;
  approvalUrl: string;
};

export function PayPalSubscriptionButton({
  planId,
  className = "",
}: PayPalSubscriptionButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = getDigiConPayPalPlan(planId);

  const startSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        navigate("/login?returnTo=%2Fpricing");
        return;
      }

      if (!plan.paypalPlanId) {
        throw new Error(`${plan.name} is not configured for PayPal checkout.`);
      }

      const { data, error: invocationError } =
        await supabase.functions.invoke<PayPalSubscriptionResponse>(
          "paypal-create-subscription",
          {
            body: {
              planId: plan.paypalPlanId,
              digiconPlanId: planId,
              returnUrl: `${window.location.origin}/settings?billing=success`,
              cancelUrl: `${window.location.origin}/pricing`,
            },
          },
        );

      if (invocationError) {
        throw new Error(
          invocationError.message || "Unable to start PayPal checkout.",
        );
      }

      const approvalUrl = data?.approvalUrl?.trim();

      if (
        !approvalUrl ||
        !/^https:\/\/(www\.)?paypal\.com\//i.test(approvalUrl) &&
        !/^https:\/\/www\.sandbox\.paypal\.com\//i.test(approvalUrl)
      ) {
        throw new Error("PayPal did not return a valid approval URL.");
      }

      window.location.assign(approvalUrl);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to start PayPal checkout.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void startSubscription()}
        disabled={loading}
        className="w-full rounded-md bg-[#ffc439] px-4 py-2.5 text-sm font-semibold text-[#111827] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        aria-busy={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Opening secure PayPal checkout…
          </span>
        ) : (
          "Subscribe with PayPal"
        )}
      </button>

      {error && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        PayPal subscription is verified by DigiCon's webhook.
      </p>
    </div>
  );
}

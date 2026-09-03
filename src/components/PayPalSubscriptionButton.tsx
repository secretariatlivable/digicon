// Import React state for the asynchronous PayPal checkout operation.
import { useState } from "react";
// Import interface icons used by the secure checkout control.
import { Loader2, ShieldCheck } from "lucide-react";
// Import navigation for authentication redirects.
import { useNavigate } from "react-router-dom";
// Import the authenticated Supabase client.
import { supabase } from "@/lib/supabase";
// Import the server-configured DigiCon PayPal plans.
import {
  getDigiConPayPalPlan,
  type DigiConPlanId,
} from "@/config/paypalPlans";

// Define the supported self-service PayPal plans.
export interface PayPalSubscriptionButtonProps {
  // Restrict checkout to plans supported by the Edge Function.
  planId: Exclude<DigiConPlanId, "startup" | "enterprise">;
  // Allow the parent page to provide additional layout classes.
  className?: string;
}

// Define the response returned by paypal-create-subscription.
type PayPalSubscriptionResponse = {
  // Store the PayPal subscription identifier.
  subscriptionId: string;
  // Store the PayPal subscription state.
  status: string;
  // Store the PayPal approval URL.
  approvalUrl: string;
};

// Export the secure PayPal subscription control.
export function PayPalSubscriptionButton({
  planId,
  className = "",
}: PayPalSubscriptionButtonProps) {
  // Provide authentication navigation.
  const navigate = useNavigate();
  // Track whether the Edge Function request is active.
  const [loading, setLoading] = useState(false);
  // Store a safe user-facing checkout error.
  const [error, setError] = useState<string | null>(null);
  // Resolve the selected DigiCon plan from the shared configuration.
  const plan = getDigiConPayPalPlan(planId);

  // Start the server-authoritative PayPal subscription flow.
  const startSubscription = async () => {
    // Disable the control while the request is running.
    setLoading(true);
    // Clear an earlier error.
    setError(null);

    try {
      // Read the current authenticated Supabase session.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Redirect unauthenticated users to the sign-in page.
      if (!session?.access_token) {
        navigate("/login?returnTo=%2Fpricing");
        return;
      }

      // Reject an unavailable client configuration before invoking the server.
      if (!plan.paypalPlanId) {
        throw new Error(
          `${plan.name} is not configured for PayPal checkout.`,
        );
      }

      // Invoke the authenticated Supabase Edge Function.
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

      // Convert a Supabase transport failure into a user-facing error.
      if (invocationError) {
        throw new Error(
          invocationError.message || "Unable to start PayPal checkout.",
        );
      }

      // Read the approval URL returned by PayPal through the Edge Function.
      const approvalUrl = data?.approvalUrl?.trim();

      // Permit only official PayPal production or sandbox approval hosts.
      if (
        !approvalUrl ||
        (!/^https:\/\/(www\.)?paypal\.com\//i.test(approvalUrl) &&
          !/^https:\/\/www\.sandbox\.paypal\.com\//i.test(approvalUrl))
      ) {
        throw new Error("PayPal did not return a valid approval URL.");
      }

      // Transfer the customer to PayPal for subscription approval.
      window.location.assign(approvalUrl);
    } catch (cause) {
      // Convert unexpected errors into a safe readable message.
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to start PayPal checkout.",
      );
    } finally {
      // Restore the button after the operation ends.
      setLoading(false);
    }
  };

  // Render the PayPal checkout control.
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

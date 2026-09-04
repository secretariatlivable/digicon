import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layout/Layouts";
import { SectionHeading } from "@/components/kit";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { PayPalSubscriptionButton } from "@/components/PayPalSubscriptionButton";
import { UpgradeRequiredDialog } from "@/components/UpgradeRequiredDialog";
import { buttonVariants } from "@/components/ui/button";
// This is the Supabase-authenticated session (subscriptions table, RLS,
// active_plan_for()) — the billing source of truth the two migrations below
// establish. It is deliberately NOT `@/lib/session`, the older
// FastAPI/Mongo-backed hook: that stack has no `subscriptions` row and no
// concept of "starter" / "growth" / "enterprise".
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { DIGICON_PAYPAL_PLANS, type DigiConPlanId } from "@/config/paypalPlans";
import { isStripePlanId } from "@/config/stripePlans";

// Ordered by DIGICON_PAYPAL_PLANS' own key order: startup, starter, growth,
// enterprise. Feature copy, pricing labels, and provider identifiers all come
// from that single config so this page can never drift from what checkout
// actually charges.
const PLANS = Object.values(DIGICON_PAYPAL_PLANS);

/** Narrows to the two plan ids the PayPal Edge Function currently supports. */
function supportsPayPalCheckout(
  id: DigiConPlanId,
): id is Exclude<DigiConPlanId, "startup" | "enterprise"> {
  return id === "starter" || id === "growth";
}

/**
 * A gated feature (see src/lib/entitlements.ts) can send a visitor here with
 * router state instead of a bare link, e.g.
 *   navigate("/pricing", { state: { message: walletUpgradeMessage("apple"), suggestedPlan: "starter" } })
 * so the reason for landing on /pricing survives the redirect.
 */
interface UpgradeRedirectState {
  title?: string;
  message?: string;
  suggestedPlan?: Exclude<DigiConPlanId, "startup">;
}

export default function Pricing() {
  const { session, plan: currentPlan, isActiveSubscription } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const upgradeContext = (location.state ?? null) as UpgradeRedirectState | null;
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(
    Boolean(upgradeContext?.message),
  );

  const closeUpgradeDialog = () => {
    setShowUpgradeDialog(false);
    // Drop the router state so a refresh or back-navigation doesn't reopen it.
    navigate(location.pathname, { replace: true, state: null });
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <p className="label-caps">Pricing</p>
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            Free to discover. Paid when it becomes infrastructure.
          </h1>
          <p className="dense mx-auto mt-3 max-w-xl text-muted-foreground">
            Use the core relationship workspace for free. Upgrade when DigiCon becomes the system of
            record for your professional network.
          </p>
        </div>

        <div
          className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          data-testid="pricing-plans"
        >
          {PLANS.map((plan) => {
            const isFreePlan = plan.id === "startup";
            const isCurrentPlan = isActiveSubscription && currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl p-6",
                  plan.highlight ? "metal-edge" : "glass",
                )}
                data-testid={`plan-${plan.id}`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#1a1200]">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Most popular
                  </span>
                )}

                {isCurrentPlan && (
                  <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full border border-sky/60 bg-sky/10 px-3 py-1 text-xs font-semibold text-sky">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Current plan
                  </span>
                )}

                <p className="label-caps">{plan.name}</p>
                <p
                  className={cn(
                    "metric mt-1 text-3xl",
                    plan.highlight && "gold-text",
                  )}
                >
                  {plan.priceLabel}
                </p>
                <p className="dense mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <ul className="dense mt-5 flex-1 space-y-2 text-sm" data-testid={`plan-${plan.id}-features`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-2">
                  {isFreePlan ? (
                    <Link
                      to={session ? "/dashboard" : "/signup"}
                      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                      data-testid={`plan-${plan.id}-cta`}
                    >
                      {session ? "Go to dashboard" : "Start free"}
                    </Link>
                  ) : isCurrentPlan ? (
                    <Link
                      to="/settings"
                      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                      data-testid={`plan-${plan.id}-manage`}
                    >
                      Manage subscription
                    </Link>
                  ) : (
                    <>
                      {plan.selfServe && isStripePlanId(plan.id) && (
                        <StripeCheckoutButton
                          planId={plan.id}
                          className="w-full"
                        />
                      )}

                      {plan.selfServe && supportsPayPalCheckout(plan.id) && (
                        <PayPalSubscriptionButton
                          planId={plan.id}
                          className="w-full"
                        />
                      )}

                      {!plan.selfServe && (
                        <a
                          href="mailto:sales@digicon.ph"
                          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                          data-testid={`plan-${plan.id}-contact-sales`}
                        >
                          Talk to sales
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <section
          className="glass mt-10 rounded-2xl p-5 text-center"
          aria-labelledby="pricing-security-title"
        >
          <SectionHeading
            eyebrow="Billing"
            title="Server-verified, not client-trusted"
            testId="pricing-security-heading"
          />
          <p
            id="pricing-security-title"
            className="dense mx-auto max-w-2xl text-sm text-muted-foreground"
          >
            Card and wallet payments are processed by Stripe; PayPal subscriptions are processed by
            PayPal. Either way, DigiCon only grants a paid plan after the provider's webhook is
            verified server-side — the plan shown above updates from the same{" "}
            <code className="dense rounded bg-secondary/40 px-1 py-0.5 text-xs">subscriptions</code>{" "}
            table those webhooks write to, never from anything the browser reports on its own.
          </p>
        </section>
      </div>

      <UpgradeRequiredDialog
        open={showUpgradeDialog}
        onClose={closeUpgradeDialog}
        title={upgradeContext?.title ?? "Upgrade when DigiCon becomes essential"}
        message={
          upgradeContext?.message ??
          "This capability is available on a paid DigiCon plan."
        }
        suggestedPlan={upgradeContext?.suggestedPlan}
      />
    </PublicLayout>
  );
}

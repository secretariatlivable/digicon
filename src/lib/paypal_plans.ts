/**
 * DigiCon PayPal subscription plan configuration.
 *
 * Pricing mirrors the Landing Page:
 * Starter ₱199/month
 * Growth  ₱499/month
 * Enterprise Custom (sales-assisted; not a PayPal self-service subscription)
 */

export type DigiConPlanId = "starter" | "growth" | "enterprise";

export interface DigiConSubscriptionPlan {
  id: DigiConPlanId;
  name: string;
  pricePHP: number | null;
  interval: "MONTH";
  paypalPlanId?: string;
  description: string;
  features: readonly string[];
  highlight?: boolean;
  subscription: boolean;
}

const getPlanId = (value: string | undefined): string | undefined =>
  value?.trim() || undefined;

export const DIGICON_PAYPAL_PLANS: Readonly<
  Record<DigiConPlanId, DigiConSubscriptionPlan>
> = {
  starter: {
    id: "starter",
    name: "Starter",
    pricePHP: 199,
    interval: "MONTH",
    paypalPlanId: getPlanId(
      import.meta.env.VITE_PAYPAL_STARTER_PLAN_ID as string | undefined,
    ),
    description:
      "Perfect for solo entrepreneurs and small teams under 10 people.",
    features: [
      "3 Digital Cards",
      "Up to 100 Contacts",
      "QR Code Sharing",
      "Basic Analytics",
      "English & Filipino",
    ],
    subscription: true,
  },

  growth: {
    id: "growth",
    name: "Growth",
    pricePHP: 499,
    interval: "MONTH",
    paypalPlanId: getPlanId(
      import.meta.env.VITE_PAYPAL_GROWTH_PLAN_ID as string | undefined,
    ),
    description:
      "For scaling SMEs that need CRM automation and advanced analytics.",
    features: [
      "Unlimited Cards",
      "Unlimited Contacts",
      "HubSpot CRM Sync",
      "Advanced Analytics",
      "Team Access (5 seats)",
      "Eco Gamification",
      "Priority Support",
    ],
    highlight: true,
    subscription: true,
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    pricePHP: null,
    interval: "MONTH",
    description:
      "Tailored solutions for large organizations with custom integrations.",
    features: [
      "Everything in Growth",
      "Unlimited Team Seats",
      "Custom Integrations",
      "API Access",
      "Dedicated Manager",
      "SLA Guarantee",
    ],
    subscription: false,
  },
};

export const getDigiConPlan = (
  planId: DigiConPlanId,
): DigiConSubscriptionPlan => DIGICON_PAYPAL_PLANS[planId];

/**
 * DigiCon PayPal subscription plans.
 *
 * These IDs are PayPal Plan IDs, not client secrets.
 * The amounts are configured in PayPal; the UI mirrors the DigiCon
 * Pricing Section.
 */

export type DigiConPlanId = "starter" | "growth" | "enterprise";

export interface DigiConPayPalPlan {
  id: DigiConPlanId;
  name: string;
  priceLabel: string;
  planId: string;
  description: string;
  features: readonly string[];
  highlight?: boolean;
}

export const DIGICON_PAYPAL_PLANS: Record<DigiConPlanId, DigiConPayPalPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceLabel: "₱199 / month",
    planId: "P-6MP428311N661121LNKIFXAA",
    description:
      "Perfect for solo entrepreneurs and small teams under 10 people.",
    features: [
      "1 Digital Card",
      "Up to 25 Contacts",
      "QR Code Sharing",
      "Basic Analytics",
      "English & Filipino",
    ],
  },

  growth: {
    id: "growth",
    name: "Growth",
    priceLabel: "₱499 / month",
    planId: "P-8BE95305CD2758215NKIF2ZI",
    description:
      "For scaling SMEs that need CRM automation and advanced analytics.",
    features: [
      "Unlimited Cards",
      "Unlimited Contacts",
      "Intuitive CRM Sync",
      "Advanced Analytics",
      "Team Access (5 seats)",
      "Eco Gamification",
      "Priority Support",
    ],
    highlight: true,
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    planId: "P-0M743656FN385102CNKIGEJI",
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
  },
};

export function getDigiConPayPalPlan(
  planId: DigiConPlanId,
): DigiConPayPalPlan {
  return DIGICON_PAYPAL_PLANS[planId];
}
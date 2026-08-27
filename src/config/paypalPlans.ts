/**
 * Single source of truth for DigiCon pricing and PayPal plan identifiers.
 */

export type DigiConPlanId = "startup" | "starter" | "growth" | "enterprise";

export interface DigiConPayPalPlan {
  id: DigiConPlanId;
  name: string;
  priceLabel: string;
  paypalPlanId: string | null;
  description: string;
  features: readonly string[];
  highlight?: boolean;
  selfServe: boolean;
}

export const DIGICON_PAYPAL_PLANS: Readonly<
  Record<DigiConPlanId, DigiConPayPalPlan>
> = {
  startup: {
    id: "startup",
    name: "Startup",
    priceLabel: "Free",
    paypalPlanId: null,
    description:
      "Get started with two digital cards and essential sharing tools.",
    features: [
      "2 Digital Business Cards",
      "QR Code Sharing",
      "Shareable Card URL",
      "Contact Capture",
      "Basic Analytics",
    ],
    selfServe: false,
  },

  starter: {
    id: "starter",
    name: "Starter",
    priceLabel: "₱199 / month",
    paypalPlanId: "P-6MP428311N661121LNKIFXAA",
    description:
      "Essential digital networking for individuals and small businesses.",
    features: [
      "3 Digital Cards",
      "Up to 100 Contacts",
      "QR Code Sharing",
      "Basic Analytics",
      "Photo or Company Logo",
      "Eco Impact Tracking",
    ],
    selfServe: true,
  },

  growth: {
    id: "growth",
    name: "Growth",
    priceLabel: "₱499 / month",
    paypalPlanId: "P-8BE95305CD2758215NKIF2ZI",
    description:
      "Advanced networking and CRM tools for growing SMEs and teams.",
    features: [
      "Unlimited Cards",
      "Unlimited Contacts",
      "CRM Sync",
      "Advanced Analytics",
      "Team Access",
      "Eco Gamification",
      "Wallet Downloads",
      "Priority Support",
    ],
    highlight: true,
    selfServe: true,
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    paypalPlanId: "P-0M743656FN385102CNKIGEJI",
    description:
      "Tailored solutions for organizations with advanced integrations and support.",
    features: [
      "Everything in Growth",
      "Unlimited Team Seats",
      "Custom Integrations",
      "API Access",
      "Dedicated Manager",
      "SLA Guarantee",
    ],
    selfServe: true,
  },
};

export function getDigiConPayPalPlan(
  planId: DigiConPlanId,
): DigiConPayPalPlan {
  return DIGICON_PAYPAL_PLANS[planId];
}
/**
 * DigiCon product entitlement rules.
 *
 * IMPORTANT:
 * Client-side checks are for UX only. Production enforcement must also be
 * performed by trusted Supabase Edge Functions / database policies so a user
 * cannot bypass limits by manipulating browser state.
 */

export type DigiConAccountType = "startup" | "sme" | "enterprise";
export type DigiConPlan = "startup" | "starter" | "growth" | "enterprise";
export type WalletProvider = "apple" | "google";
export type EntitlementAction =
  | "create_card"
  | "edit_card"
  | "wallet_download";

export interface EntitlementState {
  accountType: DigiConAccountType;
  plan: DigiConPlan;
  cardCount: number;
  completedCardEdits: number;
  isActiveSubscription: boolean;
}

export interface EntitlementResult {
  allowed: boolean;
  action: EntitlementAction;
  reason?: string;
  upgradeRequired: boolean;
  suggestedPlan?: Exclude<DigiConPlan, "startup">;
  message?: string;
}

export const STARTUP_MAX_CARDS = 2;
export const STARTUP_MAX_EDITS_PER_CARD = 2;

export function isPaidPlan(plan: DigiConPlan): boolean {
  return plan === "starter" || plan === "growth" || plan === "enterprise";
}

export function checkCreateCardEntitlement(
  state: EntitlementState,
): EntitlementResult {
  if (isPaidPlan(state.plan) && state.isActiveSubscription) {
    return {
      allowed: true,
      action: "create_card",
      upgradeRequired: false,
    };
  }

  if (state.cardCount < STARTUP_MAX_CARDS) {
    return {
      allowed: true,
      action: "create_card",
      upgradeRequired: false,
    };
  }

  return {
    allowed: false,
    action: "create_card",
    upgradeRequired: true,
    suggestedPlan: "starter",
    message:
      "Your Startup access includes 2 digital business cards. Upgrade to create a third card.",
  };
}

export function checkEditCardEntitlement(
  state: EntitlementState,
): EntitlementResult {
  if (isPaidPlan(state.plan) && state.isActiveSubscription) {
    return {
      allowed: true,
      action: "edit_card",
      upgradeRequired: false,
    };
  }

  if (state.completedCardEdits < STARTUP_MAX_EDITS_PER_CARD) {
    return {
      allowed: true,
      action: "edit_card",
      upgradeRequired: false,
    };
  }

  return {
    allowed: false,
    action: "edit_card",
    upgradeRequired: true,
    suggestedPlan: "starter",
    message:
      "Your Startup access includes 2 edits per completed card. Upgrade to make another edit.",
  };
}

/**
 * Wallet downloads are a paid feature for Startup and SME accounts.
 * Enterprise follows the active subscription entitlement.
 */
export function checkWalletEntitlement(
  state: EntitlementState,
  provider: WalletProvider,
): EntitlementResult {
  if (isPaidPlan(state.plan) && state.isActiveSubscription) {
    return {
      allowed: true,
      action: "wallet_download",
      upgradeRequired: false,
    };
  }

  return {
    allowed: false,
    action: "wallet_download",
    upgradeRequired: true,
    suggestedPlan: state.accountType === "sme" ? "growth" : "starter",
    message:
      `${provider === "apple" ? "Apple Wallet" : "Google Wallet"} download is available after upgrading your DigiCon plan.`,
  };
}
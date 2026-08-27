/**
 * Client-side entitlement policy.
 *
 * These checks control UX only. They must be duplicated/enforced by trusted
 * Supabase functions/RPCs for production security.
 */

export type DigiConAccountType = "startup" | "sme" | "enterprise";
export type DigiConPlan = "startup" | "starter" | "growth" | "enterprise";
export type WalletProvider = "apple" | "google";

export const STARTUP_MAX_CARDS = 2;
export const STARTUP_MAX_EDITS_PER_CARD = 2;

export function isActivePaidPlan(
  plan: DigiConPlan,
  activeSubscription: boolean,
): boolean {
  return activeSubscription && plan !== "startup";
}

export function canCreateCard(
  plan: DigiConPlan,
  activeSubscription: boolean,
  currentCardCount: number,
): boolean {
  if (isActivePaidPlan(plan, activeSubscription)) return true;
  return currentCardCount < STARTUP_MAX_CARDS;
}

export function canEditCompletedCard(
  plan: DigiConPlan,
  activeSubscription: boolean,
  completedCardEditCount: number,
): boolean {
  if (isActivePaidPlan(plan, activeSubscription)) return true;
  return completedCardEditCount < STARTUP_MAX_EDITS_PER_CARD;
}

export function canDownloadWallet(
  plan: DigiConPlan,
  activeSubscription: boolean,
): boolean {
  /*
   * The requested business rule is:
   * Startup → wallet requires upgrade
   * SME      → wallet requires upgrade
   * Active paid plans → allowed
   */
  return isActivePaidPlan(plan, activeSubscription);
}

export function walletUpgradeMessage(provider: WalletProvider): string {
  return `${provider === "apple" ? "Apple Wallet" : "Google Wallet"} download is available after upgrading your DigiCon plan.`;
}

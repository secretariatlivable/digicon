/**
 * Client-side entitlement policy.
 *
 * These checks control UX only. They must be duplicated/enforced by trusted
 * Supabase functions/RPCs for production security.
 *
 * Product model:
 * - Startup/free users can create up to two cards.
 * - Startup/free users get two completed edits per card.
 * - Wallet export is available only on an active paid plan.
 * - Active paid plans bypass the startup limits.
 */

import type { DigiConPlanId } from '@/config/paypalPlans';

export type DigiConAccountType = 'startup' | 'sme' | 'enterprise';
export type DigiConPlan = DigiConPlanId;
export type WalletProvider = 'apple' | 'google';

export const STARTUP_MAX_CARDS = 2;
export const STARTUP_MAX_EDITS_PER_CARD = 2;

export interface EntitlementState {
  accountType: DigiConAccountType;
  plan: DigiConPlan;
  cardCount: number;
  completedCardEdits: number;
  isActiveSubscription: boolean;
}

export interface EntitlementResult {
  allowed: boolean;
  code:
    | 'allowed'
    | 'card_limit_reached'
    | 'edit_limit_reached'
    | 'wallet_upgrade_required';
  message: string;
  suggestedPlan?: Exclude<DigiConPlanId, 'startup'>;
  provider?: WalletProvider;
}

export function isActivePaidPlan(
  plan: DigiConPlan,
  activeSubscription: boolean,
): boolean {
  return activeSubscription && plan !== 'startup';
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
  return isActivePaidPlan(plan, activeSubscription);
}

export function walletUpgradeMessage(provider: WalletProvider): string {
  return `${provider === 'apple' ? 'Apple Wallet' : 'Google Wallet'} download is available after upgrading your DigiCon plan.`;
}

function suggestedPaidPlan(
  plan: DigiConPlan,
): Exclude<DigiConPlanId, 'startup'> {
  if (plan === 'enterprise') return 'enterprise';
  if (plan === 'growth') return 'growth';
  return 'starter';
}

export function checkCreateCardEntitlement(
  state: EntitlementState,
): EntitlementResult {
  if (canCreateCard(state.plan, state.isActiveSubscription, state.cardCount)) {
    return {
      allowed: true,
      code: 'allowed',
      message: 'You can create another DigiCon identity.',
    };
  }

  return {
    allowed: false,
    code: 'card_limit_reached',
    message:
      'You have reached the two-card free limit. Upgrade when DigiCon becomes part of your professional workflow.',
    suggestedPlan: suggestedPaidPlan(state.plan),
  };
}

export function checkEditCardEntitlement(
  state: EntitlementState,
): EntitlementResult {
  if (
    canEditCompletedCard(
      state.plan,
      state.isActiveSubscription,
      state.completedCardEdits,
    )
  ) {
    return {
      allowed: true,
      code: 'allowed',
      message: 'You can continue refining this DigiCon identity.',
    };
  }

  return {
    allowed: false,
    code: 'edit_limit_reached',
    message:
      'This card has reached the two-edit free allowance. Upgrade to keep your professional identity current as your role evolves.',
    suggestedPlan: suggestedPaidPlan(state.plan),
  };
}

export function checkWalletEntitlement(
  state: EntitlementState,
  provider: WalletProvider,
): EntitlementResult {
  if (canDownloadWallet(state.plan, state.isActiveSubscription)) {
    return {
      allowed: true,
      code: 'allowed',
      message: `${provider === 'apple' ? 'Apple Wallet' : 'Google Wallet'} export is available.`,
      provider,
    };
  }

  return {
    allowed: false,
    code: 'wallet_upgrade_required',
    message: walletUpgradeMessage(provider),
    suggestedPlan: suggestedPaidPlan(state.plan),
    provider,
  };
}

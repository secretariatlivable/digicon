import { supabase } from '@/lib/supabase';

/**
 * DigiCon wallet integration.
 *
 * SECURITY MODEL
 * --------------
 * The browser performs a server-side capability preflight before invoking
 * either wallet Edge Function.
 *
 * This preflight is NOT the final authorization boundary.
 *
 * The wallet Edge Functions must independently verify:
 *   1. authenticated user
 *   2. card ownership
 *   3. current wallet.export entitlement
 *   4. requested card is active/accessible
 *
 * The client never supplies a user_id.
 */

type WalletResponse = {
  passBase64?: string;
  filename?: string;
  saveUrl?: string;
  error?: string;
};

type CapabilityResponse = {
  capability: string;
  allowed: boolean;
  plan: string;
  code: string;
};

type WalletPlatform = 'apple' | 'google';

const APP_ORIGIN =
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, '') || 'https://digicon.cards';

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

function normalizeCardId(cardId: string): string {
  const normalized = cardId.trim();

  if (!normalized) {
    throw new Error('A business card ID is required.');
  }

  /*
   * DigiCon card IDs are UUIDs.
   *
   * This validation is deliberately performed client-side only as a
   * malformed-input guard. It is NOT a security control.
   */
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(normalized)) {
    throw new Error('The business card ID is invalid.');
  }

  return normalized;
}

function normalizeCapabilityError(code: string): string {
  switch (code) {
    case 'authentication_required':
      return 'Please sign in before adding a DigiCon card to your wallet.';

    case 'paid_plan_required':
      return 'Wallet export is available with an eligible DigiCon plan.';

    case 'capability_not_available':
      return 'Wallet export is not available for this DigiCon account.';

    case 'limit_reached_or_forbidden':
      return 'You do not have permission to export this card to a wallet.';

    default:
      return 'Wallet export is not available under your current DigiCon entitlement.';
  }
}

/* ------------------------------------------------------------------ */
/* Server-authoritative capability preflight                           */
/* ------------------------------------------------------------------ */

/**
 * Checks the current server-side wallet entitlement.
 *
 * This is deliberately a preflight for user experience only.
 * The Edge Function must repeat authorization checks before generating
 * or returning a wallet credential.
 */
async function requireWalletCapability(cardId: string): Promise<void> {
  const { data: capabilityData, error } =
    await supabase.rpc('digicon_check_capability', {
      p_capability: 'wallet.export',
      p_resource_id: cardId,
    });

  if (error) {
    console.error('[DigiCon] wallet capability check failed:', error);

    if (
      error.code === '28000' ||
      /authentication required/i.test(error.message)
    ) {
      throw new Error(
        'Please sign in before adding a DigiCon card to your wallet.',
      );
    }

    throw new Error(
      'We could not verify your wallet entitlement. Please try again.',
    );
  }

  const result = (
    Array.isArray(capabilityData)
      ? capabilityData[0]
      : capabilityData
  ) as CapabilityResponse | null | undefined;

  if (!result) {
    throw new Error(
      'We could not verify your wallet entitlement. Please try again.',
    );
  }

  if (!result.allowed) {
    throw new Error(normalizeCapabilityError(result.code));
  }
}

/* ------------------------------------------------------------------ */
/* Wallet response helpers                                             */
/* ------------------------------------------------------------------ */

function base64ToBlob(value: string, mimeType: string): Blob {
  let binary: string;

  try {
    binary = window.atob(value);
  } catch {
    throw new Error(
      'The Apple Wallet service returned an invalid pass file.',
    );
  }

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = filename;
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();

  /*
   * Give the browser enough time to start the download before releasing
   * the object URL.
   */
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

function normalizeAppleFilename(filename?: string): string {
  const fallback = 'digicon-business-card.pkpass';

  if (!filename?.trim()) {
    return fallback;
  }

  const normalized = filename.trim();

  return normalized.toLowerCase().endsWith('.pkpass')
    ? normalized
    : `${normalized}.pkpass`;
}

function isValidGoogleWalletSaveUrl(value: string): boolean {
  /*
   * Only permit Google's official Save to Google Wallet endpoint.
   *
   * Never redirect the browser to an arbitrary URL returned by an
   * external service.
   */
  return /^https:\/\/pay\.google\.com\/gp\/v\/save\//i.test(value);
}

/* ------------------------------------------------------------------ */
/* Edge Function invocation                                            */
/* ------------------------------------------------------------------ */

async function invokeWalletFunction(
  functionName: 'apple-wallet-pass' | 'google-wallet-pass',
  cardId: string,
): Promise<WalletResponse> {
  const normalizedCardId = normalizeCardId(cardId);

  /*
   * Confirm a current authenticated session before making the request.
   *
   * The access token is automatically attached by the Supabase client
   * when the session is valid.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error(
      'Please sign in before adding a DigiCon card to a wallet.',
    );
  }

  /*
   * Server-authoritative entitlement preflight.
   *
   * The Edge Function must independently repeat this authorization.
   */
  await requireWalletCapability(normalizedCardId);

  const cardUrl = `${APP_ORIGIN}/c/${encodeURIComponent(
    normalizedCardId,
  )}`;

  const { data, error } = await supabase.functions.invoke<WalletResponse>(
    functionName,
    {
      body: {
        card_id: normalizedCardId,
        card_url: cardUrl,
      },
    },
  );

  if (error) {
    console.error(
      `[DigiCon] ${functionName} invocation failed:`,
      error,
    );

    /*
     * Supabase Edge Function errors can be wrapped by the client,
     * therefore normalize the common authentication/authorization
     * messages rather than exposing raw transport details.
     */
    if (
      /jwt|unauthorized|authentication required|not authenticated/i.test(
        error.message,
      )
    ) {
      throw new Error(
        'Please sign in before adding a DigiCon card to a wallet.',
      );
    }

    if (
      /forbidden|not allowed|entitlement|capability|upgrade|plan/i.test(
        error.message,
      )
    ) {
      throw new Error(
        'Wallet export is not available under your current DigiCon entitlement.',
      );
    }

    throw new Error(
      error.message ||
        `Unable to start the ${functionName} service.`,
    );
  }

  if (!data) {
    throw new Error(`${functionName} returned no response.`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Generate and download an Apple Wallet pass.
 */
export async function addToAppleWallet(cardId: string): Promise<void> {
  const response = await invokeWalletFunction(
    'apple-wallet-pass',
    cardId,
  );

  if (!response.passBase64) {
    throw new Error(
      'Apple Wallet service did not return a valid .pkpass file.',
    );
  }

  const filename = normalizeAppleFilename(response.filename);

  const blob = base64ToBlob(
    response.passBase64,
    'application/vnd.apple.pkpass',
  );

  downloadBlob(blob, filename);
}

/**
 * Open Google's official Save to Google Wallet flow.
 */
export async function addToGoogleWallet(cardId: string): Promise<void> {
  const response = await invokeWalletFunction(
    'google-wallet-pass',
    cardId,
  );

  const saveUrl = response.saveUrl?.trim();

  if (!saveUrl || !isValidGoogleWalletSaveUrl(saveUrl)) {
    throw new Error(
      'Google Wallet service did not return a valid Save to Google Wallet URL.',
    );
  }

  window.location.assign(saveUrl);
}

/**
 * Optional convenience dispatcher for UI components that select a wallet
 * platform dynamically.
 */
export async function addToWallet(
  platform: WalletPlatform,
  cardId: string,
): Promise<void> {
  switch (platform) {
    case 'apple':
      await addToAppleWallet(cardId);
      return;

    case 'google':
      await addToGoogleWallet(cardId);
      return;

    default:
      throw new Error('Unsupported wallet platform.');
  }
}

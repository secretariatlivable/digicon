import { supabase } from '@/lib/supabase';

type WalletPlatform = 'apple' | 'google';

type WalletResponse = {
  url?: string;
  error?: string;
};

const FUNCTION_NAMES: Record<WalletPlatform, string> = {
  apple: 'apple-wallet-pass',
  google: 'google-wallet-pass',
};

export async function getWalletUrl(
  platform: WalletPlatform,
  cardId: string,
): Promise<string> {
  if (!cardId) {
    throw new Error('A business card ID is required.');
  }

  const { data, error } = await supabase.functions.invoke<WalletResponse>(
    FUNCTION_NAMES[platform],
    {
      body: { card_id: cardId },
    },
  );

  if (error) {
    console.error(`Failed to create ${platform} wallet pass:`, error);
    throw new Error(
      `Unable to create the ${platform === 'apple' ? 'Apple Wallet' : 'Google Wallet'} pass.`,
    );
  }

  if (!data?.url) {
    throw new Error(
      data?.error ||
        `The ${platform === 'apple' ? 'Apple Wallet' : 'Google Wallet'} pass could not be created.`,
    );
  }

  return data.url;
}

export async function openWallet(
  platform: WalletPlatform,
  cardId: string,
): Promise<void> {
  const url = await getWalletUrl(platform, cardId);

  // Use the current tab for Wallet URLs. This works better on iOS
  // than creating a detached popup from a promise callback.
  window.location.assign(url);
}

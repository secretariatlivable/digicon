import { supabase } from '@/lib/supabase';

export type WalletPlatform = 'apple' | 'google';

type AppleWalletResponse = {
  passBase64?: string;
  filename?: string;
  error?: string;
};

type GoogleWalletResponse = {
  url?: string;
  error?: string;
};

function downloadBase64File(
  base64: string,
  filename: string,
  mimeType: string,
): void {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function addToAppleWallet(cardId: string): Promise<void> {
  if (!cardId) {
    throw new Error('A business card ID is required.');
  }

  const { data, error } = await supabase.functions.invoke<AppleWalletResponse>(
    'apple-wallet-pass',
    {
      body: { card_id: cardId },
    },
  );

  if (error) {
    console.error('Apple Wallet function error:', error);
    throw new Error('Unable to create the Apple Wallet pass.');
  }

  if (!data?.passBase64) {
    throw new Error(data?.error || 'Apple Wallet pass creation failed.');
  }

  downloadBase64File(
    data.passBase64,
    data.filename || 'digicon-card.pkpass',
    'application/vnd.apple.pkpass',
  );
}

export async function getGoogleWalletUrl(cardId: string): Promise<string> {
  if (!cardId) {
    throw new Error('A business card ID is required.');
  }

  const { data, error } =
    await supabase.functions.invoke<GoogleWalletResponse>(
      'google-wallet-pass',
      {
        body: { card_id: cardId },
      },
    );

  if (error) {
    console.error('Google Wallet function error:', error);
    throw new Error('Unable to create the Google Wallet pass.');
  }

  if (!data?.url) {
    throw new Error(data?.error || 'Google Wallet pass creation failed.');
  }

  return data.url;
}

export async function addToGoogleWallet(cardId: string): Promise<void> {
  const url = await getGoogleWalletUrl(cardId);
  window.location.assign(url);
}

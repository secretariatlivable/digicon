import { supabase } from '@/lib/supabase';

const APP_ORIGIN = 'https://digicon.cards';

type WalletResponse = {
  passBase64?: string;
  filename?: string;
  saveUrl?: string;
  url?: string;
  error?: string;
};

function base64ToBlob(value: string, mimeType: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function invokeWalletFunction(
  functionName: 'apple-wallet-pass' | 'google-wallet-pass',
  cardId: string,
): Promise<WalletResponse> {
  if (!cardId) throw new Error('A business card ID is required.');

  const { data, error } = await supabase.functions.invoke<WalletResponse>(
    functionName,
    {
      body: {
        card_id: cardId,
        card_url: `${APP_ORIGIN}/c/${encodeURIComponent(cardId)}`,
        origin: APP_ORIGIN,
      },
    },
  );

  if (error) {
    throw new Error(error.message || `Unable to call ${functionName}.`);
  }
  if (!data) throw new Error(`${functionName} returned no response.`);
  if (data.error) throw new Error(data.error);

  return data;
}

export async function addToAppleWallet(cardId: string): Promise<void> {
  const response = await invokeWalletFunction('apple-wallet-pass', cardId);

  if (!response.passBase64) {
    throw new Error('Apple Wallet service did not return a .pkpass file.');
  }

  const filename = response.filename?.endsWith('.pkpass')
    ? response.filename
    : `${response.filename || 'digicon-business-card'}.pkpass`;

  downloadBlob(
    base64ToBlob(response.passBase64, 'application/vnd.apple.pkpass'),
    filename,
  );
}

export async function addToGoogleWallet(cardId: string): Promise<void> {
  const response = await invokeWalletFunction('google-wallet-pass', cardId);
  const saveUrl = response.saveUrl || response.url;

  if (
    !saveUrl ||
    !/^https:\/\/(pay\.google\.com|walletobjects\.googleapis\.com)\//i.test(
      saveUrl,
    )
  ) {
    throw new Error(
      'Google Wallet service did not return a valid Save to Google Wallet URL.',
    );
  }

  window.location.assign(saveUrl);
}

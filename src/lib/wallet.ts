import { supabase } from "@/lib/supabase";

type WalletResponse = {
  passBase64?: string;
  filename?: string;
  saveUrl?: string;
  error?: string;
};

const APP_ORIGIN =
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "") || "https://digicon.cards";

function base64ToBlob(value: string, mimeType: string): Blob {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function invokeWalletFunction(
  functionName: "apple-wallet-pass" | "google-wallet-pass",
  cardId: string,
): Promise<WalletResponse> {
  const normalizedCardId = cardId.trim();

  if (!normalizedCardId) {
    throw new Error("A business card ID is required.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please sign in before adding a card to a wallet.");
  }

  const { data, error } = await supabase.functions.invoke<WalletResponse>(
    functionName,
    {
      body: {
        card_id: normalizedCardId,
        card_url: `${APP_ORIGIN}/c/${encodeURIComponent(normalizedCardId)}`,
      },
    },
  );

  if (error) {
    throw new Error(
      error.message || `Unable to start the ${functionName} service.`,
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

export async function addToAppleWallet(cardId: string): Promise<void> {
  const response = await invokeWalletFunction("apple-wallet-pass", cardId);

  if (!response.passBase64) {
    throw new Error("Apple Wallet service did not return a .pkpass file.");
  }

  const filename = response.filename?.endsWith(".pkpass")
    ? response.filename
    : `${response.filename || "digicon-business-card"}.pkpass`;

  downloadBlob(
    base64ToBlob(
      response.passBase64,
      "application/vnd.apple.pkpass",
    ),
    filename,
  );
}

export async function addToGoogleWallet(cardId: string): Promise<void> {
  const response = await invokeWalletFunction("google-wallet-pass", cardId);
  const saveUrl = response.saveUrl;

  if (
    !saveUrl ||
    !/^https:\/\/pay\.google\.com\/gp\/v\/save\//i.test(saveUrl)
  ) {
    throw new Error(
      "Google Wallet service did not return a valid Save to Google Wallet URL.",
    );
  }

  window.location.assign(saveUrl);
}

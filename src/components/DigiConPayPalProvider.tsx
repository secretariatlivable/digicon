import type { ReactNode } from "react";
import { PayPalProvider } from "@paypal/react-paypal-js/sdk-v6";

interface DigiConPayPalProviderProps {
  children: ReactNode;
}

/**
 * PayPal React SDK v6 provider.
 *
 * The client ID is public. The PayPal client secret must remain in
 * Supabase Edge Function secrets and must never use a VITE_ prefix.
 */
export function DigiConPayPalProvider({
  children,
}: DigiConPayPalProviderProps) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as
    | string
    | undefined;

  if (!clientId) {
    return <>{children}</>;
  }

  const environment =
    (import.meta.env.VITE_PAYPAL_ENVIRONMENT as
      | "sandbox"
      | "production"
      | undefined) ?? "production";

  return (
    <PayPalProvider
      clientId={clientId}
      environment={environment}
      components={["paypal-subscriptions"]}
      pageType="checkout"
      locale="en_PH"
    >
      {children}
    </PayPalProvider>
  );
}

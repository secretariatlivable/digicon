import { useEffect, useId, useRef, useState } from 'react';

type PayPalButtonsNamespace = {
  Buttons: (options: {
    style?: {
      layout?: 'vertical' | 'horizontal';
      color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
      shape?: 'rect' | 'pill';
      label?: 'paypal' | 'subscribe' | 'checkout' | 'buynow' | 'pay' | 'installment';
      height?: number;
    };
    createSubscription: (
      data: unknown,
      actions: {
        subscription: {
          create: (options: { plan_id: string }) => Promise<string>;
        };
      },
    ) => Promise<string>;
    onApprove?: (data: { subscriptionID?: string; orderID?: string }) => void;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
  }) => {
    render: (selector: HTMLElement) => Promise<void>;
    close?: () => void;
  };
};

declare global {
  interface Window {
    paypal?: PayPalButtonsNamespace;
  }
}

const PAYPAL_CLIENT_ID =
  import.meta.env.VITE_PAYPAL_CLIENT_ID ||
  'AZvo6GByRHW8ecCWKlwko_pxLUb-2JPcTR17PStpxuk2l6rv1cinTzXAtg4Qcl9yJPOSq41vuyIWwvFx';

let sdkPromise: Promise<void> | null = null;

function loadPayPalSdk(): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-digicon-paypal-sdk="true"]',
    );

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('PayPal could not be loaded.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src =
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}` +
      '&components=buttons&vault=true&intent=subscription&currency=PHP';
    script.async = true;
    script.dataset.digiconPaypalSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PayPal could not be loaded.'));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export type PayPalSubscriptionButtonProps = {
  planId?: string;
  label?: string;
  disabled?: boolean;
  onApproved?: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
};

export function PayPalSubscriptionButton({
  planId,
  label = 'Subscribe with PayPal',
  disabled = false,
  onApproved,
  onError,
}: PayPalSubscriptionButtonProps) {
  const containerId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsRef = useRef<{ close?: () => void } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const approvedRef = useRef(onApproved);
  const errorRef = useRef(onError);

  useEffect(() => {
    approvedRef.current = onApproved;
    errorRef.current = onError;
  }, [onApproved, onError]);

  useEffect(() => {
    let cancelled = false;

    if (!planId || disabled) return undefined;

    const mount = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        await loadPayPalSdk();

        if (cancelled || !window.paypal || !containerRef.current) return;

        containerRef.current.replaceChildren();

        const buttons = window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'subscribe',
            height: 44,
          },
          createSubscription: (_data, actions) =>
            actions.subscription.create({ plan_id: planId }),
          onApprove: (data) => {
            const subscriptionId = data.subscriptionID;
            if (subscriptionId) {
              approvedRef.current?.(subscriptionId);
            }
          },
          onCancel: () => {
            if (!cancelled) setLoading(false);
          },
          onError: (paypalError) => {
            const error =
              paypalError instanceof Error
                ? paypalError
                : new Error('PayPal could not start the subscription.');
            if (!cancelled) {
              setErrorMessage(error.message);
              errorRef.current?.(error);
            }
          },
        });

        buttonsRef.current = buttons;
        await buttons.render(containerRef.current);
      } catch (error) {
        const normalized =
          error instanceof Error
            ? error
            : new Error('Unable to initialize PayPal.');
        if (!cancelled) {
          setErrorMessage(normalized.message);
          onError?.(normalized);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void mount();

    return () => {
      cancelled = true;
      try {
        buttonsRef.current?.close?.();
      } catch {
        // PayPal may already have removed the iframe during unmount.
      }
      buttonsRef.current = null;
      containerRef.current?.replaceChildren();
    };
  }, [planId, disabled]);

  if (!planId) {
    return (
      <div className="rounded-glass-md border border-white/10 bg-white/5 p-3 text-center">
        <p className="text-xs text-white/45">
          PayPal is not configured for this plan yet. Add its PayPal Plan ID to the deployment environment.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="mb-2 text-center text-xs text-white/40" role="status">
          Loading secure PayPal checkout…
        </div>
      )}
      <div id={containerId} ref={containerRef} aria-label={label} />
      {errorMessage && (
        <p className="mt-2 text-center text-xs text-digicon-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

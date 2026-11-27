import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from 'react';

type A11ySettings = {
  largeText: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
};

const A11yContext = createContext<A11ySettings | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const value = useMemo<A11ySettings>(
    () => ({
      largeText,
      reducedMotion,
      highContrast,
      toggleLargeText: () => setLargeText((value) => !value),
      toggleReducedMotion: () => setReducedMotion((value) => !value),
      toggleHighContrast: () => setHighContrast((value) => !value),
    }),
    [largeText, reducedMotion, highContrast],
  );

  return createElement(
    A11yContext.Provider,
    { value },
    createElement(
      'div',
      {
        className: [
          largeText ? 'a11y-large-text' : '',
          reducedMotion ? 'a11y-reduced-motion' : '',
          highContrast ? 'a11y-high-contrast' : '',
        ].filter(Boolean).join(' '),
      },
      children,
    ),
  );
}

export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used inside A11yProvider');
  }
  return context;
}

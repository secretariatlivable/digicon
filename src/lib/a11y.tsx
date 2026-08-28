import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';

/**
 * Accessibility preferences.
 *
 * These are visitor-controlled overrides layered on top of the OS settings the
 * stylesheet already honours (prefers-reduced-motion, prefers-contrast,
 * prefers-reduced-transparency). Stored per-device so the choice survives
 * reloads; never sent anywhere.
 */
export type A11ySettings = {
  /** Root font scale, 0.9 – 1.5. */
  scale: number;
  contrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  largeCursor: boolean;
  /** "Calm mode" — stops all animation regardless of OS setting. */
  calm: boolean;
};

const DEFAULTS: A11ySettings = {
  scale: 1,
  contrast: false,
  grayscale: false,
  underlineLinks: false,
  largeCursor: false,
  calm: false,
};

const STORAGE_KEY = 'digicon.a11y.v1';

const CLASS_MAP: Record<keyof Omit<A11ySettings, 'scale'>, string> = {
  contrast: 'a11y-contrast',
  grayscale: 'a11y-grayscale',
  underlineLinks: 'a11y-underline',
  largeCursor: 'a11y-cursor',
  calm: 'a11y-calm',
};

type A11yContextValue = {
  settings: A11ySettings;
  set: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  toggle: (key: keyof Omit<A11ySettings, 'scale'>) => void;
  stepScale: (delta: number) => void;
  reset: () => void;
};

const A11yContext = createContext<A11yContextValue | null>(null);

function load(): A11ySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<A11ySettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function A11yProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(DEFAULTS);

  // hydrate after mount so SSR/prerender output stays stable
  useEffect(() => setSettings(load()), []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--a11y-scale', String(settings.scale));
    (Object.keys(CLASS_MAP) as Array<keyof typeof CLASS_MAP>).forEach((key) => {
      root.classList.toggle(CLASS_MAP[key], Boolean(settings[key]));
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* storage blocked — settings still apply for this session */
    }
  }, [settings]);

  const set = useCallback<A11yContextValue['set']>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggle = useCallback<A11yContextValue['toggle']>((key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const stepScale = useCallback((delta: number) => {
    setSettings((prev) => ({
      ...prev,
      scale: Math.min(1.5, Math.max(0.9, Number((prev.scale + delta).toFixed(2)))),
    }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  const value = useMemo(
    () => ({ settings, set, toggle, stepScale, reset }),
    [settings, set, toggle, stepScale, reset],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y(): A11yContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used inside <A11yProvider>');
  return ctx;
}

/** Read-aloud support, used by the accessibility panel. */
export function useReadAloud() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (selector = '#main') => {
      if (!supported) return false;
      if (speaking) {
        stop();
        return true;
      }
      const el = document.querySelector<HTMLElement>(selector) ?? document.body;
      const text = el.innerText.replace(/\s+/g, ' ').slice(0, 12000);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = document.documentElement.lang || 'en';
      utterance.rate = 1;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
      return true;
    },
    [supported, speaking, stop],
  );

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  return { supported, speaking, speak, stop } as const;
}

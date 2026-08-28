import { useEffect, useRef, useState } from 'react';
import {
  Accessibility, Contrast, Droplet, Link2, MousePointer2, RotateCcw, Volume2, Wind, X,
} from 'lucide-react';
import { useA11y, useReadAloud } from '@/lib/a11y';

/** A11y-panel switch. Real checkbox underneath — keyboard and AT friendly. */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0"
      />
      <span className="absolute inset-0 rounded-full border border-white/15 bg-white/10 transition-colors peer-checked:border-transparent peer-checked:bg-digicon-primary peer-focus-visible:ring-2 peer-focus-visible:ring-digicon-info peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-digicon-ink" />
      <span className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5" />
    </label>
  );
}

function Row({
  icon,
  name,
  hint,
  children,
}: {
  icon: React.ReactNode;
  name: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="a11y-row">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 text-digicon-info" aria-hidden="true">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-white/45">{hint}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Accessibility toolkit.
 *
 * A visitor-facing complement to the OS-level preferences the stylesheet
 * already honours — some people browse on a shared or locked-down device where
 * they cannot change system settings, so the controls live in the page too.
 * Choices persist per-device via localStorage.
 */
export function AccessibilityTools() {
  const { settings, toggle, stepScale, reset } = useA11y();
  const { supported, speaking, speak } = useReadAloud();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Anywhere in the app can request the panel (the mobile "More" panel does,
  // since the floating launcher is desktop-only).
  useEffect(() => {
    const onRequest = () => setOpen(true);
    window.addEventListener('digicon:open-a11y', onRequest);
    return () => window.removeEventListener('digicon:open-a11y', onRequest);
  }, []);

  // Escape closes and returns focus to the launcher
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        fabRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // move focus into the panel when it opens
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('button, input')?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="a11y-fab"
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="Accessibility options"
        title="Accessibility options"
        onClick={() => setOpen((v) => !v)}
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>

      <div
        id="a11y-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Accessibility options"
        className={`a11y-panel metal ${open ? 'a11y-panel--open' : ''}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <Accessibility className="h-4 w-4 text-digicon-info" aria-hidden="true" />
            Accessibility
          </h2>
          <button
            type="button"
            onClick={() => { setOpen(false); fabRef.current?.focus(); }}
            aria-label="Close accessibility options"
            className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-white/45">
          These settings are saved on this device only. DigiCon also follows your
          system preferences for motion, contrast and transparency automatically.
        </p>

        <Row icon={<span className="text-sm font-bold">Aa</span>} name="Text size" hint={`Currently ${Math.round(settings.scale * 100)}%`}>
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={() => stepScale(-0.1)}
              disabled={settings.scale <= 0.9}
              aria-label="Decrease text size"
              className="h-9 w-9 rounded-glass-sm border border-white/12 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              A−
            </button>
            <button
              type="button"
              onClick={() => stepScale(0.1)}
              disabled={settings.scale >= 1.5}
              aria-label="Increase text size"
              className="h-9 w-9 rounded-glass-sm border border-white/12 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-30"
            >
              A+
            </button>
          </div>
        </Row>

        <Row icon={<Contrast className="h-4 w-4" />} name="High contrast" hint="Maximum legibility">
          <Switch checked={settings.contrast} onChange={() => toggle('contrast')} label="High contrast" />
        </Row>

        <Row icon={<Droplet className="h-4 w-4" />} name="Grayscale" hint="Reduce colour stimulation">
          <Switch checked={settings.grayscale} onChange={() => toggle('grayscale')} label="Grayscale" />
        </Row>

        <Row icon={<Link2 className="h-4 w-4" />} name="Highlight links" hint="Underline every link">
          <Switch checked={settings.underlineLinks} onChange={() => toggle('underlineLinks')} label="Highlight links" />
        </Row>

        <Row icon={<MousePointer2 className="h-4 w-4" />} name="Large cursor" hint="Easier pointer tracking">
          <Switch checked={settings.largeCursor} onChange={() => toggle('largeCursor')} label="Large cursor" />
        </Row>

        <Row icon={<Wind className="h-4 w-4" />} name="Calm mode" hint="Stop all animation and video">
          <Switch checked={settings.calm} onChange={() => toggle('calm')} label="Calm mode" />
        </Row>

        {supported && (
          <Row icon={<Volume2 className="h-4 w-4" />} name="Read aloud" hint="Speak the page content">
            <button
              type="button"
              onClick={() => speak('#main')}
              aria-pressed={speaking}
              className="flex-shrink-0 rounded-full border border-digicon-info/40 bg-digicon-info/10 px-4 py-2 text-xs font-semibold text-digicon-info transition-colors hover:bg-digicon-info/20"
            >
              {speaking ? 'Stop' : 'Listen'}
            </button>
          </Row>
        )}

        <Row icon={<RotateCcw className="h-4 w-4" />} name="Reset" hint="Back to defaults">
          <button
            type="button"
            onClick={reset}
            className="flex-shrink-0 rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Reset all
          </button>
        </Row>
      </div>
    </>
  );
}

/** Keyboard users land on this first; it jumps past the navigation. */
export function SkipLink({ target = '#main' }: { target?: string }) {
  return (
    <a href={target} className="skip-link">
      Skip to main content
    </a>
  );
}

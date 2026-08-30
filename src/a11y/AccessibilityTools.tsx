import { useState } from 'react';
import {
  Accessibility,
  Check,
  Eye,
  EyeOff,
  Minus,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useA11y, useReadAloud } from '@/lib/a11y';

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to main content
    </a>
  );
}

export function AccessibilityTools() {
  const [open, setOpen] = useState(false);
  const { settings, toggle, stepScale, reset } = useA11y();
  const { supported, speaking, speak, stop } = useReadAloud();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div
          id="accessibility-panel"
          role="dialog"
          aria-label="Accessibility options"
          className="mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-black/95 p-4 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Accessibility</h2>
              <p className="text-xs text-white/50">
                Adjust DigiCon to your needs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close accessibility options"
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-sm">Text size</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => stepScale(-0.1)}
                  aria-label="Decrease text size"
                  className="rounded-lg p-2 hover:bg-white/10"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>

                <span className="w-12 text-center text-xs text-white/60">
                  {Math.round(settings.scale * 100)}%
                </span>

                <button
                  type="button"
                  onClick={() => stepScale(0.1)}
                  aria-label="Increase text size"
                  className="rounded-lg p-2 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <OptionButton
              label="High contrast"
              active={settings.contrast}
              onClick={() => toggle('contrast')}
            />

            <OptionButton
              label="Grayscale"
              active={settings.grayscale}
              onClick={() => toggle('grayscale')}
            />

            <OptionButton
              label="Underline links"
              active={settings.underlineLinks}
              onClick={() => toggle('underlineLinks')}
            />

            <OptionButton
              label="Large cursor"
              active={settings.largeCursor}
              onClick={() => toggle('largeCursor')}
            />

            <OptionButton
              label="Calm mode"
              active={settings.calm}
              onClick={() => toggle('calm')}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {supported ? (
              <button
                type="button"
                onClick={() => (speaking ? stop() : speak())}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/15"
              >
                {speaking ? (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
                {speaking ? 'Stop reading' : 'Read page'}
              </button>
            ) : (
              <span className="flex items-center justify-center rounded-xl bg-white/5 px-3 py-2 text-center text-xs text-white/40">
                Read-aloud unavailable
              </span>
            )}

            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/15"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-controls="accessibility-panel"
        aria-label={
          open
            ? 'Close accessibility options'
            : 'Open accessibility options'
        }
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/90 text-white shadow-xl backdrop-blur-xl hover:bg-white/10"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function OptionButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10"
    >
      <span className="flex items-center gap-2">
        {active ? (
          <Eye className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeOff
            className="h-4 w-4 text-white/40"
            aria-hidden="true"
          />
        )}
        {label}
      </span>

      <span className={active ? 'text-emerald-300' : 'text-white/30'}>
        {active ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          'Off'
        )}
      </span>
    </button>
  );
}

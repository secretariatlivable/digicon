import {
  Accessibility,
  Minus,
  Pause,
  Plus,
  RotateCcw,
  Type,
  Volume2,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useA11y, useReadAloud } from '@/lib/a11y';

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-digicon-info"
    >
      {children}
    </button>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}

export function AccessibilityTools() {
  const { settings, toggle, stepScale, reset } = useA11y();
  const { supported, speaking, speak, stop } = useReadAloud();
  const [open, setOpen] = useState(false);

  return (
    <aside
      className="fixed bottom-20 right-4 z-40 sm:bottom-6"
      aria-label="Accessibility tools"
    >
      {open && (
        <div className="mb-3 w-72 rounded-2xl border border-white/10 bg-black/90 p-4 text-white shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility
                className="h-4 w-4 text-digicon-info"
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold">Accessibility</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close accessibility tools"
              className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-medium text-white/50">Text size</p>
              <div className="flex items-center gap-2">
                <ToolButton
                  label="Decrease text size"
                  onClick={() => stepScale(-0.05)}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </ToolButton>
                <span className="min-w-16 text-center text-xs font-semibold">
                  {Math.round(settings.scale * 100)}%
                </span>
                <ToolButton
                  label="Increase text size"
                  onClick={() => stepScale(0.05)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </ToolButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => toggle('contrast')}
                className={`rounded-xl border px-3 py-2 text-left text-xs ${
                  settings.contrast
                    ? 'border-digicon-info/50 bg-digicon-info/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/60'
                }`}
              >
                High contrast
              </button>
              <button
                type="button"
                onClick={() => toggle('grayscale')}
                className={`rounded-xl border px-3 py-2 text-left text-xs ${
                  settings.grayscale
                    ? 'border-digicon-info/50 bg-digicon-info/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/60'
                }`}
              >
                Grayscale
              </button>
              <button
                type="button"
                onClick={() => toggle('underlineLinks')}
                className={`rounded-xl border px-3 py-2 text-left text-xs ${
                  settings.underlineLinks
                    ? 'border-digicon-info/50 bg-digicon-info/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/60'
                }`}
              >
                <Type className="mr-1 inline h-3 w-3" aria-hidden="true" />
                Links
              </button>
              <button
                type="button"
                onClick={() => toggle('largeCursor')}
                className={`rounded-xl border px-3 py-2 text-left text-xs ${
                  settings.largeCursor
                    ? 'border-digicon-info/50 bg-digicon-info/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/60'
                }`}
              >
                Large cursor
              </button>
              <button
                type="button"
                onClick={() => toggle('calm')}
                className={`col-span-2 rounded-xl border px-3 py-2 text-left text-xs ${
                  settings.calm
                    ? 'border-digicon-info/50 bg-digicon-info/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/60'
                }`}
              >
                {settings.calm ? 'Calm mode on' : 'Calm mode off'}
              </button>
            </div>

            {supported && (
              <button
                type="button"
                onClick={() => (speaking ? stop() : void speak())}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white"
              >
                <span>{speaking ? 'Stop reading' : 'Read page aloud'}</span>
                {speaking ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/[0.06] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset preferences
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={
          open ? 'Close accessibility tools' : 'Open accessibility tools'
        }
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white shadow-xl backdrop-blur-xl transition-transform hover:-translate-y-0.5 hover:bg-black"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>
    </aside>
  );
}

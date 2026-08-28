import { Download, Share, X } from 'lucide-react';
import { useInstallPrompt } from '@/lib/pwa';

/**
 * Home-screen installation bar.
 *
 * Chromium hands us a real install prompt, so the bar offers a one-tap Install.
 * iOS never does, so instead of a button that would silently do nothing, iOS
 * visitors get the exact Share → "Add to Home Screen" steps. Dismissals are
 * remembered for two weeks so the bar never becomes nagware.
 */
export function InstallBar() {
  const { visible, canPrompt, needsManualSteps, install, dismiss } = useInstallPrompt();

  if (!visible) return null;

  return (
    <aside
      className={`install-bar metal ${visible ? 'install-bar--open' : ''}`}
      role="region"
      aria-label="Install DigiCon on your device"
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-glass-md bg-digicon-info/12 ring-1 ring-digicon-info/35"
        aria-hidden="true"
      >
        {needsManualSteps ? (
          <Share className="h-4 w-4 text-digicon-info" />
        ) : (
          <Download className="h-4 w-4 text-digicon-info" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">Keep DigiCon one tap away</p>
        {needsManualSteps ? (
          <p className="mt-0.5 text-xs leading-relaxed text-white/55">
            Tap <span className="font-semibold text-white/80">Share</span>, then{' '}
            <span className="font-semibold text-white/80">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-white/55">
            Install the app — works offline, opens instantly.
          </p>
        )}
      </div>

      {canPrompt && (
        <button
          type="button"
          onClick={() => void install()}
          className="flex-shrink-0 rounded-full bg-digicon-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-digicon-primary/30 transition-transform hover:-translate-y-0.5"
        >
          Install
        </button>
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="flex-shrink-0 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </aside>
  );
}

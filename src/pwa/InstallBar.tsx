import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '@/lib/pwa';

export function InstallBar() {
  const {
    visible,
    canPrompt,
    needsManualSteps,
    install,
    dismiss,
  } = useInstallPrompt();

  if (!visible) return null;

  return (
    <aside
      aria-label="Install DigiCon"
      className="fixed bottom-4 left-4 z-40 max-w-sm rounded-2xl border border-white/15 bg-black/95 p-4 text-white shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-white/10 p-2">
          <Download className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">
            Keep DigiCon close
          </h2>

          {canPrompt ? (
            <p className="mt-1 text-xs leading-relaxed text-white/60">
              Install DigiCon for faster access to your cards and network.
            </p>
          ) : needsManualSteps ? (
            <p className="mt-1 text-xs leading-relaxed text-white/60">
              On iPhone or iPad, tap Share, then choose
              “Add to Home Screen”.
            </p>
          ) : null}

          {canPrompt && (
            <button
              type="button"
              onClick={() => void install()}
              className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90"
            >
              Install DigiCon
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

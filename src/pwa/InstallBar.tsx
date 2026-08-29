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
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/95 p-4 text-white shadow-2xl backdrop-blur md:bottom-5"
      aria-label="Install DigiCon"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-digicon-primary/15 text-digicon-info">
          <Download className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">Keep DigiCon ready</p>
          <p className="mt-1 text-sm text-white/55">
            {canPrompt
              ? 'Install DigiCon for quick access to your professional identity.'
              : needsManualSteps
                ? 'On iPhone or iPad, use Share → Add to Home Screen.'
                : 'Add DigiCon to your device for quick access.'}
          </p>

          {canPrompt && (
            <button
              type="button"
              onClick={() => void install()}
              className="mt-3 rounded-full bg-digicon-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Install DigiCon
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

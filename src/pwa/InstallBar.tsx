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
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/90 p-4 text-white shadow-2xl backdrop-blur-xl"
      aria-label="Install DigiCon"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Download className="h-4 w-4 text-digicon-info" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Keep DigiCon close.</p>
          {needsManualSteps ? (
            <p className="mt-1 text-xs leading-relaxed text-white/60">
              On iPhone or iPad, use Share → Add to Home Screen to keep your
              professional identity ready to share.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-white/60">
              Add DigiCon to your home screen for faster sharing and easier
              access to your network.
            </p>
          )}

          {canPrompt && (
            <button
              type="button"
              onClick={() => void install()}
              className="mt-3 rounded-full bg-digicon-primary px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
            >
              Install DigiCon
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

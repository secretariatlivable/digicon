import type { DigiConPlanId } from "@/config/paypalPlans";
import {
  Check,
  LockKeyhole,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradeRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  suggestedPlan?: Exclude<DigiConPlanId, "startup">;
}

export function UpgradeRequiredDialog({
  open,
  onClose,
  title,
  message,
  suggestedPlan = "starter",
}: UpgradeRequiredDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-dialog-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121214] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/10">
            <LockKeyhole className="h-5 w-5 text-fuchsia-300" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2
          id="upgrade-dialog-title"
          className="mt-5 text-xl font-bold text-white"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/60">
          {message}
        </p>

        <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          {[
            "Keep your existing digital cards",
            "Continue sharing through QR and links",
            "Unlock additional paid features",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 text-sm text-white/70"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/settings?upgrade=${suggestedPlan}`}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-white/90"
            onClick={onClose}
          >
            Upgrade to {suggestedPlan}
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/5"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

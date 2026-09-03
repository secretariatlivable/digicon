// Import React state for tracking the wallet operation currently in progress.
import { useState } from "react";
// Import the query hook used to load the user's DigiCon cards.
import { useQuery } from "@tanstack/react-query";
// Import wallet and download icons used by the export controls.
import { Apple, Download, Smartphone, Wallet as WalletIcon } from "lucide-react";
// Import toast notifications for successful and failed wallet operations.
import { toast } from "sonner";
// Import shared DigiCon loading, error, heading, and upgrade components.
import { ErrorState, LoadingState, SectionHeading, UpgradeGate } from "@/components/kit";
// Import the shared button component and its class generator.
import { Button, buttonVariants } from "@/components/ui/button";
// Import the existing authenticated backend API helper.
import { apiGet } from "@/lib/api";
// Import the real Supabase wallet Edge Function integrations.
import { addToAppleWallet, addToGoogleWallet } from "@/lib/wallet";
// Import the DigiCon authentication state.
import { useAuth } from "@/lib/session";
// Import the card and export response types.
import type { CardExport, DigitalCard } from "@/types";

// Export the wallet and card export page.
export default function WalletExport() {
  // Read the server-backed paid-plan state.
  const { isPaid } = useAuth();
  // Track which wallet platform is currently being generated.
  const [walletAction, setWalletAction] = useState<"apple" | "google" | null>(null);
  // Load the user's DigiCon cards.
  const cards = useQuery({
    queryKey: ["cards"],
    queryFn: () => apiGet<DigitalCard[]>("/cards"),
  });
  // Use the first available card as the wallet export target.
  const card = cards.data?.[0];
  // Load existing card export information for the selected card.
  const exportData = useQuery({
    queryKey: ["card-export", card?.id],
    queryFn: () => apiGet<CardExport>(`/cards/${card?.id}/export`),
    enabled: isPaid && Boolean(card?.id),
    retry: false,
  });

  // Start the requested wallet export through the corresponding Supabase Edge Function.
  const handleWalletExport = async (platform: "apple" | "google") => {
    // Prevent an export attempt when no card is available.
    if (!card?.id) {
      // Inform the user that there is no exportable card.
      toast.error("No active DigiCon card is available.");
      // Stop the operation.
      return;
    }

    // Mark the selected wallet platform as busy.
    setWalletAction(platform);

    try {
      // Generate and download the Apple Wallet pass when Apple is selected.
      if (platform === "apple") {
        // Invoke the authenticated Apple Wallet Edge Function.
        await addToAppleWallet(card.id);
        // Confirm that the pass has been generated.
        toast.success("Your Apple Wallet pass is ready to add.");
      } else {
        // Invoke the authenticated Google Wallet Edge Function.
        await addToGoogleWallet(card.id);
      }
    } catch (cause) {
      // Display a safe human-readable error.
      toast.error(
        cause instanceof Error ? cause.message : "Wallet export failed.",
      );
    } finally {
      // Clear the busy state after completion or failure.
      setWalletAction(null);
    }
  };

  // Display the upgrade gate for users without a paid entitlement.
  if (!isPaid) {
    // Render the existing DigiCon upgrade experience.
    return (
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Identity"
          title="Wallet & export"
          testId="wallet-heading"
        />
        <UpgradeGate
          feature="Wallet & card export"
          description="Download your card as an image, keep a vCard copy, and add your DigiCon identity to Apple Wallet or Google Wallet."
          testId="wallet-upgrade-gate"
        />
      </div>
    );
  }

  // Render the authenticated wallet export workspace.
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SectionHeading
        eyebrow="Identity"
        title="Wallet & export"
        testId="wallet-heading"
      />

      {cards.isLoading && <LoadingState testId="wallet-loading" />}

      {exportData.isError && (
        <ErrorState
          label="Export isn't available for this card."
          testId="wallet-error"
        />
      )}

      {card && (
        <section
          className="glass space-y-4 rounded-xl p-5"
          data-testid="wallet-panel"
        >
          <div className="flex items-center gap-3">
            <img
              src={`/api/public/cards/${card.slug}/qr.png`}
              alt="Card QR code"
              className="h-24 w-24 rounded-lg border border-border bg-white p-1.5"
              data-testid="wallet-qr"
            />

            <div>
              <p className="label-caps">Exporting</p>
              <p className="font-heading text-lg font-bold">
                {card.label} · {card.name}
              </p>
              <p className="dense text-xs text-muted-foreground">
                /c/{card.slug}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href={`/api/public/cards/${card.slug}/qr.png`}
              download
              className={buttonVariants({ variant: "outline" })}
              data-testid="wallet-download-qr"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Download QR image
            </a>

            <a
              href={`/api/public/cards/${card.slug}/vcard`}
              className={buttonVariants({ variant: "outline" })}
              data-testid="wallet-download-vcard"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Download vCard
            </a>

            <Button
              variant="outline"
              onClick={() => void handleWalletExport("apple")}
              disabled={walletAction !== null}
              data-testid="wallet-apple"
              aria-busy={walletAction === "apple"}
            >
              <Apple className="mr-2 h-4 w-4" aria-hidden />
              {walletAction === "apple"
                ? "Preparing Apple Wallet…"
                : "Add to Apple Wallet"}
            </Button>

            <Button
              variant="outline"
              onClick={() => void handleWalletExport("google")}
              disabled={walletAction !== null}
              data-testid="wallet-google"
              aria-busy={walletAction === "google"}
            >
              <Smartphone className="mr-2 h-4 w-4" aria-hidden />
              {walletAction === "google"
                ? "Opening Google Wallet…"
                : "Add to Google Wallet"}
            </Button>
          </div>

          <p className="dense flex items-start gap-2 text-xs text-muted-foreground">
            <WalletIcon
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"
              aria-hidden
            />
            {exportData.data?.note ??
              "Wallet passes are generated securely by DigiCon's Supabase Edge Functions after authentication, card ownership, and paid entitlement checks."}
          </p>
        </section>
      )}
    </div>
  );
}

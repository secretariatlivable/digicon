import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Apple, Download, Smartphone, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, LoadingState, SectionHeading, UpgradeGate } from "@/components/kit";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { addToAppleWallet, addToGoogleWallet } from "@/lib/wallet";
import { useAuth } from "@/lib/session";
import type { CardExport, DigitalCard } from "@/types";

export default function WalletExport() {
  const { isPaid } = useAuth();
  const [walletAction, setWalletAction] = useState<"apple" | "google" | null>(null);
  const cards = useQuery({ queryKey: ["cards"], queryFn: () => apiGet<DigitalCard[]>("/cards") });
  const card = cards.data?.[0];
  const exportData = useQuery({
    queryKey: ["card-export", card?.id],
    queryFn: () => apiGet<CardExport>(`/cards/${card?.id}/export`),
    enabled: isPaid && Boolean(card?.id),
    retry: false,
  });

  const handleWalletExport = async (platform: "apple" | "google") => {
    if (!card?.id) {
      toast.error("No active DigiCon card is available to export.");
      return;
    }

    setWalletAction(platform);
    try {
      if (platform === "apple") {
        await addToAppleWallet(card.id);
        toast.success("Your Apple Wallet pass is ready to add.");
      } else {
        await addToGoogleWallet(card.id);
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Wallet export failed.");
    } finally {
      setWalletAction(null);
    }
  };

  if (!isPaid) {
    return (
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="Identity" title="Wallet & export" testId="wallet-heading" />
        <UpgradeGate
          feature="Wallet & card export"
          description="Download your card as an image, keep a vCard copy, and add your DigiCon identity to Apple Wallet or Google Wallet."
          testId="wallet-upgrade-gate"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SectionHeading eyebrow="Identity" title="Wallet & export" testId="wallet-heading" />
      {cards.isLoading && <LoadingState testId="wallet-loading" />}
      {exportData.isError && <ErrorState label="Export isn't available for this card." testId="wallet-error" />}

      {card && (
        <section className="glass space-y-4 rounded-xl p-5" data-testid="wallet-panel">
          <div className="flex items-center gap-3">
            <img
              src={`/api/public/cards/${card.slug}/qr.png`}
              alt="Card QR code"
              className="h-24 w-24 rounded-lg border border-border bg-white p-1.5"
              data-testid="wallet-qr"
            />
            <div>
              <p className="label-caps">Exporting</p>
              <p className="font-heading text-lg font-bold">{card.label} · {card.name}</p>
              <p className="dense text-xs text-muted-foreground">/c/{card.slug}</p>
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
              {walletAction === "apple" ? "Preparing Apple Wallet…" : "Add to Apple Wallet"}
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleWalletExport("google")}
              disabled={walletAction !== null}
              data-testid="wallet-google"
              aria-busy={walletAction === "google"}
            >
              <Smartphone className="mr-2 h-4 w-4" aria-hidden />
              {walletAction === "google" ? "Opening Google Wallet…" : "Add to Google Wallet"}
            </Button>
          </div>

          <p className="dense flex items-start gap-2 text-xs text-muted-foreground">
            <WalletIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
            {exportData.data?.note ??
              "Wallet passes are generated securely by DigiCon's Supabase Edge Functions after authentication, card ownership, and paid entitlement checks."}
          </p>
        </section>
      )}
    </div>
  );
}

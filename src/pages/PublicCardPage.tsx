import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Share2,
  UserPlus,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase, type PublicBusinessCard } from "@/lib/supabase";
import { GlassButton, GlassCard, GlassInput, GlassLabel, Spinner } from "@/components/ui/GlassCard";
import { DigiConLogo } from "@/components/brand/DigiConLogo";
import { DigiConCard } from "@/components/card/DigiConCard";

const PUBLIC_ORIGIN =
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim().replace(/\/$/, "") ||
  "https://digicon.cards";

function publicCardUrl(id: string) {
  return `${PUBLIC_ORIGIN}/c/${encodeURIComponent(id)}`;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z\d+\-.]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function escapeVCard(value: string | null | undefined) {
  return (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function PublicCardPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<PublicBusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [contact, setContact] = useState({ full_name: "", email: "", phone: "" });
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cardId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      /*
       * Reads the `public_business_cards` view, not the base table.
       *
       * `business_cards` has no policy for the `anon` role, so this page
       * previously returned "Card cannot be found" to every visitor who was
       * not the card owner. The view exposes only presentation columns and
       * never leaks `user_id` or the share/edit counters.
       */
      const { data, error: dbError } = await supabase
        .from("public_business_cards")
        .select("*")
        .eq("id", cardId)
        .maybeSingle();

      if (cancelled) return;

      if (dbError) {
        console.error("Public DigiCon card lookup failed:", dbError);
        /*
         * Distinguish a genuinely missing card from a backend that has not had
         * its migrations applied. `public_business_cards` is created in
         * 20260828120000_fix_rls_billing_and_counters.sql; without it Postgres
         * reports an undefined table (42P01) and the old code showed
         * "this card may have been deactivated" — sending you to look at the
         * card when the problem is the database.
         */
        const undefinedTable =
          dbError.code === "42P01" ||
          /relation .* does not exist/i.test(dbError.message ?? "");
        setError(
          undefinedTable
            ? "This DigiCon deployment is not finished setting up. The public card view is missing — run `supabase db push`."
            : "We could not load this card right now.",
        );
        setCard(null);
      } else if (!data) {
        setNotFound(true);
        setCard(null);
      } else {
        setCard(data as PublicBusinessCard);
      }

      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const downloadVCard = () => {
    if (!card) return;

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCard(card.full_name)}`,
      `TITLE:${escapeVCard(card.job_title)}`,
      `ORG:${escapeVCard(card.company)}`,
      card.phone ? `TEL;TYPE=CELL:${escapeVCard(card.phone)}` : "",
      card.email ? `EMAIL:${escapeVCard(card.email)}` : "",
      card.website ? `URL:${escapeVCard(normalizeWebsite(card.website))}` : "",
      card.address ? `ADR;TYPE=WORK:;;${escapeVCard(card.address)}` : "",
      `URL;TYPE=DIGICON:${publicCardUrl(card.id)}`,
      "END:VCARD",
    ].filter(Boolean);

    const blob = new Blob([lines.join("\r\n") + "\r\n"], {
      type: "text/vcard;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${card.full_name || "digicon-contact"}.vcf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Firefox aborts the download if the object URL is revoked synchronously.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const shareCard = async () => {
    if (!card) return;

    const url = publicCardUrl(card.id);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card.full_name} | DigiCon`,
          text: `Connect with ${card.full_name} on DigiCon.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1800);
      }
    } catch {
      // User cancellation is not an error.
    }
  };

  const saveContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!card || !contact.full_name.trim() || !contact.email.trim()) return;

    setSavingContact(true);

    try {
      /*
       * Anonymous visitors have no INSERT grant on `contacts` — a direct
       * insert failed RLS, and granting one would let anyone write arbitrary
       * rows against any user_id. `capture_public_contact` is a SECURITY
       * DEFINER function that derives the owner from the card, validates and
       * length-caps every field, and rate limits per card.
       */
      const { error: rpcError } = await supabase.rpc("capture_public_contact", {
        p_card_id: card.id,
        p_full_name: contact.full_name.trim(),
        p_email: contact.email.trim(),
        p_phone: contact.phone.trim(),
      });

      if (rpcError) throw rpcError;

      setContact({ full_name: "", email: "", phone: "" });
      setError(null);
      setSaved(true);
    } catch (cause) {
      console.error("DigiCon contact capture failed:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save your contact details.",
      );
    } finally {
      setSavingContact(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner className="h-9 w-9" />
      </main>
    );
  }

  if (notFound || !card) {
    return (
      <main id="main" className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="metal w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-ink">This card isn&rsquo;t available</h1>
          <p className="mt-3 text-ink-3">
            It may have been deactivated, or the link may be incomplete.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <GlassButton>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Create your own DigiCon
            </GlassButton>
          </Link>
        </div>
      </main>
    );
  }

  const url = publicCardUrl(card.id);

  return (
    <main id="main" className="relative min-h-screen bg-surface px-4 py-8 text-ink">
      {/* ambient wash picked up from the card owner's own colour */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-[130px]"
          style={{ backgroundColor: `${card.card_color || "#007AFF"}33` }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" aria-label="DigiCon home">
            <DigiConLogo size="sm" />
          </Link>
          <GlassButton size="sm" variant="ghost" onClick={() => void shareCard()}>
            {saved ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
            {saved ? "Copied" : "Share"}
          </GlassButton>
        </div>

        <div className="mx-auto max-w-md">
          <DigiConCard
            card={card}
            shareUrl={url}
            variant="live"
            footer={
              <div className="grid grid-cols-2 gap-2">
                <GlassButton onClick={downloadVCard}>
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Save my card
                </GlassButton>
                <GlassButton variant="ghost" onClick={() => void shareCard()}>
                  <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  Pass it on
                </GlassButton>
              </div>
            }
          />

          {/* The reciprocal half — offered after the card, never as a gate */}
          <GlassCard variant="regular" className="mt-4 p-6">
            <h2 className="text-lg font-semibold text-ink">Want to share yours?</h2>
            <p className="mt-1.5 text-sm text-ink-3">
              Optional, and no DigiCon account needed. {card.full_name.split(" ")[0]}{" "}
              will remember where this started.
            </p>

            <form onSubmit={saveContact} className="mt-5 space-y-4">
              <div>
                <GlassLabel htmlFor="public-name">Your name *</GlassLabel>
                <GlassInput id="public-name" required autoComplete="name" value={contact.full_name} onChange={(e) => setContact({ ...contact, full_name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <GlassLabel htmlFor="public-email">Your email *</GlassLabel>
                <GlassInput id="public-email" type="email" required autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <GlassLabel htmlFor="public-phone">Phone</GlassLabel>
                <GlassInput id="public-phone" type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+63..." />
              </div>

              {error && <p role="alert" className="text-sm text-digicon-error">{error}</p>}
              {saved && (
                <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-digicon-eco">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  You&rsquo;re connected.
                </p>
              )}

              <GlassButton type="submit" className="w-full" disabled={savingContact}>
                {savingContact ? <Spinner className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                {savingContact ? "Saving…" : "Send my details"}
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        <Link
            to="/"
            className="metal metal-sheen mt-6 flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
          >
            <DigiConLogo size="sm" showText={false} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">
                Create your own DigiCon
              </span>
              <span className="block text-xs text-ink-3">
                Turn introductions into relationships.
              </span>
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-digicon-info" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
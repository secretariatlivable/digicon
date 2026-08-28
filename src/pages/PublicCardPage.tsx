import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Share2,
  UserPlus,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase, type PublicBusinessCard } from "@/lib/supabase";
import { GlassButton, GlassCard, GlassInput, GlassLabel, Spinner } from "@/components/ui/GlassCard";

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
        setError("We could not load this card right now.");
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
      <main className="flex min-h-screen items-center justify-center bg-black">
        <Spinner className="h-9 w-9" />
      </main>
    );
  }

  if (notFound || !card) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4">
        <GlassCard variant="thick" className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Card cannot be found</h1>
          <p className="mt-3 text-white/50">
            This DigiCon card may have been deleted, deactivated, or the link is invalid.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <GlassButton><ArrowLeft className="mr-2 h-4 w-4" />Back to DigiCon</GlassButton>
          </Link>
        </GlassCard>
      </main>
    );
  }

  const url = publicCardUrl(card.id);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/" className="text-sm text-white/50 hover:text-white">
            DigiCon
          </Link>
          <GlassButton size="sm" variant="ghost" onClick={() => void shareCard()}>
            {saved ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
            {saved ? "Copied" : "Share"}
          </GlassButton>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div
            className="overflow-hidden rounded-[inherit]"
            style={{
              background: `linear-gradient(135deg, ${card.card_color || "#007AFF"}, ${card.accent_color || "#5856D6"})`,
            }}
          >
            <GlassCard variant="thick" className="overflow-hidden bg-transparent">
            <div className="p-7 sm:p-10">
              <div className="flex justify-end">
                {card.photo_url ? (
                  <img src={card.photo_url} alt={card.full_name} className="h-28 w-28 rounded-full object-cover ring-2 ring-white/50" />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/15 text-4xl font-bold">
                    {card.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <p className="mt-10 text-xs uppercase tracking-[.25em] text-white/50">DigiCon Digital Card</p>
              <h1 className="mt-2 text-4xl font-bold">{card.full_name}</h1>
              {card.job_title && <p className="mt-2 text-lg text-white/80">{card.job_title}</p>}
              {card.company && <p className="text-white/60">{card.company}</p>}

              <div className="mt-8 space-y-3">
                {card.email && <a className="flex items-center gap-3 text-white/80 hover:text-white" href={`mailto:${card.email}`}><Mail className="h-5 w-5" />{card.email}</a>}
                {card.phone && <a className="flex items-center gap-3 text-white/80 hover:text-white" href={`tel:${card.phone}`}><Phone className="h-5 w-5" />{card.phone}</a>}
                {card.website && <a className="flex items-center gap-3 text-white/80 hover:text-white" href={normalizeWebsite(card.website)} target="_blank" rel="noreferrer"><ExternalLink className="h-5 w-5" />Website</a>}
                {card.address && <p className="flex items-center gap-3 text-white/70"><MapPin className="h-5 w-5" />{card.address}</p>}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <GlassButton onClick={downloadVCard}><UserPlus className="mr-2 h-4 w-4" />Save contact</GlassButton>
                <GlassButton variant="ghost" onClick={() => void shareCard()}><Share2 className="mr-2 h-4 w-4" />Share card</GlassButton>
              </div>
            </div>
            </GlassCard>
          </div>

          <GlassCard variant="regular" className="p-6">
            <div className="flex justify-center rounded-3xl bg-white p-5">
              <QRCodeSVG value={url} size={220} level="H" includeMargin />
            </div>

            <h2 className="mt-6 text-xl font-semibold">Connect with {card.full_name}</h2>
            <p className="mt-2 text-sm text-white/50">
              Scan this card or send your details to the card owner.
            </p>

            <form onSubmit={saveContact} className="mt-6 space-y-4">
              <div>
                <GlassLabel htmlFor="public-name">Your name *</GlassLabel>
                <GlassInput id="public-name" required value={contact.full_name} onChange={(e) => setContact({ ...contact, full_name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <GlassLabel htmlFor="public-email">Your email *</GlassLabel>
                <GlassInput id="public-email" type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <GlassLabel htmlFor="public-phone">Phone</GlassLabel>
                <GlassInput id="public-phone" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+63..." />
              </div>

              {error && <p className="text-sm text-digicon-error">{error}</p>}
              {saved && <p className="flex items-center gap-2 text-sm text-digicon-eco"><Check className="h-4 w-4" />Saved successfully.</p>}

              <GlassButton type="submit" className="w-full" disabled={savingContact}>
                {savingContact ? <Spinner className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                {savingContact ? "Saving…" : "Send my details"}
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
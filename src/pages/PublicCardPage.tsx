import { useEffect, useMemo, useState } from "react";
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

import { supabase, type BusinessCard } from "@/lib/supabase";
import {
  GlassButton,
  GlassCard,
  GlassInput,
  GlassLabel,
  Spinner,
} from "@/components/ui/GlassCard";

const PUBLIC_ORIGIN =
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, "") || "https://digicon.cards";

function publicCardUrl(cardId: string): string {
  return `${PUBLIC_ORIGIN}/c/${encodeURIComponent(cardId)}`;
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z\d+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

function escapeVCard(value: string | null | undefined): string {
  return (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function PublicCardPage() {
  const { cardId } = useParams<{ cardId: string }>();

  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contact, setContact] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const cardUrl = useMemo(
    () => (cardId ? publicCardUrl(cardId) : ""),
    [cardId],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCard() {
      if (!cardId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("business_cards")
        .select("*")
        .eq("id", cardId)
        .eq("is_active", true)
        .maybeSingle();

      if (cancelled) return;

      if (queryError) {
        console.error("Public DigiCon card lookup failed:", queryError);
        setError("We could not load this card right now.");
        setCard(null);
      } else if (!data) {
        setNotFound(true);
        setCard(null);
      } else {
        setCard(data as BusinessCard);
      }

      setLoading(false);
    }

    void loadCard();

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
      card.job_title ? `TITLE:${escapeVCard(card.job_title)}` : "",
      card.company ? `ORG:${escapeVCard(card.company)}` : "",
      card.phone ? `TEL;TYPE=CELL:${escapeVCard(card.phone)}` : "",
      card.email ? `EMAIL:${escapeVCard(card.email)}` : "",
      card.website
        ? `URL:${escapeVCard(normalizeWebsite(card.website))}`
        : "",
      card.address ? `ADR;TYPE=WORK:;;${escapeVCard(card.address)}` : "",
      `URL;TYPE=DIGICON:${cardUrl}`,
      "END:VCARD",
    ].filter(Boolean);

    const blob = new Blob([`${lines.join("\r\n")}\r\n`], {
      type: "text/vcard;charset=utf-8",
    });

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${(card.full_name || "digicon-contact")
      .replace(/[^a-z0-9_-]+/gi, "_")
      .slice(0, 80)}.vcf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const shareCard = async () => {
    if (!card) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${card.full_name} | DigiCon`,
          text: `Connect with ${card.full_name} on DigiCon.`,
          url: cardUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(cardUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      // Share cancellation and unavailable clipboard are intentionally silent.
    }
  };

  const saveContact = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!card) return;

    const fullName = contact.full_name.trim();
    const email = contact.email.trim().toLowerCase();
    const phone = contact.phone.trim();

    if (fullName.length < 2 || !email) {
      setError("Please enter your name and email.");
      return;
    }

    setSavingContact(true);
    setError(null);
    setContactSaved(false);

    try {
      const { error: rpcError } = await supabase.rpc(
        "capture_public_contact",
        {
          p_card_id: card.id,
          p_full_name: fullName,
          p_email: email,
          p_phone: phone || null,
          p_consent_given: true,
        },
      );

      if (rpcError) throw rpcError;

      setContact({ full_name: "", email: "", phone: "" });
      setContactSaved(true);
    } catch (cause) {
      console.error("DigiCon public contact capture failed:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to send your contact details.",
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
          <h1 className="text-2xl font-bold text-white">
            Card cannot be found
          </h1>
          <p className="mt-3 text-white/50">
            This DigiCon card may have been deleted, deactivated, or the link
            may be invalid.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <GlassButton>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to DigiCon
            </GlassButton>
          </Link>
        </GlassCard>
      </main>
    );
  }

  const background = `linear-gradient(135deg, ${
    card.card_color || "#007AFF"
  }, ${card.accent_color || "#5856D6"})`;

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-center justify-between">
          <Link to="/" className="text-sm text-white/50 hover:text-white">
            DigiCon
          </Link>

          <GlassButton
            size="sm"
            variant="ghost"
            onClick={() => void shareCard()}
          >
            {shareCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {shareCopied ? "Copied" : "Share"}
          </GlassButton>
        </header>

        {error && (
          <div
            className="mb-5 rounded-2xl border border-digicon-error/30 bg-digicon-error/10 px-4 py-3 text-sm text-digicon-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section
            className="overflow-hidden rounded-[28px]"
            style={{ background }}
          >
            <GlassCard variant="thick" className="bg-transparent">
              <div className="p-7 sm:p-10">
                <div className="flex justify-end">
                  {card.photo_url ? (
                    <img
                      src={card.photo_url}
                      alt={`${card.full_name} profile`}
                      className="h-28 w-28 rounded-full object-cover ring-2 ring-white/50"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="flex h-28 w-28 items-center justify-center rounded-full bg-white/15 text-4xl font-bold"
                      aria-hidden="true"
                    >
                      {card.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <p className="mt-10 text-xs uppercase tracking-[.25em] text-white/50">
                  DigiCon Digital Card
                </p>

                <h1 className="mt-2 text-4xl font-bold">
                  {card.full_name}
                </h1>

                {card.job_title && (
                  <p className="mt-2 text-lg text-white/80">
                    {card.job_title}
                  </p>
                )}

                {card.company && (
                  <p className="text-white/60">{card.company}</p>
                )}

                <div className="mt-8 space-y-3">
                  {card.email && (
                    <a
                      className="flex items-center gap-3 text-white/80 hover:text-white"
                      href={`mailto:${card.email}`}
                    >
                      <Mail className="h-5 w-5" />
                      {card.email}
                    </a>
                  )}

                  {card.phone && (
                    <a
                      className="flex items-center gap-3 text-white/80 hover:text-white"
                      href={`tel:${card.phone}`}
                    >
                      <Phone className="h-5 w-5" />
                      {card.phone}
                    </a>
                  )}

                  {card.website && (
                    <a
                      className="flex items-center gap-3 text-white/80 hover:text-white"
                      href={normalizeWebsite(card.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-5 w-5" />
                      Website
                    </a>
                  )}

                  {card.address && (
                    <p className="flex items-center gap-3 text-white/70">
                      <MapPin className="h-5 w-5" />
                      {card.address}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <GlassButton onClick={downloadVCard}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Save contact
                  </GlassButton>

                  <GlassButton
                    variant="ghost"
                    onClick={() => void shareCard()}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share card
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </section>

          <GlassCard variant="regular" className="p-6">
            <div className="flex justify-center rounded-3xl bg-white p-5">
              <QRCodeSVG
                value={cardUrl}
                size={220}
                level="H"
                includeMargin
                title={`QR code for ${card.full_name}'s DigiCon card`}
              />
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              Connect with {card.full_name}
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Scan this QR code or send your contact details directly to the
              card owner.
            </p>

            <form onSubmit={saveContact} className="mt-6 space-y-4">
              <div>
                <GlassLabel htmlFor="public-name">Your name *</GlassLabel>
                <GlassInput
                  id="public-name"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={contact.full_name}
                  onChange={(event) =>
                    setContact((current) => ({
                      ...current,
                      full_name: event.target.value,
                    }))
                  }
                  placeholder="Your name"
                />
              </div>

              <div>
                <GlassLabel htmlFor="public-email">Your email *</GlassLabel>
                <GlassInput
                  id="public-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={contact.email}
                  onChange={(event) =>
                    setContact((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <GlassLabel htmlFor="public-phone">Phone</GlassLabel>
                <GlassInput
                  id="public-phone"
                  type="tel"
                  autoComplete="tel"
                  value={contact.phone}
                  onChange={(event) =>
                    setContact((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+63..."
                />
              </div>

              {contactSaved && (
                <p className="flex items-center gap-2 text-sm text-digicon-eco">
                  <Check className="h-4 w-4" />
                  Your details were sent successfully.
                </p>
              )}

              <GlassButton
                type="submit"
                className="w-full"
                disabled={savingContact}
              >
                {savingContact ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {savingContact ? "Sending…" : "Send my details"}
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

export default PublicCardPage;

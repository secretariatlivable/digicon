import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Briefcase,
  Camera,
  Check,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Plus,
  QrCode,
  Share2,
  Trash2,
  Upload,
  Wallet,
  X,
  Zap,
  Palette,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase, type BusinessCard } from "@/lib/supabase";
import { addToAppleWallet, addToGoogleWallet } from "@/lib/wallet";
import {
  checkCreateCardEntitlement,
  checkEditCardEntitlement,
  checkWalletEntitlement,
  type EntitlementResult,
  type EntitlementState,
} from "@/lib/entitlements";
import { UpgradeRequiredDialog } from "@/components/UpgradeRequiredDialog";
import {
  Badge,
  EmptyState,
  GlassButton,
  GlassCard,
  GlassInput,
  GlassLabel,
  GlassSelect,
  Spinner,
} from "@/components/ui/GlassCard";

type DesignTemplate = "futuristic" | "professional" | "simple" | "custom";

type CardForm = {
  full_name: string;
  job_title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  card_color: string;
  accent_color: string;
  design_template: DesignTemplate;
  font_family: string;
  photo_url: string;
};

const PUBLIC_ORIGIN =
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim().replace(/\/$/, "") ||
  "https://digicon.cards";

const COLORS = [
  "#007AFF",
  "#5856D6",
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#5AC8FA",
  "#AF52DE",
  "#10B981",
  "#F59E0B",
  "#6366F1",
];

const FONTS = [
  "Inter",
  "Poppins",
  "SF Pro Display",
  "Helvetica Neue",
  "Arial",
  "Georgia",
];

const DEFAULT_FORM: CardForm = {
  full_name: "",
  job_title: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  card_color: "#007AFF",
  accent_color: "#5856D6",
  design_template: "professional",
  font_family: "Inter",
  photo_url: "",
};

const TEMPLATE_META: Record<
  DesignTemplate,
  { label: string; icon: typeof Briefcase }
> = {
  futuristic: { label: "Futuristic", icon: Zap },
  professional: { label: "Professional", icon: Briefcase },
  simple: { label: "Simple", icon: Briefcase },
  custom: { label: "Custom", icon: Palette },
};

function publicCardUrl(cardId: string) {
  return `${PUBLIC_ORIGIN}/c/${encodeURIComponent(cardId)}`;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z\d+\-.]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

function safeFileName(value: string) {
  const cleaned = Array.from(value.trim())
    .filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      if (code <= 0x1f || code === 0x7f) return false;
      return !'<>:"/\\|?*'.includes(character);
    })
    .join("")
    .replace(/\s+/g, "_")
    .slice(0, 80);

  return cleaned || "digicon-card";
}

function CardPreview({
  card,
  large = false,
}: {
  card: CardForm | BusinessCard;
  large?: boolean;
}) {
  const color = card.card_color || "#007AFF";
  const accent = card.accent_color || color;
  const template = (card.design_template || "professional") as DesignTemplate;
  const photo = card.photo_url || "";
  const name = card.full_name || "Your Name";

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl"
      style={{
        background:
          template === "simple"
            ? "#1C1C1E"
            : `linear-gradient(135deg, ${color}, ${
                template === "futuristic" || template === "custom" ? accent : `${color}dd`
              })`,
      }}
    >
      <div className={`${large ? "p-8" : "p-6"} relative z-10`}>
        <div className="mb-8 flex justify-end">
          {photo ? (
            <img
              src={photo}
              alt={`${name} profile`}
              className={`${large ? "h-24 w-24" : "h-16 w-16"} rounded-full object-cover ring-2 ring-white/40`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className={`${large ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl"} flex items-center justify-center rounded-full bg-white/15 font-bold text-white`}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/50">
          DigiCon · Digital Connections
        </p>
        <h3
          className={`${large ? "text-3xl" : "text-xl"} font-bold text-white`}
          style={{ fontFamily: card.font_family || "Inter" }}
        >
          {name}
        </h3>
        {card.job_title && <p className="mt-1 text-white/80">{card.job_title}</p>}
        {card.company && <p className="text-sm text-white/60">{card.company}</p>}

        <div className="mt-6 space-y-2 text-sm text-white/75">
          {card.email && (
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{card.email}</p>
          )}
          {card.phone && (
            <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{card.phone}</p>
          )}
          {card.website && (
            <p className="flex items-center gap-2 truncate"><ExternalLink className="h-4 w-4 shrink-0" />{card.website}</p>
          )}
          {card.address && (
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{card.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CardsPage() {
  const { session, plan, isActiveSubscription } = useAuth();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<BusinessCard | null>(null);
  const [shareCard, setShareCard] = useState<BusinessCard | null>(null);
  const [form, setForm] = useState<CardForm>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState<"apple" | "google" | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<EntitlementResult | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const entitlementState = useMemo<EntitlementState>(
    () => ({
      accountType: "startup",
      plan,
      cardCount: cards.length,
      completedCardEdits: editingCard?.edit_count ?? 0,
      isActiveSubscription,
    }),
    [plan, cards.length, editingCard?.edit_count, isActiveSubscription],
  );

  const loadCards = useCallback(async () => {
    if (!session?.user?.id) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: dbError } = await supabase
      .from("business_cards")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      setError(dbError.message);
      setCards([]);
    } else {
      setCards((data as BusinessCard[]) ?? []);
    }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const openCreate = () => {
    const verdict = checkCreateCardEntitlement(entitlementState);
    if (!verdict.allowed) {
      setUpgradePrompt(verdict);
      return;
    }

    setEditingCard(null);
    setForm({ ...DEFAULT_FORM });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (card: BusinessCard) => {
    const verdict = checkEditCardEntitlement({
      ...entitlementState,
      completedCardEdits: card.edit_count ?? 0,
    });
    if (!verdict.allowed) {
      setUpgradePrompt(verdict);
      return;
    }

    setEditingCard(card);
    setForm({
      full_name: card.full_name || "",
      job_title: card.job_title || "",
      company: card.company || "",
      phone: card.phone || "",
      email: card.email || "",
      website: card.website || "",
      address: card.address || "",
      card_color: card.card_color || "#007AFF",
      accent_color: card.accent_color || "#5856D6",
      design_template: (card.design_template as DesignTemplate) || "professional",
      font_family: card.font_family || "Inter",
      photo_url: card.photo_url || "",
    });
    setError(null);
    setShowForm(true);
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("card-photos")
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
          cacheControl: "31536000",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("card-photos").getPublicUrl(path);
      if (!data.publicUrl) throw new Error("Unable to create the photo URL.");

      setForm((current) => ({ ...current, photo_url: data.publicUrl }));
    } catch (cause) {
      console.error("DigiCon photo upload failed:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to upload photo.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const saveCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.user?.id) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      full_name: form.full_name.trim(),
      job_title: form.job_title.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: normalizeWebsite(form.website),
      address: form.address.trim(),
      photo_url: form.photo_url.trim(),
      card_color: form.card_color,
      accent_color: form.accent_color,
      design_template: form.design_template,
      font_family: form.font_family,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingCard) {
        const { error: updateError } = await supabase
          .from("business_cards")
          .update(payload)
          .eq("id", editingCard.id)
          .eq("user_id", session.user.id);

        if (updateError) throw updateError;
      } else {
        const { data: created, error: insertError } = await supabase
          .from("business_cards")
          .insert({
            ...payload,
            user_id: session.user.id,
            share_count: 0,
          })
          .select("*")
          .single();

        if (insertError) throw insertError;
        if (created) setShareCard(created as BusinessCard);
      }

      setShowForm(false);
      setEditingCard(null);
      await loadCards();
    } catch (cause) {
      console.error("DigiCon card save failed:", cause);
      setError(cause instanceof Error ? cause.message : "Unable to save the card.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async (card: BusinessCard) => {
    if (!session?.user?.id || deleting) return;
    if (!window.confirm(`Delete ${card.full_name || "this card"}? This cannot be undone.`)) return;

    setDeleting(card.id);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("business_cards")
        .delete()
        .eq("id", card.id)
        .eq("user_id", session.user.id);

      if (deleteError) throw deleteError;

      if (shareCard?.id === card.id) setShareCard(null);
      await loadCards();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete the card.");
    } finally {
      setDeleting(null);
    }
  };

  const copyShareUrl = async (card: BusinessCard) => {
    const url = publicCardUrl(card.id);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async (card: BusinessCard) => {
    const url = publicCardUrl(card.id);
    setShareCard(card);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission is optional.
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.full_name} | DigiCon`,
          text: `Connect with ${card.full_name} through DigiCon — Digital Connections.`,
          url,
        });
      } catch {
        // User cancellation is intentionally ignored.
      }
    }

    const { error: shareError } = await supabase.rpc(
      "increment_card_share_count",
      { p_card_id: card.id },
    );

    if (shareError) {
      console.error("DigiCon share count increment failed:", shareError);
    }
  };

  const downloadVCard = (card: BusinessCard) => {
    const esc = (value: string | null | undefined) =>
      (value || "")
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${esc(card.full_name)}`,
      `TITLE:${esc(card.job_title)}`,
      `ORG:${esc(card.company)}`,
      card.phone ? `TEL;TYPE=CELL:${esc(card.phone)}` : "",
      card.email ? `EMAIL:${esc(card.email)}` : "",
      card.website ? `URL:${esc(normalizeWebsite(card.website))}` : "",
      card.address ? `ADR;TYPE=WORK:;;${esc(card.address)}` : "",
      `URL;TYPE=DIGICON:${publicCardUrl(card.id)}`,
      "END:VCARD",
    ].filter(Boolean);

    const blob = new Blob([lines.join("\r\n") + "\r\n"], {
      type: "text/vcard;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileName(card.full_name)}.vcf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleWalletExport = async (
    kind: "apple" | "google",
    card: BusinessCard,
  ) => {
    const verdict = checkWalletEntitlement(entitlementState, kind);
    if (!verdict.allowed) {
      setUpgradePrompt(verdict);
      return;
    }

    setWalletError(null);
    setWalletLoading(kind);

    try {
      if (kind === "apple") await addToAppleWallet(card.id);
      else await addToGoogleWallet(card.id);
    } catch (cause) {
      setWalletError(cause instanceof Error ? cause.message : "Wallet export failed.");
    } finally {
      setWalletLoading(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge color="blue">Digital Connections</Badge>
            <h1 className="mt-3 text-3xl font-bold text-white">Your Digital Identity</h1>
            <p className="mt-2 max-w-2xl text-white/50">
              Create once, share anywhere, and give every introduction a place to become a relationship.
            </p>
          </div>
          <GlassButton onClick={openCreate} size="lg">
            <Plus className="mr-2 inline h-5 w-5" /> Create Digital Identity
          </GlassButton>
        </header>

        {error && !showForm && (
          <div className="mb-6 rounded-2xl border border-digicon-error/30 bg-digicon-error/10 p-4 text-sm text-digicon-error">
            {error}
          </div>
        )}

        {cards.length === 0 ? (
          <GlassCard variant="thick" className="p-4">
            <EmptyState
              icon={<QrCode className="h-8 w-8" />}
              title="Start your first Digital Connection"
              description="Create the identity people will use to connect with you. Your saved identity gets its own permanent DigiCon URL."
              action={
                <GlassButton onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Digital Identity
                </GlassButton>
              }
            />
          </GlassCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {cards.map((card) => {
              const url = publicCardUrl(card.id);

              return (
                <GlassCard key={card.id} variant="regular" className="overflow-hidden">
                  <div className="p-5">
                    <CardPreview card={card} />
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge color={card.is_active ? "green" : "gray"}>
                        {card.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge color="gray">{card.share_count || 0} shares</Badge>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <GlassButton size="sm" onClick={() => openEdit(card)}>
                        <Edit3 className="mr-1.5 h-4 w-4" />Edit
                      </GlassButton>
                      <GlassButton size="sm" variant="secondary" onClick={() => share(card)}>
                        <Share2 className="mr-1.5 h-4 w-4" />Share
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="mr-1.5 h-4 w-4" />Open
                      </GlassButton>
                      <GlassButton
                        size="sm"
                        variant="danger"
                        onClick={() => deleteCard(card)}
                        disabled={deleting === card.id}
                      >
                        {deleting === card.id ? (
                          <Spinner className="mr-1.5 h-4 w-4" />
                        ) : (
                          <Trash2 className="mr-1.5 h-4 w-4" />
                        )}
                        Delete
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
          <div className="mx-auto max-w-5xl py-8">
            <GlassCard variant="thick" className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-digicon-primary">
                    DigiCon · Digital Connections
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {editingCard ? "Refine your digital identity" : "Create your digital identity"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={saveCard} className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  {error && (
                    <div className="rounded-xl border border-digicon-error/30 bg-digicon-error/10 p-3 text-sm text-digicon-error">
                      {error}
                    </div>
                  )}

                  <section>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
                      Professional details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <GlassLabel htmlFor="card-full-name">Full name *</GlassLabel>
                        <GlassInput
                          id="card-full-name"
                          required
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="Juan Dela Cruz"
                        />
                      </div>
                      <div>
                        <GlassLabel htmlFor="card-job-title">Job title</GlassLabel>
                        <GlassInput
                          id="card-job-title"
                          value={form.job_title}
                          onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                          placeholder="Founder & CEO"
                        />
                      </div>
                      <div>
                        <GlassLabel htmlFor="card-company">Company</GlassLabel>
                        <GlassInput
                          id="card-company"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          placeholder="Your company"
                        />
                      </div>
                      <div>
                        <GlassLabel htmlFor="card-email">Email</GlassLabel>
                        <GlassInput
                          id="card-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="hello@example.com"
                        />
                      </div>
                      <div>
                        <GlassLabel htmlFor="card-phone">Phone</GlassLabel>
                        <GlassInput
                          id="card-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+63 917 123 4567"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <GlassLabel htmlFor="card-website">Website</GlassLabel>
                        <GlassInput
                          id="card-website"
                          type="url"
                          value={form.website}
                          onChange={(e) => setForm({ ...form, website: e.target.value })}
                          placeholder="yourcompany.com"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <GlassLabel htmlFor="card-address">Address</GlassLabel>
                        <GlassInput
                          id="card-address"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          placeholder="City, Philippines"
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                        Photo or logo
                      </h3>
                      {form.photo_url && (
                        <Badge color="green">
                          <Check className="h-3 w-3" />Saved
                        </Badge>
                      )}
                    </div>

                    <input
                      ref={fileInput}
                      className="hidden"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={uploadPhoto}
                    />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {form.photo_url ? (
                          <img
                            src={form.photo_url}
                            alt="Card photo preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Camera className="h-8 w-8 text-white/30" />
                        )}
                      </div>
                      <div>
                        <GlassButton
                          type="button"
                          variant="secondary"
                          disabled={uploading}
                          onClick={() => fileInput.current?.click()}
                        >
                          {uploading ? (
                            <Spinner className="mr-2 h-4 w-4" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {uploading ? "Uploading…" : "Choose photo or logo"}
                        </GlassButton>
                        <p className="mt-2 text-xs text-white/40">
                          JPG, PNG or WebP · max 5 MB
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
                      Style
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <GlassLabel htmlFor="card-template">Template</GlassLabel>
                        <GlassSelect
                          id="card-template"
                          value={form.design_template}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              design_template: e.target.value as DesignTemplate,
                            })
                          }
                        >
                          {Object.entries(TEMPLATE_META).map(([value, meta]) => (
                            <option key={value} value={value}>
                              {meta.label}
                            </option>
                          ))}
                        </GlassSelect>
                      </div>
                      <div>
                        <GlassLabel htmlFor="card-font">Font</GlassLabel>
                        <GlassSelect
                          id="card-font"
                          value={form.font_family}
                          onChange={(e) =>
                            setForm({ ...form, font_family: e.target.value })
                          }
                        >
                          {FONTS.map((font) => (
                            <option key={font} value={font}>
                              {font}
                            </option>
                          ))}
                        </GlassSelect>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      <div>
                        <GlassLabel>Primary color</GlassLabel>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              aria-label={`Primary color ${color}`}
                              onClick={() =>
                                setForm({ ...form, card_color: color })
                              }
                              className={`h-9 w-9 rounded-full border-2 ${
                                form.card_color === color
                                  ? "border-white"
                                  : "border-white/20"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <GlassLabel>Accent color</GlassLabel>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              aria-label={`Accent color ${color}`}
                              onClick={() =>
                                setForm({ ...form, accent_color: color })
                              }
                              className={`h-9 w-9 rounded-full border-2 ${
                                form.accent_color === color
                                  ? "border-white"
                                  : "border-white/20"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                    <GlassButton
                      type="button"
                      variant="ghost"
                      onClick={() => setShowForm(false)}
                      disabled={saving}
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      type="submit"
                      size="lg"
                      disabled={saving || uploading}
                    >
                      {saving ? (
                        <Spinner className="mr-2 h-4 w-4" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      {saving
                        ? "Saving…"
                        : editingCard
                          ? "Save changes"
                          : "Create Digital Identity"}
                    </GlassButton>
                  </div>
                </div>

                <aside className="lg:sticky lg:top-6 lg:self-start">
                  <p className="mb-3 text-xs uppercase tracking-widest text-white/40">
                    Live preview
                  </p>
                  <CardPreview card={form} large />
                </aside>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {shareCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
          <GlassCard variant="thick" className="w-full max-w-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge color="green">
                  <Check className="h-3 w-3" />Connection ready
                </Badge>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Share {shareCard.full_name}
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Share this identity now. It is the starting point for a DigiCon relationship.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareCard(null)}
                className="rounded-full p-2 text-white/60 hover:bg-white/10"
                aria-label="Close share dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex justify-center rounded-3xl bg-white p-5">
              <QRCodeSVG
                value={publicCardUrl(shareCard.id)}
                size={240}
                level="H"
                includeMargin
              />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <code className="min-w-0 flex-1 truncate text-xs text-white/70">
                {publicCardUrl(shareCard.id)}
              </code>
              <GlassButton size="sm" onClick={() => void copyShareUrl(shareCard)}>
                {copied ? (
                  <Check className="mr-1.5 h-4 w-4" />
                ) : (
                  <Copy className="mr-1.5 h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </GlassButton>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <GlassButton
                variant="secondary"
                onClick={() =>
                  window.open(
                    publicCardUrl(shareCard.id),
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />Open identity
              </GlassButton>
              <GlassButton
                variant="ghost"
                onClick={() => downloadVCard(shareCard)}
              >
                <Download className="mr-2 h-4 w-4" />Download vCard
              </GlassButton>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <GlassButton
                variant="ghost"
                disabled={walletLoading !== null}
                onClick={() =>
                  void handleWalletExport("apple", shareCard)
                }
              >
                {walletLoading === "apple" ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Apple Wallet
              </GlassButton>
              <GlassButton
                variant="ghost"
                disabled={walletLoading !== null}
                onClick={() =>
                  void handleWalletExport("google", shareCard)
                }
              >
                {walletLoading === "google" ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Google Wallet
              </GlassButton>
            </div>

            {walletError && (
              <p className="mt-3 text-sm text-digicon-error">{walletError}</p>
            )}
          </GlassCard>
        </div>
      )}

      <UpgradeRequiredDialog
        open={upgradePrompt !== null}
        onClose={() => setUpgradePrompt(null)}
        title="Upgrade when DigiCon becomes essential"
        message={
          upgradePrompt?.message ??
          "This capability is available on a paid DigiCon plan."
        }
        suggestedPlan={upgradePrompt?.suggestedPlan}
      />
    </main>
  );
}

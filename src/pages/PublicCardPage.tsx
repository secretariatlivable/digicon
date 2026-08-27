import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  Briefcase,
  Camera,
  Check,
  Copy,
  Download,
  Edit3,
  Mail,
  MessageSquare,
  Minus,
  Palette,
  Plus,
  Share2,
  Trash2,
  Type,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, type BusinessCard } from '@/lib/supabase';
import {
  addToAppleWallet,
  addToGoogleWallet,
} from '@/lib/wallet';
import {
  Badge,
  EmptyState,
  GlassButton,
  GlassCard,
  GlassInput,
  GlassLabel,
  GlassSelect,
  Spinner,
} from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/layout/AppLayout';

type DesignTemplate =
  | 'futuristic'
  | 'professional'
  | 'simple'
  | 'custom';

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

const PUBLIC_ORIGIN = 'https://digicon.cards';

const COLORS = [
  '#007AFF',
  '#5856D6',
  '#34C759',
  '#FF9500',
  '#FF3B30',
  '#5AC8FA',
  '#AF52DE',
  '#10B981',
  '#F59E0B',
  '#6366F1',
];

const FONTS = [
  'Inter',
  'Poppins',
  'SF Pro Display',
  'Helvetica Neue',
  'Arial',
  'Georgia',
];

const DEFAULT_FORM: CardForm = {
  full_name: '',
  job_title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  card_color: '#007AFF',
  accent_color: '#5856D6',
  design_template: 'professional',
  font_family: 'Inter',
  photo_url: '',
};

const TEMPLATE_META = {
  futuristic: { icon: Zap, label: 'Futuristic' },
  professional: { icon: Briefcase, label: 'Professional' },
  simple: { icon: Minus, label: 'Simple' },
  custom: { icon: Palette, label: 'Custom' },
} satisfies Record<
  DesignTemplate,
  { icon: typeof Zap; label: string }
>;

function safeFileName(value: string) {
  return (
    value
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 80) || 'digicon-card'
  );
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^[a-z][a-z\d+\-.]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

function escapeVCard(value: string | null | undefined) {
  return (value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function publicCardUrl(cardId: string) {
  return `${PUBLIC_ORIGIN}/c/${encodeURIComponent(cardId)}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.rel = 'noopener';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function CardPreview({
  card,
  large = false,
}: {
  card: CardForm | BusinessCard;
  large?: boolean;
}) {
  const template = (
    'design_template' in card
      ? card.design_template
      : 'professional'
  ) as DesignTemplate;

  const photo =
    ('photo_url' in card ? card.photo_url : '') || '';

  const color = card.card_color || '#007AFF';
  const accent = card.accent_color || color;
  const font = card.font_family || 'Inter';
  const name = card.full_name || 'Your Name';

  const avatar = photo ? (
    <img
      src={photo}
      alt={name}
      className={`${
        large ? 'w-20 h-20' : 'w-14 h-14'
      } rounded-full object-cover ring-2 ring-white/40`}
    />
  ) : (
    <div
      className={`${
        large ? 'w-20 h-20' : 'w-14 h-14'
      } rounded-full bg-white/15 flex items-center justify-center`}
    >
      <span
        className={`${
          large ? 'text-3xl' : 'text-xl'
        } font-bold text-white`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  const content = (
    <div
      className={`${
        large ? 'p-8' : 'p-5'
      } relative z-10`}
    >
      <div className="flex justify-end mb-4">
        {avatar}
      </div>

      <h3
        className={`${
          large ? 'text-2xl' : 'text-lg'
        } font-bold text-white`}
        style={{ fontFamily: font }}
      >
        {name}
      </h3>

      {card.job_title && (
        <p
          className="text-white/80"
          style={{ fontFamily: font }}
        >
          {card.job_title}
        </p>
      )}

      {card.company && (
        <p
          className="text-white/60 text-sm"
          style={{ fontFamily: font }}
        >
          {card.company}
        </p>
      )}
    </div>
  );

  if (template === 'simple') {
    return (
      <div className="rounded-glass-2xl overflow-hidden bg-[#1C1C1E] border border-white/10">
        {content}
      </div>
    );
  }

  return (
    <div
      className="relative rounded-glass-2xl overflow-hidden"
      style={{
        background:
          template === 'futuristic' ||
          template === 'custom'
            ? `linear-gradient(135deg, ${color}, ${accent})`
            : `linear-gradient(135deg, ${color}, ${color}dd)`,
      }}
    >
      {template === 'futuristic' && (
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,.2),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,.15),transparent_50%)]" />
      )}

      {template === 'custom' && (
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: accent }}
        />
      )}

      {content}
    </div>
  );
}

export function PublicCardPage() {
  const { session } = useAuth();

  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] =
    useState<BusinessCard | null>(null);
  const [shareCard, setShareCard] =
    useState<BusinessCard | null>(null);

  const [form, setForm] =
    useState<CardForm>(DEFAULT_FORM);

  const [error, setError] = useState<string | null>(null);
  const [walletError, setWalletError] =
    useState<string | null>(null);
  const [walletLoading, setWalletLoading] =
    useState<'apple' | 'google' | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] =
    useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const loadCards = async () => {
    if (!session?.user?.id) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error: dbError } = await supabase
      .from('business_cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      setError(dbError.message);
      setCards([]);
    } else {
      setCards((data as BusinessCard[]) || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadCards();
  }, [session?.user?.id]);

  const openCreate = () => {
    setEditingCard(null);
    setForm({ ...DEFAULT_FORM });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (card: BusinessCard) => {
    setEditingCard(card);
    setForm({
      full_name: card.full_name || '',
      job_title: card.job_title || '',
      company: card.company || '',
      phone: card.phone || '',
      email: card.email || '',
      website: card.website || '',
      address: card.address || '',
      card_color: card.card_color || '#007AFF',
      accent_color: card.accent_color || '#5856D6',
      design_template:
        (card.design_template as DesignTemplate) ||
        'professional',
      font_family: card.font_family || 'Inter',
      photo_url: card.photo_url || '',
    });
    setError(null);
    setShowForm(true);
  };

  const uploadPhoto = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !session?.user?.id) return;

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowed.includes(file.type)) {
      setError('Use a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be 5 MB or smaller.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const ext =
        file.type === 'image/png'
          ? 'png'
          : file.type === 'image/webp'
            ? 'webp'
            : 'jpg';

      const path =
        `${session.user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } =
        await supabase.storage
          .from('card-photos')
          .upload(path, file, {
            upsert: false,
            contentType: file.type,
            cacheControl: '31536000',
          });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('card-photos')
        .getPublicUrl(path);

      if (!data.publicUrl) {
        throw new Error(
          'Could not create a public photo URL.',
        );
      }

      setForm((current) => ({
        ...current,
        photo_url: data.publicUrl,
      }));
    } catch (uploadError) {
      console.error('Photo upload failed:', uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Unable to upload photo.',
      );
    } finally {
      setUploading(false);

      if (fileInput.current) {
        fileInput.current.value = '';
      }
    }
  };

  const saveCard = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!session?.user?.id) {
      setError(
        'Your session has expired. Please sign in again.',
      );
      return;
    }

    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      full_name: form.full_name.trim(),
      job_title: form.job_title.trim() || null,
      company: form.company.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      website: normalizeWebsite(form.website) || null,
      address: form.address.trim() || null,
      card_color: form.card_color,
      accent_color: form.accent_color,
      design_template: form.design_template,
      font_family: form.font_family,
      photo_url: form.photo_url || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingCard) {
        const { error: updateError } =
          await supabase
            .from('business_cards')
            .update(payload)
            .eq('id', editingCard.id)
            .eq('user_id', session.user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } =
          await supabase
            .from('business_cards')
            .insert({
              ...payload,
              user_id: session.user.id,
              is_active: true,
              share_count: 0,
            });

        if (insertError) throw insertError;
      }

      setShowForm(false);
      setEditingCard(null);
      await loadCards();
    } catch (saveError) {
      console.error('Card save failed:', saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save the business card.',
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async (id: string) => {
    if (!session?.user?.id || deleting) return;

    const card = cards.find((item) => item.id === id);

    if (
      !window.confirm(
        `Delete ${card?.full_name || 'this card'}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(id);
    setError(null);

    try {
      const { error: deleteError } =
        await supabase
          .from('business_cards')
          .delete()
          .eq('id', id)
          .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      if (shareCard?.id === id) {
        setShareCard(null);
      }

      await loadCards();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete the card.',
      );
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (card: BusinessCard) => {
    if (!session?.user?.id) return;

    const { error: updateError } =
      await supabase
        .from('business_cards')
        .update({
          is_active: !card.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', card.id)
        .eq('user_id', session.user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await loadCards();
    }
  };

  const shareUrl = shareCard
    ? publicCardUrl(shareCard.id)
    : '';

  const copyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1800,
      );
    } catch {
      setError('Unable to copy the card URL.');
    }
  };

  const downloadVCard = () => {
    if (!shareCard) return;

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVCard(shareCard.full_name)}`,
      shareCard.job_title
        ? `TITLE:${escapeVCard(shareCard.job_title)}`
        : '',
      shareCard.company
        ? `ORG:${escapeVCard(shareCard.company)}`
        : '',
      shareCard.phone
        ? `TEL;TYPE=CELL:${escapeVCard(shareCard.phone)}`
        : '',
      shareCard.email
        ? `EMAIL;TYPE=INTERNET:${escapeVCard(shareCard.email)}`
        : '',
      shareCard.website
        ? `URL:${escapeVCard(normalizeWebsite(shareCard.website))}`
        : '',
      shareCard.address
        ? `ADR;TYPE=WORK:;;${escapeVCard(shareCard.address)};;;`
        : '',
      `item1.URL:${escapeVCard(shareUrl)}`,
      'item1.X-ABLabel:DigiCon Digital Card',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    downloadBlob(
      new Blob([`${lines}\r\n`], {
        type: 'text/vcard;charset=utf-8',
      }),
      `${safeFileName(shareCard.full_name)}.vcf`,
    );
  };

  const downloadQR = () => {
    if (!shareCard) return;

    const svg = document.getElementById(
      'digicon-share-qr',
    );

    if (!(svg instanceof SVGElement)) {
      setError('QR code is not ready.');
      return;
    }

    const source =
      new XMLSerializer().serializeToString(svg);

    const blobUrl = URL.createObjectURL(
      new Blob([source], {
        type: 'image/svg+xml',
      }),
    );

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1600;

      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(blobUrl);
        setError('Unable to render the QR image.');
        return;
      }

      context.fillStyle = '#FFFFFF';
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      canvas.toBlob((png) => {
        URL.revokeObjectURL(blobUrl);

        if (png) {
          downloadBlob(
            png,
            `digicon-qr-${safeFileName(
              shareCard.full_name,
            )}.png`,
          );
        } else {
          setError('Unable to create the QR image.');
        }
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      setError('Unable to render the QR image.');
    };

    image.src = blobUrl;
  };

  const shareSMS = () => {
    if (shareUrl) {
      window.location.href =
        `sms:?body=${encodeURIComponent(
          `My DigiCon digital business card: ${shareUrl}`,
        )}`;
    }
  };

  const shareEmail = () => {
    if (!shareCard || !shareUrl) return;

    const subject =
      `${shareCard.full_name} — DigiCon Digital Business Card`;

    window.location.href =
      `mailto:?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(
        `Here is my digital business card:\n${shareUrl}`,
      )}`;
  };

  const appleWallet = async () => {
    if (!shareCard || walletLoading) return;

    setWalletLoading('apple');
    setWalletError(null);

    try {
      await addToAppleWallet(shareCard.id);
    } catch (walletException) {
      setWalletError(
        walletException instanceof Error
          ? walletException.message
          : 'Apple Wallet is unavailable.',
      );
    } finally {
      setWalletLoading(null);
    }
  };

  const googleWallet = async () => {
    if (!shareCard || walletLoading) return;

    setWalletLoading('google');
    setWalletError(null);

    try {
      await addToGoogleWallet(shareCard.id);
    } catch (walletException) {
      setWalletError(
        walletException instanceof Error
          ? walletException.message
          : 'Google Wallet is unavailable.',
      );
    } finally {
      setWalletLoading(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-32">
          <Spinner className="w-8 h-8" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Digital Business Cards
          </h1>
          <p className="text-white/50 mt-1">
            Create, share, and save your professional identity.
          </p>
        </div>

        <GlassButton onClick={openCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Create Card
        </GlassButton>
      </div>

      {error && (
        <GlassCard
          variant="regular"
          className="p-4 mb-6 border border-digicon-error/30"
        >
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-digicon-error shrink-0" />
            <p className="text-sm text-white/80 flex-1">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </GlassCard>
      )}

      {cards.length === 0 ? (
        <GlassCard variant="regular" className="p-6">
          <EmptyState
            icon={<Share2 className="w-8 h-8" />}
            title="No business cards yet"
            description="Create your first card and get a permanent QR link at digicon.cards/c/{cardId}."
            action={
              <GlassButton onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Card
              </GlassButton>
            }
          />
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <GlassCard
              key={card.id}
              variant="regular"
              hover
              className="overflow-hidden"
            >
              <CardPreview card={card} />

              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {card.share_count || 0} shares
                  </span>

                  <Badge
                    color={
                      card.is_active
                        ? 'green'
                        : 'gray'
                    }
                  >
                    {card.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <GlassButton
                    size="sm"
                    onClick={() => {
                      setShareCard(card);
                      setWalletError(null);
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </GlassButton>

                  <button
                    type="button"
                    onClick={() => openEdit(card)}
                    className="p-2 rounded-glass-sm glass-thin text-white/70"
                    aria-label={`Edit ${card.full_name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void deleteCard(card.id)
                    }
                    className="p-2 rounded-glass-sm glass-thin text-digicon-error/70"
                    disabled={deleting === card.id}
                    aria-label={`Delete ${card.full_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void toggleActive(card)
                  }
                  className="w-full mt-2 text-xs text-white/40"
                >
                  {card.is_active
                    ? 'Deactivate card'
                    : 'Activate card'}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
            aria-label="Close form"
            onClick={() =>
              !saving && setShowForm(false)
            }
          />

          <GlassCard
            variant="chrome"
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingCard
                  ? 'Edit Card'
                  : 'Create Card'}
              </h2>

              <button
                type="button"
                onClick={() =>
                  !saving && setShowForm(false)
                }
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <form
              onSubmit={saveCard}
              className="space-y-5"
            >
              <div>
                <GlassLabel>
                  <Camera className="inline w-4 h-4 mr-1" />
                  Photo or Logo
                </GlassLabel>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden glass-thin flex items-center justify-center">
                    {form.photo_url ? (
                      <img
                        src={form.photo_url}
                        alt="Card photo or logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-7 h-7 text-white/30" />
                    )}
                  </div>

                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={uploadPhoto}
                    className="hidden"
                  />

                  <GlassButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      fileInput.current?.click()
                    }
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      'Upload photo/logo'
                    )}
                  </GlassButton>

                  {form.photo_url && (
                    <button
                      type="button"
                      className="text-xs text-white/40"
                      onClick={() =>
                        setForm((value) => ({
                          ...value,
                          photo_url: '',
                        }))
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-xs text-white/30 mt-2">
                  JPG, PNG, or WebP · maximum 5 MB.
                  The uploaded URL is saved with the card.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <GlassLabel>
                    Full Name *
                  </GlassLabel>
                  <GlassInput
                    value={form.full_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        full_name:
                          event.target.value,
                      })
                    }
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <GlassLabel>
                    Job Title
                  </GlassLabel>
                  <GlassInput
                    value={form.job_title}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        job_title:
                          event.target.value,
                      })
                    }
                    autoComplete="organization-title"
                  />
                </div>

                <div>
                  <GlassLabel>
                    Company
                  </GlassLabel>
                  <GlassInput
                    value={form.company}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        company:
                          event.target.value,
                      })
                    }
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <GlassLabel>
                    Phone
                  </GlassLabel>
                  <GlassInput
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone:
                          event.target.value,
                      })
                    }
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                <div>
                  <GlassLabel>
                    Email
                  </GlassLabel>
                  <GlassInput
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        email:
                          event.target.value,
                      })
                    }
                    autoComplete="email"
                  />
                </div>

                <div>
                  <GlassLabel>
                    Website
                  </GlassLabel>
                  <GlassInput
                    value={form.website}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        website:
                          event.target.value,
                      })
                    }
                    autoComplete="url"
                    inputMode="url"
                    placeholder="example.com"
                  />
                </div>
              </div>

              <div>
                <GlassLabel>
                  Address
                </GlassLabel>
                <GlassInput
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address:
                        event.target.value,
                    })
                  }
                  autoComplete="street-address"
                />
              </div>

              <div>
                <GlassLabel>
                  <Type className="inline w-4 h-4 mr-1" />
                  Font
                </GlassLabel>

                <GlassSelect
                  value={form.font_family}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      font_family:
                        event.target.value,
                    })
                  }
                >
                  {FONTS.map((font) => (
                    <option
                      key={font}
                      value={font}
                    >
                      {font}
                    </option>
                  ))}
                </GlassSelect>
              </div>

              <div>
                <GlassLabel>
                  Template
                </GlassLabel>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    Object.keys(
                      TEMPLATE_META,
                    ) as DesignTemplate[]
                  ).map((key) => {
                    const MetaIcon =
                      TEMPLATE_META[key].icon;

                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() =>
                          setForm({
                            ...form,
                            design_template:
                              key,
                          })
                        }
                        className={`p-3 rounded-glass-md ${
                          form.design_template ===
                          key
                            ? 'glass-regular ring-2 ring-digicon-primary'
                            : 'glass-thin'
                        }`}
                      >
                        <span className="flex justify-center mb-1">
                          <MetaIcon className="w-5 h-5" />
                        </span>
                        <span className="text-xs text-white/80">
                          {TEMPLATE_META[key]
                            .label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <GlassLabel>
                  Primary Color
                </GlassLabel>

                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() =>
                        setForm({
                          ...form,
                          card_color: color,
                        })
                      }
                      className={`w-9 h-9 rounded-full ${
                        form.card_color ===
                        color
                          ? 'ring-2 ring-white scale-110'
                          : ''
                      }`}
                      style={{
                        backgroundColor:
                          color,
                      }}
                      aria-label={`Primary color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {(form.design_template ===
                'futuristic' ||
                form.design_template ===
                  'custom') && (
                <div>
                  <GlassLabel>
                    Accent Color
                  </GlassLabel>

                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() =>
                          setForm({
                            ...form,
                            accent_color:
                              color,
                          })
                        }
                        className={`w-9 h-9 rounded-full ${
                          form.accent_color ===
                          color
                            ? 'ring-2 ring-white scale-110'
                            : ''
                        }`}
                        style={{
                          backgroundColor:
                            color,
                        }}
                        aria-label={`Accent color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <GlassLabel>
                  Preview
                </GlassLabel>
                <CardPreview
                  card={form}
                  large
                />
              </div>

              <div className="flex gap-3">
                <GlassButton
                  type="submit"
                  className="flex-1"
                  disabled={
                    saving || uploading
                  }
                >
                  {saving
                    ? 'Saving…'
                    : editingCard
                      ? 'Save Changes'
                      : 'Create Card'}
                </GlassButton>

                <GlassButton
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {shareCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
            aria-label="Close sharing dialog"
            onClick={() =>
              !walletLoading &&
              setShareCard(null)
            }
          />

          <GlassCard
            variant="chrome"
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto p-6"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">
                Share Card
              </h2>

              <button
                type="button"
                onClick={() =>
                  !walletLoading &&
                  setShareCard(null)
                }
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-glass-lg">
                <QRCodeSVG
                  id="digicon-share-qr"
                  value={shareUrl}
                  size={220}
                  level="H"
                  includeMargin
                />
              </div>

              <p className="text-xs text-white/40 mt-3 break-all">
                Scan to open this exact card:
                <br />
                {shareUrl}
              </p>
            </div>

            <div className="flex gap-2 mt-5">
              <GlassInput
                readOnly
                value={shareUrl}
                onFocus={(event) =>
                  event.currentTarget.select()
                }
                aria-label="Digital card URL"
              />

              <GlassButton
                size="sm"
                variant="secondary"
                onClick={() =>
                  void copyLink()
                }
                aria-label="Copy card URL"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </GlassButton>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                type="button"
                onClick={downloadQR}
                className="p-3 rounded-glass-md glass-thin text-white/70 text-xs"
              >
                <Download className="w-5 h-5 mx-auto mb-1" />
                QR PNG
              </button>

              <button
                type="button"
                onClick={shareSMS}
                className="p-3 rounded-glass-md glass-thin text-white/70 text-xs"
              >
                <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                SMS
              </button>

              <button
                type="button"
                onClick={shareEmail}
                className="p-3 rounded-glass-md glass-thin text-white/70 text-xs"
              >
                <Mail className="w-5 h-5 mx-auto mb-1" />
                Email
              </button>
            </div>

            <button
              type="button"
              onClick={downloadVCard}
              className="w-full mt-3 p-3 rounded-glass-md glass-thin text-sm text-white/70"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Save Contact (vCard)
            </button>

            <div className="mt-5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-digicon-primary" />
                <h3 className="text-sm font-semibold text-white">
                  Save to Wallet
                </h3>
              </div>

              <p className="text-xs text-white/40 mb-3">
                Add this exact digital business
                card to your mobile wallet.
              </p>

              {walletError && (
                <div className="mb-3 p-3 rounded-glass-md bg-digicon-error/10 border border-digicon-error/20 text-xs text-white/70">
                  {walletError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void appleWallet()
                  }
                  disabled={Boolean(
                    walletLoading,
                  )}
                  className="p-3 rounded-glass-md glass-thin text-white/80 disabled:opacity-50"
                >
                  {walletLoading ===
                  'apple' ? (
                    <Spinner className="w-4 h-4 mx-auto mb-1" />
                  ) : (
                    <Wallet className="w-4 h-4 mx-auto mb-1" />
                  )}
                  <span className="text-xs">
                    Apple Wallet
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void googleWallet()
                  }
                  disabled={Boolean(
                    walletLoading,
                  )}
                  className="p-3 rounded-glass-md glass-thin text-white/80 disabled:opacity-50"
                >
                  {walletLoading ===
                  'google' ? (
                    <Spinner className="w-4 h-4 mx-auto mb-1" />
                  ) : (
                    <Wallet className="w-4 h-4 mx-auto mb-1" />
                  )}
                  <span className="text-xs">
                    Google Wallet
                  </span>
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </AppLayout>
  );
}

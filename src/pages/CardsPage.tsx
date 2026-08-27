import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CreditCard,
  Plus,
  Share2,
  Trash2,
  Edit3,
  X,
  Download,
  Link2,
  MessageSquare,
  Check,
  Mail,
  Wallet,
  Camera,
  Zap,
  Briefcase,
  Minus,
  Palette,
  Type,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { supabase, type BusinessCard } from '@/lib/supabase';
import {
  addToAppleWallet,
  addToGoogleWallet,
} from '@/lib/wallet';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassLabel,
  GlassTextarea,
  GlassSelect,
  Spinner,
  EmptyState,
  Badge,
} from '@/components/ui/GlassCard';
import { AppLayout } from '@/components/layout/AppLayout';

type DesignTemplate = 'futuristic' | 'professional' | 'simple' | 'custom';

const cardColors = [
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

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'SF Pro Display', label: 'SF Pro Display' },
  { value: 'Helvetica Neue', label: 'Helvetica Neue' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
];

const templateMeta: Record<
  DesignTemplate,
  { icon: typeof Zap; label: string; desc: string }
> = {
  futuristic: {
    icon: Zap,
    label: 'Futuristic',
    desc: 'Neon gradients and glow effects',
  },
  professional: {
    icon: Briefcase,
    label: 'Professional',
    desc: 'Clean, corporate, trustworthy',
  },
  simple: {
    icon: Minus,
    label: 'Simple',
    desc: 'Minimal and understated',
  },
  custom: {
    icon: Palette,
    label: 'Custom',
    desc: 'Full control over colors',
  },
};

type FormData = {
  full_name: string;
  job_title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  bio: string;
  card_color: string;
  accent_color: string;
  design_template: DesignTemplate;
  font_family: string;
  photo_url: string;
};

const defaultForm: FormData = {
  full_name: '',
  job_title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  bio: '',
  card_color: '#007AFF',
  accent_color: '#5856D6',
  design_template: 'professional',
  font_family: 'Inter',
  photo_url: '',
};

function escapeVCardValue(value: string | null | undefined): string {
  return (value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function safeFileName(value: string): string {
  return (
    value
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 100) || 'digicon-card'
  );
}

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z\d+\-.]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function CardsPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<BusinessCard | null>(null);
  const [shareCard, setShareCard] = useState<BusinessCard | null>(null);

  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState<
    'apple' | 'google' | null
  >(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (k: TranslationKey) => translate(k, lang);
  const [formData, setFormData] = useState<FormData>(defaultForm);

  useEffect(() => {
    void loadCards();
  }, [session?.user?.id]);

  const loadCards = async () => {
    if (!session?.user?.id) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('business_cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setActionError(error.message);
      setCards([]);
    } else {
      setCards((data as BusinessCard[]) || []);
    }

    setLoading(false);
  };

  const openCreate = () => {
    setEditingCard(null);
    setFormData({ ...defaultForm });
    setActionError(null);
    setShowForm(true);
  };

  const openEdit = (card: BusinessCard) => {
    setEditingCard(card);
    setActionError(null);
    setFormData({
      full_name: card.full_name || '',
      job_title: card.job_title || '',
      company: card.company || '',
      phone: card.phone || '',
      email: card.email || '',
      website: card.website || '',
      address: card.address || '',
      bio: card.bio || '',
      card_color: card.card_color || '#007AFF',
      accent_color: card.accent_color || '#5856D6',
      design_template:
        (card.design_template as DesignTemplate) || 'professional',
      font_family: card.font_family || 'Inter',
      photo_url: card.photo_url || '',
    });
    setShowForm(true);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !session?.user?.id) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      setActionError('Please upload a JPG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setActionError('Profile photos must be 5 MB or smaller.');
      return;
    }

    setActionError(null);
    setUploadingPhoto(true);

    try {
      const extension =
        file.name.split('.').pop()?.toLowerCase() ||
        (file.type === 'image/png' ? 'png' : 'jpg');

      const path = `${session.user.id}/${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage
        .from('card-photos')
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('card-photos')
        .getPublicUrl(path);

      setFormData((previous) => ({
        ...previous,
        photo_url: urlData.publicUrl,
      }));
    } catch (error) {
      console.error('Photo upload failed:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to upload the profile photo.',
      );
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const saveCard = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!session?.user?.id) {
      setActionError('Your session has expired. Please sign in again.');
      return;
    }

    if (!formData.full_name.trim()) {
      setActionError('Please enter a name for the business card.');
      return;
    }

    setActionError(null);
    setSavingCard(true);

    const payload = {
      ...formData,
      full_name: formData.full_name.trim(),
      website: formData.website.trim(),
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingCard) {
        const { error } = await supabase
          .from('business_cards')
          .update(payload)
          .eq('id', editingCard.id)
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('business_cards').insert({
          ...payload,
          user_id: session.user.id,
        });

        if (error) throw error;
      }

      setShowForm(false);
      setEditingCard(null);
      await loadCards();
    } catch (error) {
      console.error('Saving business card failed:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to save the business card.',
      );
    } finally {
      setSavingCard(false);
    }
  };

  const deleteCard = async (id: string) => {
    if (!session?.user?.id) return;

    const card = cards.find((item) => item.id === id);
    const confirmed = window.confirm(
      `Delete ${card?.full_name || 'this business card'}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setActionError(null);
    setDeletingCardId(id);

    try {
      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (shareCard?.id === id) {
        setShareCard(null);
      }

      await loadCards();
    } catch (error) {
      console.error('Deleting business card failed:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to delete the business card.',
      );
    } finally {
      setDeletingCardId(null);
    }
  };

  const toggleActive = async (card: BusinessCard) => {
    if (!session?.user?.id) return;

    setActionError(null);

    const { error } = await supabase
      .from('business_cards')
      .update({
        is_active: !card.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', card.id)
      .eq('user_id', session.user.id);

    if (error) {
      setActionError(error.message);
      return;
    }

    await loadCards();
  };

  const shareUrl = shareCard
    ? `${window.location.origin}/c/${encodeURIComponent(shareCard.id)}`
    : '';

  const copyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setActionError('Unable to copy the link. Please copy it manually.');
    }
  };

  const downloadBlob = (
    blob: Blob,
    filename: string,
  ) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');

    if (!(svg instanceof SVGElement)) {
      setActionError('The QR code is not available yet.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1200;

      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(svgUrl);
        setActionError('Unable to generate the QR image.');
        return;
      }

      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(svgUrl);

        if (!blob) {
          setActionError('Unable to generate the QR image.');
          return;
        }

        downloadBlob(
          blob,
          `digicon-qr-${safeFileName(shareCard?.full_name || 'card')}.png`,
        );
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      setActionError('Unable to generate the QR image.');
    };

    image.src = svgUrl;
  };

  const shareSMS = () => {
    if (!shareUrl) return;
    window.location.href = `sms:?body=${encodeURIComponent(
      `Check out my digital business card: ${shareUrl}`,
    )}`;
  };

  const shareEmail = () => {
    if (!shareCard || !shareUrl) return;

    const subject = `${shareCard.full_name || 'My'} Digital Business Card`;
    const body = [
      'Hi,',
      '',
      `Here's my digital business card: ${shareUrl}`,
      '',
      'Best regards,',
      shareCard.full_name || '',
    ].join('\n');

    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const downloadVCard = () => {
    if (!shareCard) return;

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVCardValue(shareCard.full_name)}`,
      `N:${escapeVCardValue(shareCard.full_name)};;;;`,
      shareCard.job_title
        ? `TITLE:${escapeVCardValue(shareCard.job_title)}`
        : '',
      shareCard.company
        ? `ORG:${escapeVCardValue(shareCard.company)}`
        : '',
      shareCard.phone ? `TEL;TYPE=CELL:${escapeVCardValue(shareCard.phone)}` : '',
      shareCard.email ? `EMAIL;TYPE=INTERNET:${escapeVCardValue(shareCard.email)}` : '',
      shareCard.website
        ? `URL:${escapeVCardValue(normalizeWebsite(shareCard.website))}`
        : '',
      shareCard.address
        ? `ADR;TYPE=WORK:;;${escapeVCardValue(shareCard.address)};;;`
        : '',
      shareCard.bio ? `NOTE:${escapeVCardValue(shareCard.bio)}` : '',
      shareUrl ? `item1.URL:${escapeVCardValue(shareUrl)}` : '',
      shareUrl ? 'item1.X-ABLabel:DigiCon Digital Card' : '',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    downloadBlob(
      new Blob([`${vcard}\r\n`], {
        type: 'text/vcard;charset=utf-8',
      }),
      `${safeFileName(shareCard.full_name)}.vcf`,
    );
  };

  const handleAppleWallet = async () => {
    if (!shareCard || walletLoading) return;

    setWalletError(null);
    setWalletLoading('apple');

    try {
      await addToAppleWallet(shareCard.id);
    } catch (error) {
      console.error('Apple Wallet failed:', error);
      setWalletError(
        error instanceof Error
          ? error.message
          : 'Unable to create the Apple Wallet pass.',
      );
    } finally {
      setWalletLoading(null);
    }
  };

  const handleGoogleWallet = async () => {
    if (!shareCard || walletLoading) return;

    setWalletError(null);
    setWalletLoading('google');

    try {
      await addToGoogleWallet(shareCard.id);
    } catch (error) {
      console.error('Google Wallet failed:', error);
      setWalletError(
        error instanceof Error
          ? error.message
          : 'Unable to create the Google Wallet pass.',
      );
      setWalletLoading(null);
    }
  };

  const markShared = async () => {
    if (!shareCard || !session?.user?.id) return;

    setActionError(null);

    try {
      const currentShareCount = shareCard.share_count || 0;

      const { error: cardError } = await supabase
        .from('business_cards')
        .update({
          share_count: currentShareCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shareCard.id)
        .eq('user_id', session.user.id);

      if (cardError) throw cardError;

      const { data: eco, error: ecoError } = await supabase
        .from('eco_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (ecoError) throw ecoError;

      if (eco) {
        const { error } = await supabase
          .from('eco_stats')
          .update({
            cards_shared: (eco.cards_shared || 0) + 1,
            paper_saved_sqm: (eco.paper_saved_sqm || 0) + 0.05,
            trees_saved: (eco.trees_saved || 0) + 0.0029,
            carbon_reduced_kg: (eco.carbon_reduced_kg || 0) + 0.02,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.user.id);

        if (error) throw error;
      }

      setShareCard(null);
      setWalletError(null);
      await loadCards();
    } catch (error) {
      console.error('Updating share stats failed:', error);
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to update sharing statistics.',
      );
    }
  };

  const renderCardPreview = (
    card: FormData | BusinessCard,
    large = false,
  ) => {
    const template = ('design_template' in card
      ? card.design_template
      : 'professional') as DesignTemplate;

    const font =
      ('font_family' in card ? card.font_family : 'Inter') || 'Inter';

    const photo =
      ('photo_url' in card ? card.photo_url : '') || '';

    const accent =
      ('accent_color' in card ? card.accent_color : '') ||
      card.card_color ||
      '#5856D6';

    const sizePad = large ? 'p-8' : 'p-5';
    const sizeH = large ? 'min-h-64' : 'h-40';

    if (template === 'futuristic') {
      return (
        <div
          className={`relative ${sizeH} flex flex-col justify-end ${sizePad} overflow-hidden`}
          style={{
            background: `linear-gradient(135deg, ${card.card_color}, ${accent})`,
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)',
            }}
          />

          <div
            className="absolute top-0 left-0 right-0 h-1"
            aria-hidden="true"
            style={{
              background: `linear-gradient(90deg, ${card.card_color}, ${accent}, ${card.card_color})`,
            }}
          />

          {photo ? (
            <img
              src={photo}
              alt={card.full_name}
              className={`absolute top-4 right-4 ${
                large ? 'w-20 h-20' : 'w-12 h-12'
              } rounded-full object-cover ring-2 ring-white/40`}
            />
          ) : (
            <div
              className={`absolute top-4 right-4 ${
                large ? 'w-20 h-20' : 'w-12 h-12'
              } rounded-full bg-white/20 backdrop-blur flex items-center justify-center`}
            >
              <span
                className={`${
                  large ? 'text-3xl' : 'text-xl'
                } font-bold text-white`}
              >
                {card.full_name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}

          <div className="relative" style={{ fontFamily: font }}>
            <h3
              className={`${
                large ? 'text-2xl' : 'text-lg'
              } font-bold text-white tracking-tight`}
            >
              {card.full_name || 'Your Name'}
            </h3>
            <p
              className={`${
                large ? 'text-base' : 'text-sm'
              } text-white/90`}
            >
              {card.job_title || 'Job Title'}
            </p>
            <p
              className={`${
                large ? 'text-sm' : 'text-xs'
              } text-white/70`}
            >
              {card.company || 'Company'}
            </p>
          </div>
        </div>
      );
    }

    if (template === 'simple') {
      return (
        <div
          className={`${sizeH} flex flex-col justify-center ${sizePad} bg-[#1C1C1E] border border-white/10`}
        >
          {photo ? (
            <img
              src={photo}
              alt={card.full_name}
              className={`${
                large ? 'w-20 h-20' : 'w-12 h-12'
              } rounded-full object-cover mb-3`}
            />
          ) : (
            <div
              className={`${
                large ? 'w-20 h-20' : 'w-12 h-12'
              } rounded-full bg-white/10 flex items-center justify-center mb-3`}
            >
              <span
                className={`${
                  large ? 'text-3xl' : 'text-xl'
                } font-bold text-white/80`}
              >
                {card.full_name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}

          <div style={{ fontFamily: font }}>
            <h3
              className={`${
                large ? 'text-2xl' : 'text-lg'
              } font-semibold text-white`}
            >
              {card.full_name || 'Your Name'}
            </h3>
            <p
              className={`${
                large ? 'text-base' : 'text-sm'
              } text-white/50`}
            >
              {card.job_title || 'Job Title'}
            </p>
            {card.company && (
              <p
                className={`${
                  large ? 'text-sm' : 'text-xs'
                } text-white/40`}
              >
                {card.company}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (template === 'custom') {
      return (
        <div
          className={`relative ${sizeH} flex flex-col justify-end ${sizePad} overflow-hidden`}
          style={{
            background: `linear-gradient(160deg, ${card.card_color}, ${accent})`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-40"
            aria-hidden="true"
            style={{ backgroundColor: accent }}
          />

          {photo ? (
            <img
              src={photo}
              alt={card.full_name}
              className={`absolute top-4 left-4 ${
                large ? 'w-20 h-20' : 'w-12 h-12'
              } rounded-full object-cover ring-2 ring-white/30`}
            />
          ) : (
            <div
              className={`absolute top-4 left-4 ${
                large ? 'w-20 h-20' : 'w-12 h-12'
              } rounded-full bg-white/20 backdrop-blur flex items-center justify-center`}
            >
              <span
                className={`${
                  large ? 'text-3xl' : 'text-xl'
                } font-bold text-white`}
              >
                {card.full_name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}

          <div
            className="relative text-right"
            style={{ fontFamily: font }}
          >
            <h3
              className={`${
                large ? 'text-2xl' : 'text-lg'
              } font-bold text-white`}
            >
              {card.full_name || 'Your Name'}
            </h3>
            <p
              className={`${
                large ? 'text-base' : 'text-sm'
              } text-white/80`}
            >
              {card.job_title || 'Job Title'}
            </p>
            <p
              className={`${
                large ? 'text-sm' : 'text-xs'
              } text-white/60`}
            >
              {card.company || 'Company'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative ${sizeH} flex flex-col justify-end ${sizePad}`}
        style={{
          background: `linear-gradient(135deg, ${card.card_color}, ${card.card_color}dd)`,
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt={card.full_name}
            className={`absolute top-4 right-4 ${
              large ? 'w-20 h-20' : 'w-12 h-12'
            } rounded-full object-cover ring-2 ring-white/30`}
          />
        ) : (
          <div
            className={`absolute top-4 right-4 ${
              large ? 'w-20 h-20' : 'w-12 h-12'
            } rounded-full bg-white/20 backdrop-blur flex items-center justify-center`}
          >
            <span
              className={`${
                large ? 'text-3xl' : 'text-xl'
              } font-bold text-white`}
            >
              {card.full_name.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        )}

        <div style={{ fontFamily: font }}>
          <h3
            className={`${
              large ? 'text-2xl' : 'text-lg'
            } font-bold text-white`}
          >
            {card.full_name || 'Your Name'}
          </h3>
          <p
            className={`${
              large ? 'text-base' : 'text-sm'
            } text-white/80`}
          >
            {card.job_title || 'Job Title'}
          </p>
          <p
            className={`${
              large ? 'text-sm' : 'text-xs'
            } text-white/60`}
          >
            {card.company || 'Company'}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <Spinner className="w-8 h-8" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {t('cards.title')}
          </h1>
          <p className="text-white/50">
            Create and share your digital business cards
          </p>
        </div>

        <GlassButton onClick={openCreate}>
          <Plus className="inline mr-2 w-5 h-5" />
          {t('cards.create')}
        </GlassButton>
      </div>

      {actionError && (
        <GlassCard
          variant="regular"
          className="mb-6 p-4 border border-digicon-error/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-digicon-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-white/80">{actionError}</p>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-white/40 hover:text-white"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      )}

      {cards.length === 0 ? (
        <GlassCard variant="regular" className="p-6">
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title={t('cards.noCards')}
            description="Design your first digital business card and start networking the smart way."
            action={
              <GlassButton onClick={openCreate}>
                <Plus className="inline mr-2 w-5 h-5" />
                {t('cards.create')}
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
              className="overflow-hidden animate-fade-in-up"
            >
              {renderCardPreview(card)}

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{card.share_count || 0} shares</span>
                  </div>

                  <Badge color={card.is_active ? 'green' : 'gray'}>
                    {card.is_active
                      ? t('cards.active')
                      : t('cards.inactive')}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWalletError(null);
                      setShareCard(card);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-glass-sm glass-thin text-white/70 hover:text-white text-sm transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('cards.share')}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(card)}
                    className="p-2 rounded-glass-sm glass-thin text-white/70 hover:text-white transition-all"
                    aria-label={`Edit ${card.full_name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteCard(card.id)}
                    disabled={deletingCardId === card.id}
                    className="p-2 rounded-glass-sm glass-thin text-digicon-error/70 hover:text-digicon-error transition-all disabled:opacity-50"
                    aria-label={`Delete ${card.full_name}`}
                  >
                    {deletingCardId === card.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void toggleActive(card)}
                  className="w-full mt-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {card.is_active ? 'Deactivate' : 'Activate'} card
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="card-form-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !savingCard && setShowForm(false)}
          />

          <GlassCard
            variant="chrome"
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in"
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                id="card-form-title"
                className="text-xl font-bold text-white"
              >
                {editingCard ? t('cards.edit') : t('cards.create')}
              </h2>

              <button
                type="button"
                onClick={() => !savingCard && setShowForm(false)}
                disabled={savingCard}
                className="p-2 rounded-glass-sm text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCard} className="space-y-5">
              {actionError && (
                <div className="p-3 rounded-glass-md bg-digicon-error/10 border border-digicon-error/20">
                  <p className="text-sm text-digicon-error">
                    {actionError}
                  </p>
                </div>
              )}

              <div>
                <GlassLabel>
                  <Palette className="inline w-4 h-4 mr-1" />
                  Design Template
                </GlassLabel>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(Object.keys(templateMeta) as DesignTemplate[]).map(
                    (template) => {
                      const meta = templateMeta[template];
                      const Icon = meta.icon;

                      return (
                        <button
                          key={template}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              design_template: template,
                            })
                          }
                          className={`flex flex-col items-center gap-1 p-3 rounded-glass-md transition-all ${
                            formData.design_template === template
                              ? 'glass-regular ring-2 ring-digicon-primary'
                              : 'glass-thin hover:bg-white/10'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              formData.design_template === template
                                ? 'text-digicon-primary'
                                : 'text-white/60'
                            }`}
                          />
                          <span className="text-xs font-medium text-white/80">
                            {meta.label}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>

                <p className="text-xs text-white/40 mt-2">
                  {templateMeta[formData.design_template].desc}
                </p>
              </div>

              <div>
                <GlassLabel>
                  <Camera className="inline w-4 h-4 mr-1" />
                  Profile Photo
                </GlassLabel>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full glass-thin flex items-center justify-center overflow-hidden">
                    {formData.photo_url ? (
                      <img
                        src={formData.photo_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white/40">
                        {formData.full_name.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <GlassButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-1" />
                        Upload
                      </>
                    )}
                  </GlassButton>

                  {formData.photo_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          photo_url: '',
                        })
                      }
                      className="text-xs text-white/40 hover:text-white/70"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className="text-xs text-white/30 mt-2">
                  JPG, PNG, WebP or GIF. Maximum 5 MB.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <GlassLabel>{t('cards.fullName')} *</GlassLabel>
                  <GlassInput
                    value={formData.full_name}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        full_name: event.target.value,
                      })
                    }
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <GlassLabel>{t('cards.jobTitle')}</GlassLabel>
                  <GlassInput
                    value={formData.job_title}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        job_title: event.target.value,
                      })
                    }
                    autoComplete="organization-title"
                  />
                </div>

                <div>
                  <GlassLabel>{t('cards.company')}</GlassLabel>
                  <GlassInput
                    value={formData.company}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        company: event.target.value,
                      })
                    }
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <GlassLabel>{t('cards.phone')}</GlassLabel>
                  <GlassInput
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        phone: event.target.value,
                      })
                    }
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                <div>
                  <GlassLabel>{t('cards.email')}</GlassLabel>
                  <GlassInput
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        email: event.target.value,
                      })
                    }
                    autoComplete="email"
                  />
                </div>

                <div>
                  <GlassLabel>{t('cards.website')}</GlassLabel>
                  <GlassInput
                    value={formData.website}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        website: event.target.value,
                      })
                    }
                    autoComplete="url"
                    inputMode="url"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <GlassLabel>{t('cards.address')}</GlassLabel>
                <GlassInput
                  value={formData.address}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      address: event.target.value,
                    })
                  }
                  autoComplete="street-address"
                />
              </div>

              <div>
                <GlassLabel>{t('cards.bio')}</GlassLabel>
                <GlassTextarea
                  rows={3}
                  value={formData.bio}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      bio: event.target.value,
                    })
                  }
                />
              </div>

              <div>
                <GlassLabel>
                  <Type className="inline w-4 h-4 mr-1" />
                  Font Family
                </GlassLabel>

                <GlassSelect
                  value={formData.font_family}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      font_family: event.target.value,
                    })
                  }
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </GlassSelect>
              </div>

              <div>
                <GlassLabel>Primary Color</GlassLabel>

                <div className="flex flex-wrap gap-2">
                  {cardColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          card_color: color,
                        })
                      }
                      className={`w-10 h-10 rounded-glass-md transition-all ${
                        formData.card_color === color
                          ? 'ring-2 ring-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>

              {(formData.design_template === 'custom' ||
                formData.design_template === 'futuristic') && (
                <div>
                  <GlassLabel>Accent Color</GlassLabel>

                  <div className="flex flex-wrap gap-2">
                    {cardColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            accent_color: color,
                          })
                        }
                        className={`w-10 h-10 rounded-glass-md transition-all ${
                          formData.accent_color === color
                            ? 'ring-2 ring-white scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select accent ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <GlassLabel>{t('cards.preview')}</GlassLabel>
                <div className="rounded-glass-lg overflow-hidden">
                  {renderCardPreview(formData, true)}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <GlassButton
                  type="submit"
                  className="flex-1"
                  disabled={savingCard || uploadingPhoto}
                >
                  {savingCard ? (
                    <>
                      <Spinner className="inline mr-2 w-4 h-4" />
                      Saving...
                    </>
                  ) : (
                    t('cards.save')
                  )}
                </GlassButton>

                <GlassButton
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  disabled={savingCard}
                >
                  {t('cards.cancel')}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {shareCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-card-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!walletLoading) {
                setShareCard(null);
                setWalletError(null);
              }
            }}
          />

          <GlassCard
            variant="chrome"
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-scale-in"
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                id="share-card-title"
                className="text-xl font-bold text-white"
              >
                {t('cards.share')}
              </h2>

              <button
                type="button"
                onClick={() => {
                  if (!walletLoading) {
                    setShareCard(null);
                    setWalletError(null);
                  }
                }}
                disabled={Boolean(walletLoading)}
                className="p-2 rounded-glass-sm text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white rounded-glass-lg mb-4">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={shareUrl}
                  size={180}
                  level="H"
                  includeMargin
                />
              </div>

              <p className="text-sm text-white/50">
                Scan this QR code to open the digital card.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GlassInput
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-sm"
                  aria-label="Digital card URL"
                  onFocus={(event) => event.currentTarget.select()}
                />

                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => void copyLink()}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </GlassButton>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={downloadQR}
                  className="flex flex-col items-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-xs">QR PNG</span>
                </button>

                <button
                  type="button"
                  onClick={shareSMS}
                  className="flex flex-col items-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs">SMS</span>
                </button>

                <button
                  type="button"
                  onClick={shareEmail}
                  className="flex flex-col items-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-xs">Email</span>
                </button>
              </div>

              <button
                type="button"
                onClick={downloadVCard}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Save Contact (vCard)</span>
              </button>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-digicon-primary" />
                  <h3 className="text-sm font-semibold text-white">
                    Save to Wallet
                  </h3>
                </div>

                <p className="text-xs text-white/40 mb-3">
                  Save this business card to your mobile wallet for quick
                  access and sharing.
                </p>

                {walletError && (
                  <div className="mb-3 p-3 rounded-glass-md bg-digicon-error/10 border border-digicon-error/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-digicon-error shrink-0 mt-0.5" />
                      <p className="text-xs text-white/70">
                        {walletError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleAppleWallet()}
                    disabled={Boolean(walletLoading)}
                    className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/80 hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait"
                    title="Add this business card to Apple Wallet"
                  >
                    {walletLoading === 'apple' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium">
                      {walletLoading === 'apple'
                        ? 'Creating...'
                        : 'Apple Wallet'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleGoogleWallet()}
                    disabled={Boolean(walletLoading)}
                    className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/80 hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait"
                    title="Add this business card to Google Wallet"
                  >
                    {walletLoading === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium">
                      {walletLoading === 'google'
                        ? 'Creating...'
                        : 'Google Wallet'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void markShared()}
              disabled={Boolean(walletLoading)}
              className="w-full mt-4 text-xs text-white/40 hover:text-white/60 transition-colors disabled:opacity-40"
            >
              Mark as shared to update eco stats
            </button>
          </GlassCard>
        </div>
      )}
    </AppLayout>
  );
}

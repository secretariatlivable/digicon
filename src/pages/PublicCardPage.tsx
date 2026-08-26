import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  Check,
  Download,
  Wallet,
} from 'lucide-react';
import { supabase, type BusinessCard } from '@/lib/supabase';
import {
  GlassCard,
  GlassInput,
  GlassLabel,
  GlassButton,
  Spinner,
} from '@/components/ui/Glass';

type DesignTemplate =
  | 'futuristic'
  | 'professional'
  | 'simple'
  | 'custom';

type FormData = {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  consent: boolean;
};

const EMPTY_FORM: FormData = {
  full_name: '',
  email: '',
  phone: '',
  company: '',
  job_title: '',
  consent: false,
};

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function normalizeUrl(url: string): string {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function downloadFile(
  content: BlobPart,
  filename: string,
  type: string,
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function PublicCardPage() {
  const { cardId } = useParams<{ cardId: string }>();

  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;

    const loadCard = async () => {
      if (!cardId) {
        setCard(null);
        setLoadError(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(false);

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('id', cardId)
        .eq('is_active', true)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Failed to load public business card:', error);
        setCard(null);
        setLoadError(true);
      } else {
        setCard((data as BusinessCard | null) ?? null);
      }

      setLoading(false);
    };

    void loadCard();

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  const updateForm = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!card || !formData.consent || saving) return;

    setSaving(true);

    try {
      const { error: contactError } = await supabase.from('contacts').insert({
        user_id: card.user_id,
        card_id: card.id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        job_title: formData.job_title.trim(),
        consent_given: true,
        consent_date: new Date().toISOString(),
        source: 'qr',
        status: 'new',
      });

      if (contactError) {
        throw contactError;
      }

      const { data: eco, error: ecoReadError } = await supabase
        .from('eco_stats')
        .select('contacts_saved')
        .eq('user_id', card.user_id)
        .maybeSingle();

      if (ecoReadError) {
        console.warn('Contact saved, but eco stats could not be read:', ecoReadError);
      } else if (eco) {
        const { error: ecoUpdateError } = await supabase
          .from('eco_stats')
          .update({
            contacts_saved: (eco.contacts_saved ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', card.user_id);

        if (ecoUpdateError) {
          console.warn(
            'Contact saved, but eco stats could not be updated:',
            ecoUpdateError,
          );
        }
      }

      setSaved(true);
      setShowContactForm(false);
    } catch (error) {
      console.error('Failed to save contact:', error);
      window.alert(
        'We could not save your contact details. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadVCard = () => {
    if (!card) return;

    const fields = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVCardValue(card.full_name)}`,
      card.job_title
        ? `TITLE:${escapeVCardValue(card.job_title)}`
        : '',
      card.company ? `ORG:${escapeVCardValue(card.company)}` : '',
      card.phone ? `TEL:${escapeVCardValue(card.phone)}` : '',
      card.email ? `EMAIL:${escapeVCardValue(card.email)}` : '',
      card.website
        ? `URL:${escapeVCardValue(normalizeUrl(card.website))}`
        : '',
      card.address
        ? `ADR:;;${escapeVCardValue(card.address)}`
        : '',
      card.bio ? `NOTE:${escapeVCardValue(card.bio)}` : '',
      'END:VCARD',
    ].filter(Boolean);

    const filename = `${card.full_name
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '') || 'digicon-contact'}.vcf`;

    downloadFile(
      `${fields.join('\r\n')}\r\n`,
      filename,
      'text/vcard;charset=utf-8',
    );
  };

  /**
   * Apple Wallet requires a cryptographically signed .pkpass bundle.
   * The browser cannot generate a valid signed pass by simply serializing
   * JSON, so this action downloads the card data as a JSON payload instead.
   */
  const downloadAppleWallet = () => {
    if (!card) return;

    const passData = {
      formatVersion: 1,
      passType: 'generic',
      organizationName: card.company || 'DigiCon',
      description: `${card.full_name} - Digital Business Card`,
      serialNumber: card.id,
      backgroundColor: 'rgb(0,0,0)',
      foregroundColor: 'rgb(255,255,255)',
      labelColor: 'rgb(255,255,255)',
      primaryFields: [
        {
          key: 'name',
          label: 'Name',
          value: card.full_name,
        },
        {
          key: 'title',
          label: 'Title',
          value: card.job_title,
        },
      ],
      secondaryFields: [
        {
          key: 'company',
          label: 'Company',
          value: card.company,
        },
        {
          key: 'phone',
          label: 'Phone',
          value: card.phone,
        },
        {
          key: 'email',
          label: 'Email',
          value: card.email,
        },
      ],
      auxiliaryFields: card.website
        ? [
            {
              key: 'website',
              label: 'Website',
              value: card.website,
            },
          ]
        : [],
    };

    downloadFile(
      JSON.stringify(passData, null, 2),
      `${card.full_name.replace(/\s+/g, '_') || 'digicon-card'}.apple-wallet.json`,
      'application/json;charset=utf-8',
    );
  };

  /**
   * A valid Google Wallet pass must be created through Google's Wallet API.
   * This browser-side JSON is therefore an export payload, not a Wallet pass.
   */
  const downloadGoogleWallet = () => {
    if (!card) return;

    const walletData = {
      id: card.id,
      classId: 'digicon-card',
      title: card.full_name,
      subtitle: card.job_title,
      textModulesData: [
        {
          header: 'Company',
          body: card.company,
        },
        {
          header: 'Phone',
          body: card.phone,
        },
        {
          header: 'Email',
          body: card.email,
        },
        {
          header: 'Website',
          body: card.website,
        },
      ],
      linksModuleData: {
        uris: [
          {
            uri: window.location.href,
            description: 'View Digital Card',
          },
        ],
      },
    };

    downloadFile(
      JSON.stringify(walletData, null, 2),
      `${card.full_name.replace(/\s+/g, '_') || 'digicon-card'}.google-wallet.json`,
      'application/json;charset=utf-8',
    );
  };

  const renderCard = () => {
    if (!card) return null;

    const template =
      (card.design_template as DesignTemplate) || 'professional';
    const font = card.font_family || 'Inter';
    const photo = card.photo_url || '';
    const cardColor = card.card_color || '#1C1C1E';
    const accent = card.accent_color || cardColor;

    const contactLinks = (
      <div className="bg-white/10 backdrop-blur p-6 space-y-3">
        {card.email && (
          <a
            href={`mailto:${card.email}`}
            className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span className="text-sm break-all">{card.email}</span>
          </a>
        )}

        {card.phone && (
          <a
            href={`tel:${card.phone}`}
            className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span className="text-sm">{card.phone}</span>
          </a>
        )}

        {card.website && (
          <a
            href={normalizeUrl(card.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="text-sm break-all">{card.website}</span>
          </a>
        )}

        {card.address && (
          <div className="flex items-start gap-3 text-white/90">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-sm">{card.address}</span>
          </div>
        )}
      </div>
    );

    const photoEl = photo ? (
      <img
        src={photo}
        alt={`${card.full_name}'s profile`}
        className="w-16 h-16 rounded-full object-cover ring-2 ring-white/40"
      />
    ) : (
      <div
        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-2xl font-bold text-white">
          {card.full_name.charAt(0).toUpperCase()}
        </span>
      </div>
    );

    if (template === 'futuristic') {
      return (
        <div
          className="relative rounded-glass-2xl overflow-hidden animate-scale-in"
          style={{
            background: `linear-gradient(135deg, ${cardColor}, ${accent})`,
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

          <div className="relative p-8">
            <div className="flex justify-end mb-4">{photoEl}</div>

            <h1
              className="text-2xl font-bold text-white tracking-tight"
              style={{ fontFamily: font }}
            >
              {card.full_name}
            </h1>

            {card.job_title && (
              <p
                className="text-white/90"
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

          {contactLinks}
        </div>
      );
    }

    if (template === 'simple') {
      return (
        <div className="rounded-glass-2xl overflow-hidden animate-scale-in bg-[#1C1C1E] border border-white/10">
          <div className="p-8">
            <div className="mb-4">{photoEl}</div>

            <h1
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: font }}
            >
              {card.full_name}
            </h1>

            {card.job_title && (
              <p
                className="text-white/50"
                style={{ fontFamily: font }}
              >
                {card.job_title}
              </p>
            )}

            {card.company && (
              <p
                className="text-white/40 text-sm"
                style={{ fontFamily: font }}
              >
                {card.company}
              </p>
            )}
          </div>

          {contactLinks}
        </div>
      );
    }

    if (template === 'custom') {
      return (
        <div
          className="relative rounded-glass-2xl overflow-hidden animate-scale-in"
          style={{
            background: `linear-gradient(160deg, ${cardColor}, ${accent})`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-40"
            aria-hidden="true"
            style={{ backgroundColor: accent }}
          />

          <div className="relative p-8">
            <div className="mb-4">{photoEl}</div>

            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: font }}
            >
              {card.full_name}
            </h1>

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

          {contactLinks}
        </div>
      );
    }

    return (
      <div
        className="rounded-glass-2xl overflow-hidden animate-scale-in"
        style={{
          background: `linear-gradient(135deg, ${cardColor}, ${cardColor}cc)`,
        }}
      >
        <div className="p-8">
          <div className="flex justify-end mb-4">{photoEl}</div>

          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: font }}
          >
            {card.full_name}
          </h1>

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

        {contactLinks}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <img
            src="/DigiCon_logo_transparent.jpg"
            alt="DigiCon logo"
            className="w-12 h-12 rounded-full mx-auto mb-4 opacity-30"
          />

          <h1 className="text-xl font-bold text-white mb-2">
            {loadError ? 'Unable to Load Card' : 'Card Not Found'}
          </h1>

          <p className="text-white/50">
            {loadError
              ? 'Something went wrong while loading this business card. Please try again.'
              : 'This business card may have been deactivated or does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Full-width banner */}
      <section className="relative w-full overflow-hidden">
        <img
          src="/DigiCon_Banner.png"
          alt="DigiCon digital business cards and CRM automation platform"
          className="w-full h-auto block"
        />
      </section>

      <main className="min-h-screen flex items-center justify-center px-4 py-8 relative">
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
            style={{
              backgroundColor: `${card.card_color || '#ffffff'}30`,
            }}
          />
        </div>

        <div className="relative w-full max-w-md space-y-4">
          {renderCard()}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadVCard}
              className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
              aria-label="Save contact"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Save Contact</span>
            </button>

            <button
              type="button"
              onClick={() => setShowContactForm((visible) => !visible)}
              className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
              aria-expanded={showContactForm}
              aria-controls="share-contact-form"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">Share My Info</span>
            </button>
          </div>

          {/* Wallet export payloads */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadAppleWallet}
              className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
              title="Download Apple Wallet-compatible pass data"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Apple Wallet Data</span>
            </button>

            <button
              type="button"
              onClick={downloadGoogleWallet}
              className="flex items-center justify-center gap-2 p-3 rounded-glass-md glass-thin text-white/70 hover:text-white transition-all"
              title="Download Google Wallet-compatible pass data"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Google Wallet Data</span>
            </button>
          </div>

          {/* Save contact form */}
          {showContactForm && !saved && (
            <GlassCard
              id="share-contact-form"
              variant="chrome"
              className="p-6 animate-fade-in-up"
            >
              <h2 className="text-lg font-semibold text-white mb-1">
                Share Your Details
              </h2>

              <p className="text-sm text-white/50 mb-4">
                Share your contact info with {card.full_name.split(' ')[0]}.
              </p>

              <form onSubmit={saveContact} className="space-y-3">
                <div>
                  <GlassLabel>Your Name *</GlassLabel>
                  <GlassInput
                    value={formData.full_name}
                    onChange={(event) =>
                      updateForm('full_name', event.target.value)
                    }
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <GlassLabel>Email</GlassLabel>
                    <GlassInput
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        updateForm('email', event.target.value)
                      }
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <GlassLabel>Phone</GlassLabel>
                    <GlassInput
                      value={formData.phone}
                      onChange={(event) =>
                        updateForm('phone', event.target.value)
                      }
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <GlassLabel>Company</GlassLabel>
                    <GlassInput
                      value={formData.company}
                      onChange={(event) =>
                        updateForm('company', event.target.value)
                      }
                      autoComplete="organization"
                    />
                  </div>

                  <div>
                    <GlassLabel>Job Title</GlassLabel>
                    <GlassInput
                      value={formData.job_title}
                      onChange={(event) =>
                        updateForm('job_title', event.target.value)
                      }
                      autoComplete="organization-title"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-glass-sm glass-thin">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(event) =>
                      updateForm('consent', event.target.checked)
                    }
                    className="w-5 h-5 rounded accent-digicon-primary mt-0.5 shrink-0"
                    required
                  />

                  <span className="text-xs text-white/60">
                    I consent to my contact information being stored and used
                    by {card.full_name} in accordance with the Data Privacy
                    Act of the Philippines.
                  </span>
                </label>

                <GlassButton
                  type="submit"
                  className="w-full"
                  disabled={!formData.consent || saving}
                >
                  {saving ? (
                    <Spinner className="inline mr-2 w-4 h-4" />
                  ) : (
                    <Save className="inline mr-2 w-4 h-4" />
                  )}
                  {saving ? 'Sharing...' : 'Share My Contact'}
                </GlassButton>
              </form>
            </GlassCard>
          )}

          {saved && (
            <GlassCard
              variant="chrome"
              className="p-8 text-center animate-scale-in"
            >
              <div className="w-16 h-16 rounded-glass-xl glass-chrome flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-digicon-eco" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Contact Shared!
              </h2>

              <p className="text-white/50 text-sm">
                Your details have been sent to {card.full_name}.
              </p>
            </GlassCard>
          )}

          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-white/30 text-xs">
              <img
                src="/DigiCon_logo_transparent.jpg"
                alt="DigiCon logo"
                className="w-4 h-4 rounded-full"
              />
              Powered by DigiCon
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

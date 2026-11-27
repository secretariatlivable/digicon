import { QRCodeSVG } from 'qrcode.react';
import {
  Globe, Mail, MapPin, Phone, type LucideProps,
} from 'lucide-react';
import { type ComponentType } from 'react';

/**
 * The DigiCon card — portrait.
 *
 * One component renders the card everywhere it appears: the editor's live
 * preview, the card list, and the public page a stranger opens from a QR. That
 * matters more than it sounds — previously the preview and the public page were
 * separate markup, so what you designed was never quite what your contact saw.
 *
 * Portrait by deliberate choice. A landscape card is a skeuomorph of the paper
 * rectangle it replaces; it wastes the vertical space every phone actually has,
 * and it forces contact details into cramped rows. Portrait gives the photo
 * real presence and lets each contact method be a full-width tap target — which
 * is what someone does with a card on a phone: tap it, not read it.
 */

export type DigiConCardData = {
  full_name: string;
  job_title?: string | null;
  company?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  linkedin_url?: string | null;
  photo_url?: string | null;
  card_color?: string | null;
  accent_color?: string | null;
};

type DigiConCardProps = {
  card: DigiConCardData;
  /** Public URL — renders the QR when present. */
  shareUrl?: string;
  /** `preview` is non-interactive (editor/list); `live` has working links. */
  variant?: 'preview' | 'live';
  /** Footer slot for actions on the public page. */
  footer?: React.ReactNode;
  className?: string;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^[a-z][a-z\d+\-.]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** A contact method as a full-width tap target. */
function ContactRow({
  icon: Icon,
  label,
  href,
  interactive,
  emphasis = false,
  accent,
}: {
  icon: ComponentType<LucideProps>;
  label: string;
  href?: string;
  interactive: boolean;
  emphasis?: boolean;
  accent: string;
}) {
  const content = (
    <>
      <Icon
        className="h-4 w-4 flex-shrink-0"
        style={{ color: emphasis ? '#fff' : accent }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
    </>
  );

  const base =
    'flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-transform';
  const style = emphasis
    ? { background: accent, color: '#fff' }
    : { background: 'rgb(var(--surface-2))', color: 'rgb(var(--ink))' };

  if (interactive && href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={`${base} hover:-translate-y-0.5`}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={base} style={style}>
      {content}
    </span>
  );
}

export function DigiConCard({
  card,
  shareUrl,
  variant = 'preview',
  footer,
  className = '',
}: DigiConCardProps) {
  const interactive = variant === 'live';
  const accent = card.card_color || '#007AFF';
  const accent2 = card.accent_color || accent;
  const website = card.website ? normalizeWebsite(card.website) : '';

  return (
    <article
      className={`metal mx-auto w-full max-w-sm overflow-hidden !p-0 ${className}`}
      aria-label={`Digital card for ${card.full_name}`}
    >
      {/* Colour band — the card's identity, and the anchor for the avatar */}
      <div
        className="relative h-28"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: 'var(--metal-sheen)' }}
          aria-hidden="true"
        />
        <p className="absolute left-5 top-4 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/75">
          DigiCon
        </p>
      </div>

      {/* Avatar straddles the band, as in the reference */}
      <div className="-mt-12 flex justify-center">
        {card.photo_url ? (
          <img
            src={card.photo_url}
            alt=""
            className="h-24 w-24 rounded-full object-cover ring-4 ring-surface-1"
            loading="lazy"
            decoding="async"
          />
        ) : (
          /* Filled with the card surface rather than the band gradient: an
             avatar painted in the same colour it overlaps reads as a
             semicircle, because only the half below the band has contrast. */
          <span
            className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-1 text-2xl font-bold shadow-lg ring-4 ring-surface-1"
            style={{ color: accent }}
            aria-hidden="true"
          >
            {initials(card.full_name) || 'DC'}
          </span>
        )}
      </div>

      <div className="px-5 pb-5 pt-4 text-center sm:px-6">
        <h3 className="text-xl font-bold leading-tight text-ink">
          {card.full_name || 'Your name'}
        </h3>

        {(card.job_title || card.company) && (
          <p className="mt-1 text-sm text-ink-2">
            {[card.job_title, card.company].filter(Boolean).join(' · ')}
          </p>
        )}

        {card.bio && (
          <p className="mx-auto mt-3 max-w-[34ch] text-xs leading-relaxed text-ink-3">
            {card.bio}
          </p>
        )}

        <div className="mt-5 space-y-2 text-left">
          {card.email && (
            <ContactRow
              icon={Mail}
              label={card.email}
              href={`mailto:${card.email}`}
              interactive={interactive}
              emphasis
              accent={accent}
            />
          )}
          {card.phone && (
            <ContactRow
              icon={Phone}
              label={card.phone}
              href={`tel:${card.phone}`}
              interactive={interactive}
              accent={accent}
            />
          )}
          {website && (
            <ContactRow
              icon={Globe}
              label={card.website ?? ''}
              href={website}
              interactive={interactive}
              accent={accent}
            />
          )}
          {card.linkedin_url && (
            <ContactRow
              icon={Globe}
              label="LinkedIn"
              href={card.linkedin_url}
              interactive={interactive}
              accent={accent}
            />
          )}
          {card.address && (
            <ContactRow
              icon={MapPin}
              label={card.address}
              interactive={false}
              accent={accent}
            />
          )}
        </div>

        {/* The QR belongs on the card itself — it is how the card is handed
            over in person, so it should never be hidden behind a menu. */}
        {shareUrl && (
          <div className="mt-5 border-t border-line/30 pt-5">
            <div className="mx-auto w-fit rounded-glass-lg bg-white p-3">
              <QRCodeSVG value={shareUrl} size={116} level="M" />
            </div>
            <p className="mt-2.5 text-[0.68rem] text-ink-3">Scan to save this identity</p>
          </div>
        )}

        {footer && <div className="mt-5 border-t border-line/30 pt-4">{footer}</div>}
      </div>
    </article>
  );
}

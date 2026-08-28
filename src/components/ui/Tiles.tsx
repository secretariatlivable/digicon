import { type ComponentType, type ReactNode } from 'react';
import { type LucideProps } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

export type Accent = 'primary' | 'info' | 'violet' | 'eco' | 'gold' | 'secondary';

/**
 * Accent tokens. Tailwind needs whole class names at build time, so accents are
 * enumerated here rather than interpolated — this is the one place colour
 * variants are defined for the whole tile family.
 */
export const ACCENT: Record<Accent, { text: string; ring: string; bg: string; glow: string }> = {
  primary:   { text: 'text-digicon-primary',   ring: 'ring-digicon-primary/40',   bg: 'bg-digicon-primary/12',   glow: 'bg-digicon-primary/25' },
  info:      { text: 'text-digicon-info',      ring: 'ring-digicon-info/40',      bg: 'bg-digicon-info/12',      glow: 'bg-digicon-info/25' },
  violet:    { text: 'text-digicon-violet',    ring: 'ring-digicon-violet/40',    bg: 'bg-digicon-violet/12',    glow: 'bg-digicon-violet/25' },
  eco:       { text: 'text-digicon-eco',       ring: 'ring-digicon-eco/40',       bg: 'bg-digicon-eco/12',       glow: 'bg-digicon-eco/25' },
  gold:      { text: 'text-digicon-gold',      ring: 'ring-digicon-gold/40',      bg: 'bg-digicon-gold/12',      glow: 'bg-digicon-gold/25' },
  secondary: { text: 'text-digicon-secondary', ring: 'ring-digicon-secondary/40', bg: 'bg-digicon-secondary/12', glow: 'bg-digicon-secondary/25' },
};

/** The rounded, glowing icon chip used at the top of every card in the system. */
export function IconChip({
  icon: Icon,
  accent = 'info',
  size = 'md',
  className = '',
}: {
  icon: ComponentType<LucideProps>;
  accent?: Accent;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const a = ACCENT[accent];
  const box = { sm: 'w-10 h-10 rounded-glass-md', md: 'w-12 h-12 rounded-glass-lg', lg: 'w-14 h-14 rounded-glass-lg' }[size];
  const glyph = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-7 h-7' }[size];

  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center ring-1 ${box} ${a.bg} ${a.ring} ${className}`}
      aria-hidden="true"
    >
      <Icon className={`${glyph} ${a.text}`} />
    </span>
  );
}

type FeatureCardProps = {
  icon: ComponentType<LucideProps>;
  title: ReactNode;
  children: ReactNode;
  accent?: Accent;
  /** Optional footer line — a CTA label or supporting note. */
  footer?: ReactNode;
  delay?: number;
  className?: string;
};

/** Standard metallic feature card. Used across features, audiences and steps. */
export function FeatureCard({
  icon,
  title,
  children,
  accent = 'info',
  footer,
  delay = 0,
  className = '',
}: FeatureCardProps) {
  return (
    <Reveal delay={delay} className={`h-full ${className}`}>
      <article className="metal metal-sheen h-full p-6 transition-transform duration-500 hover:-translate-y-1">
        <IconChip icon={icon} accent={accent} />
        <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
        <div className="mt-2 text-sm leading-relaxed text-white/60">{children}</div>
        {footer && <div className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-digicon-info">{footer}</div>}
      </article>
    </Reveal>
  );
}

/** Numbered step card for the "How it works" sequence. */
export function StepCard({
  step,
  title,
  children,
  icon,
  accent = 'info',
  delay = 0,
}: {
  step: string;
  title: ReactNode;
  children: ReactNode;
  icon: ComponentType<LucideProps>;
  accent?: Accent;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="metal metal-sheen relative h-full p-6 pt-7">
        <span
          className={`absolute right-5 top-5 font-mono text-xs tracking-[0.2em] ${ACCENT[accent].text}`}
          aria-hidden="true"
        >
          {step}
        </span>
        <IconChip icon={icon} accent={accent} size="sm" />
        <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{children}</p>
      </article>
    </Reveal>
  );
}

/** Compact statistic tile. */
export function StatTile({
  value,
  label,
  icon: Icon,
  accent = 'info',
}: {
  value: ReactNode;
  label: string;
  icon?: ComponentType<LucideProps>;
  accent?: Accent;
}) {
  const a = ACCENT[accent];
  return (
    <div className="glass-thin rounded-glass-lg p-4 text-center">
      {Icon && <Icon className={`mx-auto mb-2 h-5 w-5 ${a.text}`} aria-hidden="true" />}
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-white/50">{label}</p>
    </div>
  );
}

/** A short list of affirmative points — the "Create → Share → Connect" rhythm. */
export function CheckList({
  items,
  accent = 'eco',
  className = '',
}: {
  items: string[];
  accent?: Accent;
  className?: string;
}) {
  const a = ACCENT[accent];
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
          <span
            className={`mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current ${a.text}`}
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** The DigiCon vocabulary pill — "Connections", not "Contacts". */
export function TermPill({ children, accent = 'info' }: { children: ReactNode; accent?: Accent }) {
  const a = ACCENT[accent];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${a.bg} ${a.ring} ${a.text}`}
    >
      {children}
    </span>
  );
}

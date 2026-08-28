import { type ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';

type SectionProps = {
  id?: string;
  children: ReactNode;
  /** Adds the faint top/bottom rules that separate major movements. */
  bordered?: boolean;
  /** Vertical rhythm. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Constrains the inner container. */
  width?: 'narrow' | 'default' | 'wide' | 'full';
  'aria-labelledby'?: string;
};

const SIZE: Record<NonNullable<SectionProps['size']>, string> = {
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-24',
  lg: 'py-20 sm:py-32',
};

const WIDTH: Record<NonNullable<SectionProps['width']>, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

/** The single layout wrapper every landing section uses. */
export function Section({
  id,
  children,
  bordered = false,
  size = 'md',
  width = 'default',
  className = '',
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative px-4 sm:px-6 lg:px-8 ${SIZE[size]} ${
        bordered ? 'border-t border-white/[0.06]' : ''
      } ${className}`}
      {...rest}
    >
      <div className={`mx-auto ${WIDTH[width]}`}>{children}</div>
    </section>
  );
}

type HeadingProps = {
  /** Small uppercase label above the heading. */
  kicker?: string;
  title: ReactNode;
  /** Supporting line under the heading. */
  lede?: ReactNode;
  align?: 'left' | 'center';
  /** Pass through so the parent section can be aria-labelledby it. */
  id?: string;
  level?: 2 | 3;
  className?: string;
};

/** Consistent section heading: kicker → title → lede. */
export function SectionHeading({
  kicker,
  title,
  lede,
  align = 'center',
  id,
  level = 2,
  className = '',
}: HeadingProps) {
  const Tag = (`h${level}` as const) satisfies 'h2' | 'h3';
  const centred = align === 'center';

  return (
    <Reveal className={`${centred ? 'text-center mx-auto' : 'text-left'} ${className}`}>
      {kicker && (
        <p
          className={`flex items-center gap-3 mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-digicon-info ${
            centred ? 'justify-center' : ''
          }`}
        >
          {centred && <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-digicon-info" />}
          {kicker}
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-digicon-info" />
        </p>
      )}

      <Tag id={id} className="text-display-sm font-bold text-white text-balance">
        {title}
      </Tag>

      {lede && (
        <p
          className={`mt-4 text-lede text-white/60 ${centred ? 'mx-auto max-w-prose' : 'max-w-prose'}`}
        >
          {lede}
        </p>
      )}
    </Reveal>
  );
}

/** Emphasised gradient run inside a heading. */
export function Hl({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-digicon-info via-digicon-primary to-digicon-violet bg-clip-text text-transparent">
      {children}
    </span>
  );
}

/**
 * A short, punchy statement set apart from the body copy — the attached web
 * copy leans on these repeatedly ("Your card is the beginning.").
 */
export function Pullquote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`border-l-2 border-digicon-info/60 pl-4 sm:pl-5 text-lg sm:text-xl font-medium text-white/85 leading-snug ${className}`}
    >
      {children}
    </p>
  );
}

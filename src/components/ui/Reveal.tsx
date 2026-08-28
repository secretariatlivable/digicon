import { type ElementType, type ReactNode } from 'react';
import { useReveal } from '@/lib/motion';

type RevealProps = {
  children: ReactNode;
  /** Direction the element travels from. */
  from?: 'up' | 'left' | 'right' | 'scale';
  /** Stagger, in milliseconds — use the item index for list animations. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

const FROM_CLASS: Record<NonNullable<RevealProps['from']>, string> = {
  up: '',
  left: 'reveal--left',
  right: 'reveal--right',
  scale: 'reveal--scale',
};

/**
 * Scroll-triggered entrance. Single source of truth for reveal motion across
 * the site — automatically inert when the visitor prefers reduced motion or
 * turns on calm mode in the accessibility panel.
 */
export function Reveal({
  children,
  from = 'up',
  delay = 0,
  as: Tag = 'div',
  className = '',
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={`reveal ${FROM_CLASS[from]} ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

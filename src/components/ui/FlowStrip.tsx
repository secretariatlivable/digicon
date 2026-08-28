import { type ComponentType } from 'react';
import { ChevronRight, type LucideProps } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { ACCENT, type Accent } from '@/components/ui/Tiles';

export type FlowStep = {
  label: string;
  icon: ComponentType<LucideProps>;
  accent?: Accent;
  /** Anchor to the matching section, so the strip doubles as navigation. */
  href?: string;
};

/**
 * The DigiCon journey rendered as a single horizontal strip:
 * Create → Share → Connect → Remember → Follow Up.
 *
 * Semantically an ordered list, so a screen reader hears it as the sequence it
 * is; the chevrons between steps are decorative.
 */
export function FlowStrip({ steps, className = '' }: { steps: FlowStep[]; className?: string }) {
  return (
    <Reveal className={className}>
      <ol className="metal flex flex-wrap items-stretch justify-center gap-1 p-2 sm:gap-2">
        {steps.map((step, i) => {
          const a = ACCENT[step.accent ?? 'info'];
          const Icon = step.icon;
          const inner = (
            <>
              <Icon className={`h-4 w-4 ${a.text}`} aria-hidden="true" />
              <span className="whitespace-nowrap">{step.label}</span>
            </>
          );

          return (
            <li key={step.label} className="flex items-center">
              {step.href ? (
                <a
                  href={step.href}
                  className="flex items-center gap-2 rounded-glass-md px-3 py-2.5 text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white sm:text-sm"
                >
                  {inner}
                </a>
              ) : (
                <span className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-white/75 sm:text-sm">
                  {inner}
                </span>
              )}
              {i < steps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-white/25" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}

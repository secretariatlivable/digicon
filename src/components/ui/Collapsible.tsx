import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type CollapsibleProps = {
  /** The always-visible summary line. */
  label: ReactNode;
  children: ReactNode;
  /** Start open — use for the first item in an FAQ-style stack. */
  defaultOpen?: boolean;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Compact variant for use inside cards. */
  dense?: boolean;
  className?: string;
};

/**
 * Progressive-disclosure block. Height animates via grid-template-rows so the
 * content is measured by the browser — no magic max-height numbers that clip
 * long copy at larger text sizes.
 */
export function Collapsible({
  label,
  children,
  defaultOpen = false,
  icon,
  dense = false,
  className = '',
}: CollapsibleProps) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border-t border-white/10 first:border-t-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 text-left text-white transition-colors hover:text-digicon-info ${
          dense ? 'py-3' : 'py-4'
        }`}
      >
        {icon && <span className="flex-shrink-0 text-digicon-info">{icon}</span>}
        <span className={`flex-1 font-semibold ${dense ? 'text-sm' : 'text-base'}`}>{label}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-digicon-info collapse__chev ${
            open ? 'collapse__chev--open' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <div id={id} className={`collapse__body ${open ? 'collapse__body--open' : ''}`} role="region">
        <div>
          <div className={`text-white/60 leading-relaxed ${dense ? 'pb-3 text-sm' : 'pb-5'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A stack of collapsibles with consistent spacing and a shared surface. */
export function CollapsibleGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`metal metal-sheen px-5 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

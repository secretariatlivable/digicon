import { useId, useState, type ReactNode } from 'react';

type TooltipProps = {
  /** The trigger — usually a word in the copy or an icon button. */
  children: ReactNode;
  /** Short explanation. Keep it to a sentence or two. */
  content: ReactNode;
  /** Optional bolded heading inside the bubble. */
  title?: string;
  className?: string;
};

/**
 * Accessible tooltip.
 *
 * Opens on hover, on keyboard focus, and on tap (touch devices have no hover,
 * so the trigger is a real button that toggles). Escape closes it, and the
 * bubble is wired to the trigger with aria-describedby so screen readers
 * announce it rather than skipping past it.
 */
export function Tooltip({ children, content, title, className = '' }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className={`tip ${className}`}>
      <button
        type="button"
        className="tip__anchor bg-transparent border-0 p-0 text-inherit font-inherit"
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        {children}
      </button>
      <span id={id} role="tooltip" className={`tip__bubble ${open ? 'tip__bubble--open' : ''}`}>
        {title && (
          <strong className="block mb-1 text-[0.68rem] uppercase tracking-[0.12em] text-digicon-info">
            {title}
          </strong>
        )}
        {content}
      </span>
    </span>
  );
}

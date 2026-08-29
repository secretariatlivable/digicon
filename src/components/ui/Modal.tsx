import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal, rendered through a portal to `document.body`.
 *
 * Why a portal rather than a higher z-index: `AppLayout`'s `<main>` carries
 * `relative z-10`, which opens a **stacking context**. Anything rendered inside
 * it — however high its own z-index — is composited *within* that context, so a
 * `z-50` dialog still painted underneath the `z-40` sidebar. That is exactly
 * the bug where the sidebar covered the card editor's labels and fields.
 *
 * Raising the dialog's z-index cannot fix that; escaping the subtree can. The
 * portal also means this keeps working if anyone later adds a `transform`,
 * `filter` or `will-change` anywhere up the tree — each of which silently
 * creates a stacking context too.
 *
 * Along the way it picks up the dialog behaviour that was missing: focus moved
 * in on open and restored on close, focus trapped while open, Escape to
 * dismiss, background scroll locked, and proper dialog semantics.
 */

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Small line above the title. */
  eyebrow?: ReactNode;
  /** Supporting line under the title. */
  description?: ReactNode;
  children: ReactNode;
  /** Sticky footer — actions live here so they stay reachable while scrolling. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Set false for destructive confirmations that need a deliberate choice. */
  dismissOnBackdrop?: boolean;
};

const SIZE: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  footer,
  size = 'lg',
  dismissOnBackdrop = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);

      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown, true);

    // Focus the first control rather than the panel, so keyboard users land on
    // something actionable instead of having to tab past the heading.
    const timer = window.setTimeout(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    }, 20);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown, true);
      window.clearTimeout(timer);
      restoreFocusTo.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={dismissOnBackdrop ? onClose : undefined}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`metal relative my-auto w-full ${SIZE[size]} animate-scale-in overflow-hidden`}
      >
        <header className="flex items-start gap-4 border-b border-line/30 p-5 sm:p-6">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-digicon-info">
                {eyebrow}
              </p>
            )}
            <h2 className="text-xl font-bold text-ink">{title}</h2>
            {description && <p className="mt-1.5 text-sm text-ink-3">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-ink/10 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="max-h-[70dvh] overflow-y-auto p-5 sm:p-6">{children}</div>

        {footer && (
          <footer className="border-t border-line/30 bg-surface-2/40 p-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

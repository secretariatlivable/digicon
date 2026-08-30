import { useEffect } from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

/**
 * Keeps hash navigation reliable for DigiCon's public narrative sections.
 *
 * Landing/support navigation is section-based, while React Router owns page
 * navigation. When a deep link includes a hash, this hook waits until the
 * target exists and then scrolls/focuses it.
 */
export function useHashLanding(): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }

    let id: string;

    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      // Ignore malformed URL fragments rather than breaking navigation.
      return;
    }

    if (!id) {
      return;
    }

    let frame = 0;
    let attempts = 0;
    let cancelled = false;

    const reveal = () => {
      if (cancelled) {
        return;
      }

      const target = document.getElementById(id);

      if (target) {
        const reducedMotion =
          window.matchMedia?.(
            '(prefers-reduced-motion: reduce)',
          ).matches ?? false;

        target.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });

        /*
         * Make the target programmatically focusable so keyboard and
         * assistive-technology users are moved to the navigated section.
         */
        const hadTabIndex = target.hasAttribute('tabindex');

        if (!hadTabIndex) {
          target.setAttribute('tabindex', '-1');
        }

        target.focus({ preventScroll: true });

        /*
         * Avoid permanently changing the page's accessibility semantics.
         */
        if (!hadTabIndex) {
          target.addEventListener(
            'blur',
            () => {
              target.removeAttribute('tabindex');
            },
            { once: true },
          );
        }

        return;
      }

      attempts += 1;

      if (attempts < 20) {
        frame = window.requestAnimationFrame(reveal);
      }
    };

    frame = window.requestAnimationFrame(reveal);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);
}

/**
 * Creates a route-aware section navigation function.
 *
 * Example:
 *
 *   const navigateToSection = useSectionNavigation();
 *   navigateToSection('features');
 *
 * Produces:
 *
 *   /#features
 */
export function useSectionNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (id: string, targetPathname = pathname): void => {
    const normalizedId = id.trim();

    if (!normalizedId) {
      return;
    }

    const encodedId = encodeURIComponent(normalizedId);

    navigate(`${targetPathname}#${encodedId}`);
  };
}

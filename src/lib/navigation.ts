import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Keeps hash navigation reliable for DigiCon's public narrative sections.
 *
 * Landing/support navigation is section-based, while React Router owns page
 * navigation. When a deep link includes a hash, this hook waits until the
 * target exists and then scrolls/focuses it.
 */
export function useHashLanding() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;

    let frame = 0;
    let attempts = 0;

    const reveal = () => {
      const target = document.getElementById(id);
      if (target) {
        const reduced =
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        return;
      }

      if (attempts++ < 20) {
        frame = window.requestAnimationFrame(reveal);
      }
    };

    frame = window.requestAnimationFrame(reveal);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);
}

/**
 * Optional route-aware section navigation helper for callers that need to
 * update the browser URL while retaining a section target.
 */
export function useSectionNavigation() {
  const navigate = useNavigate();

  return (id: string, pathname = window.location.pathname) => {
    navigate(`${pathname}#${encodeURIComponent(id)}`);
  };
}

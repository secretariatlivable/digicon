import { useEffect, useRef, useState } from 'react';

/**
 * True when the visitor (or their OS) has asked for less motion.
 * Every animated component in the system checks this before it moves.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

type RevealOptions = {
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
  /** Reveal a little before the element reaches the viewport edge. */
  rootMargin?: string;
  /** Re-hide when scrolled back out of view. Off by default — less jitter. */
  once?: boolean;
};

/**
 * Reveal-on-scroll. Returns a ref to attach and whether the element is in view.
 * Degrades to "always visible" when IntersectionObserver is unavailable or
 * motion is not welcome, so content is never trapped behind an animation.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, reduced]);

  return { ref, visible } as const;
}

/**
 * Tracks which section id is currently in view — powers the active state on the
 * mobile bottom navigation and the desktop nav.
 */
export function useActiveSection(ids: string[], rootMargin = '-45% 0px -50% 0px') {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin, threshold: 0 },
    );

    ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return active;
}

/** Smooth-scroll to a section, respecting reduced-motion. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  // move keyboard focus with the scroll so the jump is real for AT users
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

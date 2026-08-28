import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { usePrefersReducedMotion } from '@/lib/motion';
import { useA11y } from '@/lib/a11y';

type AmbientVideoProps = {
  /** Base name in /public/media — expects `<name>.webm`, `.mp4` and `-poster.jpg`. */
  name?: string;
  /** Show the play/pause control. Required by WCAG 2.2.2 for anything that
   *  autoplays for more than five seconds. */
  controls?: boolean;
  className?: string;
};

/**
 * Decorative ambient loop behind the hero.
 *
 * Muted, inline, and playsInline so mobile browsers allow autoplay; poster-only
 * when the visitor prefers reduced motion or the connection reports as slow, so
 * we never spend a metered megabyte on decoration. Always `aria-hidden` — it
 * carries no information the copy does not already state.
 */
export function AmbientVideo({ name = 'hero-loop', controls = true, className = '' }: AmbientVideoProps) {
  const osReduced = usePrefersReducedMotion();
  const { settings } = useA11y();
  // Calm mode in the accessibility panel stops the loop just as firmly as the
  // OS-level preference does.
  const reduced = osReduced || settings.calm;
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(!reduced);
  const [allowed, setAllowed] = useState(!reduced);

  useEffect(() => {
    if (reduced) {
      setAllowed(false);
      setPlaying(false);
      return;
    }
    // respect Data Saver and 2G/3G connections
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const frugal = conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? '');
    setAllowed(!frugal);
    setPlaying(!frugal);
  }, [reduced]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const poster = `/media/${name}-poster.jpg`;

  return (
    /* The wrapper stays exposed so the pause control below is reachable;
       every decorative layer inside is individually hidden from AT. */
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {allowed ? (
        <video
          ref={ref}
          className="absolute inset-0 w-full h-full object-cover"
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={`/media/${name}.webm`} type="video/webm" />
          <source src={`/media/${name}.mp4`} type="video/mp4" />
        </video>
      ) : (
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Legibility scrim — the hero copy sits on top of this */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-digicon-ink/35 via-digicon-ink/70 to-digicon-ink"
        aria-hidden="true"
      />
      <div className="banner__grain" aria-hidden="true" />

      {allowed && controls && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause background animation' : 'Play background animation'}
          className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/80 backdrop-blur transition hover:text-white hover:bg-black/65"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

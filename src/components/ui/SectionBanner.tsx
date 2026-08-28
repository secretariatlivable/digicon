import { type ReactNode } from 'react';

/**
 * Banner registry.
 *
 * Every section image in the product resolves through this map. Each entry
 * ships an ultra-HD (2400px) master and a 1200px mobile variant, wired up with
 * `srcSet`/`sizes` so phones never download the desktop file.
 *
 * Replacing the art direction later is a one-file change: drop new
 * `<slug>-2400.jpg` / `<slug>-1200.jpg` pairs into /public/media/banners and
 * update the `alt` text here. Nothing else in the codebase references the paths.
 */
export const BANNERS = {
  hero: 'Light trails converging across a dark field, forming a network of connected points',
  problem: 'Fragments of glass scattered in low light, a scene breaking apart',
  bigidea: 'Long luminous paths flowing left to right, joined by bright waypoints',
  platform: 'Concentric rings of light radiating from a single bright centre',
  create: 'A single point of violet light surrounded by widening rings',
  share: 'Streams of blue light moving outward at speed',
  connect: 'Two fields of light meeting in the centre and linking together',
  capture: 'Warm shards of light held suspended in a dark field',
  manage: 'A luminous grid receding towards the horizon in an ordered pattern',
  followup: 'Green paths of light curving forward through the dark',
  graph: 'A dense constellation of connected nodes filling the frame',
  professionals: 'A single warm focal light within a cool blue field',
  teams: 'Several clusters of green and blue light linked into one structure',
  organizations: 'A wide structured lattice lit from above',
  simplicity: 'A clean sweep of soft light across an almost empty field',
  privacy: 'A luminous shield outline at the centre of a calm green field',
  cta: 'Bright converging light with a gold highlight cutting across the frame',
} as const;

export type BannerName = keyof typeof BANNERS;

export function bannerSrc(name: BannerName) {
  return {
    src: `/media/banners/${name}-2400.jpg`,
    srcSet: `/media/banners/${name}-1200.jpg 1200w, /media/banners/${name}-2400.jpg 2400w`,
    sizes: '100vw',
    alt: BANNERS[name],
  };
}

type SectionBannerProps = {
  name: BannerName;
  children: ReactNode;
  /** `side` weights the scrim to the left for copy-beside-image layouts. */
  scrim?: 'full' | 'side';
  /** Slow Ken-Burns drift. Disabled automatically under reduced motion. */
  drift?: boolean;
  /** Load eagerly — use only for the banner above the fold. */
  priority?: boolean;
  rounded?: boolean;
  className?: string;
};

/**
 * A section wrapped in an ultra-HD banner: image layer, gradient scrim, film
 * grain, then content. The scrim is tuned so body copy clears WCAG AA against
 * the brightest part of every banner in the registry.
 */
export function SectionBanner({
  name,
  children,
  scrim = 'full',
  drift = true,
  priority = false,
  rounded = true,
  className = '',
}: SectionBannerProps) {
  const img = bannerSrc(name);

  return (
    <div className={`banner ${rounded ? 'rounded-glass-3xl' : ''} ${className}`}>
      <img
        {...img}
        alt=""
        aria-hidden="true"
        className={`banner__media ${drift ? 'banner__media--drift' : ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <div className={`banner__scrim ${scrim === 'side' ? 'banner__scrim--side' : ''}`} aria-hidden="true" />
      <div className="banner__grain" aria-hidden="true" />
      {children}
    </div>
  );
}

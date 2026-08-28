import { useMemo } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion';

type Node = { id: string; x: number; y: number; r: number; label?: string; accent?: string };

/**
 * The connection graph — the Lean Canvas "unfair advantage" made visible.
 *
 * Rendered as inline SVG (not an image) so it stays crisp at any size, inherits
 * the theme, scales with the accessibility text setting, and animates without a
 * library. Purely illustrative: the surrounding copy carries the meaning, so
 * the figure is labelled once and its internals are hidden from screen readers.
 */
const NODES: Node[] = [
  { id: 'you', x: 50, y: 50, r: 7.5, label: 'You', accent: '#5AC8FA' },
  { id: 'a', x: 22, y: 26, r: 4.2, accent: '#007AFF' },
  { id: 'b', x: 76, y: 22, r: 4.6, accent: '#8B5CF6' },
  { id: 'c', x: 84, y: 58, r: 3.8, accent: '#007AFF' },
  { id: 'd', x: 64, y: 82, r: 4.4, accent: '#10B981' },
  { id: 'e', x: 30, y: 78, r: 4.0, accent: '#5AC8FA' },
  { id: 'f', x: 12, y: 54, r: 3.6, accent: '#8B5CF6' },
  { id: 'g', x: 47, y: 16, r: 3.4, accent: '#5AC8FA' },
  { id: 'h', x: 92, y: 38, r: 2.8, accent: '#007AFF' },
  { id: 'i', x: 8, y: 30, r: 2.6, accent: '#10B981' },
  { id: 'j', x: 88, y: 82, r: 2.9, accent: '#5AC8FA' },
  { id: 'k', x: 40, y: 94, r: 2.5, accent: '#8B5CF6' },
];

const EDGES: Array<[string, string]> = [
  ['you', 'a'], ['you', 'b'], ['you', 'c'], ['you', 'd'], ['you', 'e'], ['you', 'f'], ['you', 'g'],
  ['a', 'g'], ['a', 'i'], ['a', 'f'], ['b', 'g'], ['b', 'h'], ['c', 'h'], ['c', 'j'],
  ['d', 'j'], ['d', 'k'], ['e', 'k'], ['e', 'f'],
];

const byId = (id: string) => NODES.find((n) => n.id === id)!;

export function ConnectionGraph({ className = '' }: { className?: string }) {
  const reduced = usePrefersReducedMotion();

  const edges = useMemo(
    () =>
      EDGES.map(([from, to], i) => {
        const a = byId(from);
        const b = byId(to);
        return { key: `${from}-${to}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, delay: (i % 6) * 0.45 };
      }),
    [],
  );

  return (
    <figure className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-auto"
        role="img"
        aria-label="Diagram: a central point representing you, linked outward to a dozen connections which in turn link to each other, forming a network"
      >
        <defs>
          <radialGradient id="dc-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#5AC8FA" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5AC8FA" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#dc-core)" />

        <g stroke="#5AC8FA" strokeOpacity="0.35" strokeWidth="0.4" strokeLinecap="round">
          {edges.map((e) => (
            <line
              key={e.key}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              className={reduced ? undefined : 'anim-dash'}
              style={reduced ? undefined : { animationDelay: `${e.delay}s` }}
            />
          ))}
        </g>

        <g>
          {NODES.map((n, i) => (
            <g key={n.id}>
              {!reduced && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill={n.accent}
                  opacity="0.35"
                  style={{
                    transformOrigin: `${n.x}px ${n.y}px`,
                    animation: `pulseRing 3.4s cubic-bezier(0.4,0,0.2,1) ${(i % 5) * 0.6}s infinite`,
                  }}
                />
              )}
              <circle cx={n.x} cy={n.y} r={n.r} fill={n.accent} />
              <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.3" />
            </g>
          ))}
        </g>

        <text
          x="50"
          y="50.9"
          textAnchor="middle"
          fill="#04070f"
          fontSize="3.1"
          fontWeight="700"
          aria-hidden="true"
        >
          You
        </text>
      </svg>
    </figure>
  );
}

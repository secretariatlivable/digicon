import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, Compass, HelpCircle, LayoutGrid, LogIn, Network, Route, ShieldCheck,
  Sparkles, UserPlus, Users, Mail, Globe,
} from 'lucide-react';
import { DigiConLogo } from '@/components/brand/DigiConLogo';
import { scrollToSection } from '@/lib/motion';
import { BRAND } from '@/content/landing';

/**
 * Collapsed footer.
 *
 * The primary layer is a compact dock of icon tiles — navigation you can scan
 * in one glance and hit with a thumb. The traditional link columns are still
 * there, folded behind a single disclosure, so the footer never turns into the
 * wall of links that usually ends a marketing page.
 */

const DOCK = [
  { label: 'Journey', icon: Route, target: 'journey' },
  { label: 'Network', icon: Network, target: 'graph' },
  { label: 'For You', icon: Users, target: 'professionals' },
  { label: 'How', icon: LayoutGrid, target: 'how-it-works' },
  { label: 'Privacy', icon: ShieldCheck, target: 'privacy' },
  { label: 'Questions', icon: HelpCircle, target: 'faq' },
] as const;

const COLUMNS = [
  {
    title: 'The Product',
    links: [
      { label: 'Create your identity', target: 'create' },
      { label: 'Make an introduction', target: 'share' },
      { label: 'Capture the connection', target: 'capture' },
      { label: 'Relationship workspace', target: 'manage' },
      { label: 'Follow up', target: 'followup' },
    ],
  },
  {
    title: 'Who It’s For',
    links: [
      { label: 'Professionals', target: 'professionals' },
      { label: 'Startups & teams', target: 'teams' },
      { label: 'Organizations', target: 'organizations' },
    ],
  },
  {
    title: 'Why DigiCon',
    links: [
      { label: 'The problem', target: 'problem' },
      { label: 'The big idea', target: 'big-idea' },
      { label: 'The connection graph', target: 'graph' },
      { label: 'Simplicity', target: 'simplicity' },
      { label: 'Our philosophy', target: 'philosophy' },
    ],
  },
] as const;

export function SiteFooter() {
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="relative border-t border-white/[0.07] px-4 pb-10 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Icon dock — the footer's primary navigation */}
        <nav aria-label="Footer navigation" className="footdock">
          {DOCK.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => scrollToSection(item.target)}
              className="footdock__item"
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Account actions */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link
            to="/auth?mode=signup"
            className="flex items-center justify-center gap-2 rounded-full bg-digicon-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-digicon-primary/25 transition-transform hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Create Your DigiCon
          </Link>
          <Link
            to="/auth"
            className="flex items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign In
          </Link>
        </div>

        {/* Everything else, folded away */}
        <div className="mt-6 border-t border-white/[0.07] pt-2">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="footer-detail"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white"
          >
            {expanded ? 'Show less' : 'All sections'}
            <ChevronDown
              className={`h-3.5 w-3.5 collapse__chev ${expanded ? 'collapse__chev--open' : ''}`}
              aria-hidden="true"
            />
          </button>

          <div
            id="footer-detail"
            className={`collapse__body ${expanded ? 'collapse__body--open' : ''}`}
          >
            <div>
              <div className="grid gap-8 pb-8 pt-4 sm:grid-cols-3">
                {COLUMNS.map((col) => (
                  <div key={col.title}>
                    <h3 className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-digicon-info">
                      {col.title}
                    </h3>
                    <ul className="space-y-2">
                      {col.links.map((link) => (
                        <li key={link.target}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(link.target)}
                            className="text-sm text-white/55 transition-colors hover:text-white"
                          >
                            {link.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Base */}
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-white/[0.07] pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <DigiConLogo size="sm" />
            <p className="max-w-sm text-xs leading-relaxed text-white/40">{BRAND.tagline}</p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            <div className="flex items-center gap-2">
              <a
                href="mailto:hello@digicon.cards"
                aria-label="Email DigiCon"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-digicon-info/40 hover:text-white"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://digicon.cards"
                aria-label="DigiCon website"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-digicon-info/40 hover:text-white"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => scrollToSection('privacy')}
                aria-label="Privacy and trust"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-digicon-info/40 hover:text-white"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('philosophy')}
                aria-label="The DigiCon philosophy"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-digicon-info/40 hover:text-white"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} DigiCon · Your identity. Your connections. Your network.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Small marquee of the DigiCon vocabulary, used above the footer. */
export function VocabularyMarquee({
  items,
}: {
  items: ReadonlyArray<{ readonly generic: string; readonly digicon: string }>;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] py-4" aria-hidden="true">
      <div className="anim-marquee flex w-max gap-8 px-4">
        {doubled.map((item, i) => (
          <span key={`${item.generic}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-sm">
            <Sparkles className="h-3.5 w-3.5 text-digicon-info" />
            <span className="text-white/30 line-through">{item.generic}</span>
            <span className="text-white/75 font-semibold">{item.digicon}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

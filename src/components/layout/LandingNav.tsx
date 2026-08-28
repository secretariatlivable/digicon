import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown, Compass, Contact, Handshake, LayoutGrid, Menu, Network, Route,
  ShieldCheck, Sparkles, Users, X,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate } from '@/lib/i18n';
import { GlassButton } from '@/components/ui/GlassCard';
import { DigiConLogo } from '@/components/brand/DigiConLogo';
import { scrollToSection } from '@/lib/motion';

type NavLink = { label: string; target: string; icon: typeof Compass; note?: string };

/** Navigation written in DigiCon language, grouped by the product narrative. */
export const NAV_GROUPS: Array<{ label: string; links: NavLink[] }> = [
  {
    label: 'How It Works',
    links: [
      { label: 'The Problem', target: 'problem', icon: Compass, note: 'Why connections get lost' },
      { label: 'The Big Idea', target: 'big-idea', icon: Sparkles, note: 'A card is a moment' },
      { label: 'Create → Follow Up', target: 'journey', icon: Route, note: 'The six movements' },
      { label: 'How It Works', target: 'how-it-works', icon: LayoutGrid, note: 'Step by step' },
    ],
  },
  {
    label: 'Who It’s For',
    links: [
      { label: 'For Professionals', target: 'professionals', icon: Contact, note: 'Independent and client-facing' },
      { label: 'For Startups & Teams', target: 'teams', icon: Users, note: 'Collective intelligence' },
      { label: 'For Organizations', target: 'organizations', icon: Network, note: 'Organizational memory' },
    ],
  },
  {
    label: 'The Platform',
    links: [
      { label: 'Connection Graph', target: 'graph', icon: Network, note: 'The shape of your network' },
      { label: 'Simplicity', target: 'simplicity', icon: Sparkles, note: 'What we deliberately left out' },
      { label: 'Privacy & Trust', target: 'privacy', icon: ShieldCheck, note: 'Your network belongs to you' },
      { label: 'Questions', target: 'faq', icon: Handshake, note: 'Answered plainly' },
    ],
  },
];

function Dropdown({ group }: { group: (typeof NAV_GROUPS)[number] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-glass-sm px-3 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        {group.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="metal absolute left-1/2 top-[calc(100%+0.6rem)] w-72 -translate-x-1/2 p-2 animate-scale-in">
          <ul>
            {group.links.map((link) => (
              <li key={link.target}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    scrollToSection(link.target);
                  }}
                  className="flex w-full items-start gap-3 rounded-glass-md p-2.5 text-left transition-colors hover:bg-white/[0.07]"
                >
                  <link.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-digicon-info" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-white">{link.label}</span>
                    {link.note && <span className="block text-xs text-white/45">{link.note}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function LandingNav() {
  const { session } = useAuth();
  const [lang, setLang] = useLanguage();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'glass-header shadow-lg shadow-black/30' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="DigiCon home">
          <DigiConLogo size="sm" showText={false} className="sm:hidden" />
          <DigiConLogo size="sm" className="hidden sm:inline-flex" />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_GROUPS.map((group) => (
              <Dropdown key={group.label} group={group} />
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'fil' : 'en')}
            aria-label={lang === 'en' ? 'Switch to Filipino' : 'Switch to English'}
            className="glass-thin hidden rounded-glass-sm px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:text-white sm:inline-flex"
          >
            {lang === 'en' ? 'FIL' : 'ENG'}
          </button>

          {session ? (
            <GlassButton size="sm" onClick={() => navigate('/dashboard')}>
              My Network
            </GlassButton>
          ) : (
            <>
              <GlassButton
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => navigate('/auth')}
              >
                {translate('nav.login', lang)}
              </GlassButton>
              <GlassButton size="sm" onClick={() => navigate('/auth?mode=signup')}>
                {/* the full promise on desktop; a thumb-sized label on phones */}
                <span className="hidden sm:inline">Create Your DigiCon</span>
                <span className="sm:hidden">Get Started</span>
              </GlassButton>
            </>
          )}

          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawer}
            className="rounded-glass-sm p-2 text-white/80 transition-colors hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <nav
            aria-label="Primary"
            className="glass-sidebar absolute right-0 top-0 flex h-[100dvh] w-[min(86vw,340px)] flex-col overflow-y-auto p-5 animate-slide-in-right"
          >
            <div className="mb-6 flex items-center justify-between">
              <DigiConLogo size="sm" />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Close navigation menu"
                className="rounded-glass-sm p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="mb-2 px-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/35">
                  {group.label}
                </p>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.target}>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawer(false);
                          setTimeout(() => scrollToSection(link.target), 60);
                        }}
                        className="flex w-full items-center gap-3 rounded-glass-md px-2 py-3 text-left text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white"
                      >
                        <link.icon className="h-4 w-4 flex-shrink-0 text-digicon-info" aria-hidden="true" />
                        <span className="text-sm font-medium">{link.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'fil' : 'en')}
                className="mb-1 w-full rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {lang === 'en' ? 'Basahin sa Filipino' : 'Read in English'}
              </button>
              <GlassButton className="w-full" onClick={() => navigate('/auth?mode=signup')}>
                Create Your DigiCon
              </GlassButton>
              <GlassButton variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
                Sign In
              </GlassButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

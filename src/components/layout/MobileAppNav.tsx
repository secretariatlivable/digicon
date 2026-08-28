import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accessibility, Compass, MoreHorizontal, Network, Route, ShieldCheck, Sparkles, Users, X,
  Home, UserPlus,
} from 'lucide-react';
import { scrollToSection, useActiveSection } from '@/lib/motion';

/** The four primary destinations, plus More. Mirrors a native tab bar. */
const PRIMARY = [
  { id: 'top', label: 'Home', icon: Home },
  { id: 'journey', label: 'Journey', icon: Route },
  { id: 'graph', label: 'Network', icon: Network },
  { id: 'professionals', label: 'For You', icon: Users },
] as const;

const MORE = [
  { id: 'problem', label: 'The Problem', icon: Compass },
  { id: 'big-idea', label: 'The Big Idea', icon: Sparkles },
  { id: 'how-it-works', label: 'How It Works', icon: Route },
  { id: 'simplicity', label: 'Simplicity', icon: Sparkles },
  { id: 'privacy', label: 'Privacy & Trust', icon: ShieldCheck },
  { id: 'faq', label: 'Questions', icon: Compass },
] as const;

const WATCHED = [...PRIMARY.map((p) => p.id), ...MORE.map((m) => m.id)];

/**
 * Persistent app-style bottom navigation.
 *
 * Mobile-first: on a phone this is the primary way through the page, sitting
 * above the home indicator via safe-area insets. Hidden from 1024px up, where
 * the header navigation takes over.
 */
export function MobileAppNav() {
  const navigate = useNavigate();
  const [more, setMore] = useState(false);
  const active = useActiveSection(WATCHED as unknown as string[]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMore(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (id: string) => {
    setMore(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setTimeout(() => scrollToSection(id), 40);
  };

  return (
    <>
      {more && (
        <div className="fixed inset-0 z-[59] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMore(false)}
          />
          <div
            role="dialog"
            aria-label="More sections"
            className="metal above-appnav absolute inset-x-3 max-h-[72dvh] overflow-y-auto p-4 animate-fade-in-up"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Explore DigiCon</p>
              <button
                type="button"
                onClick={() => setMore(false)}
                aria-label="Close menu"
                className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <ul className="grid grid-cols-2 gap-2">
              {MORE.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    className="flex w-full items-center gap-2.5 rounded-glass-md border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-left text-xs font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0 text-digicon-info" aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                setMore(false);
                window.dispatchEvent(new CustomEvent('digicon:open-a11y'));
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-white/12 px-4 py-3 text-xs font-semibold text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Accessibility className="h-4 w-4" aria-hidden="true" />
              Accessibility options
            </button>

            <button
              type="button"
              onClick={() => navigate('/auth?mode=signup')}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-digicon-primary px-4 py-3 text-sm font-bold text-white"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create Your DigiCon
            </button>
          </div>
        </div>
      )}

      <nav className="appnav lg:hidden" aria-label="Section navigation">
        {PRIMARY.map((item) => {
          const isActive = active === item.id || (item.id === 'top' && active === null);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={isActive ? 'true' : undefined}
              className={`appnav__item ${isActive ? 'appnav__item--active' : ''}`}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="appnav__label">{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
          className={`appnav__item ${more ? 'appnav__item--active' : ''}`}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          <span className="appnav__label">More</span>
        </button>
      </nav>
    </>
  );
}

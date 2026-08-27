import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Leaf,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { GlassButton } from '@/components/ui/GlassCard';
import { DigiConLogo } from '@/components/brand/DigiConLogo';

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const [lang] = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = (k: TranslationKey) => translate(k, lang);

  const navItems = [
    { key: 'nav.dashboard' as TranslationKey, path: '/dashboard', icon: LayoutDashboard },
    { key: 'nav.cards' as TranslationKey, path: '/cards', icon: CreditCard },
    { key: 'nav.contacts' as TranslationKey, path: '/contacts', icon: Users },
    { key: 'nav.analytics' as TranslationKey, path: '/analytics', icon: BarChart3 },
    { key: 'nav.eco' as TranslationKey, path: '/eco', icon: Leaf },
    { key: 'nav.settings' as TranslationKey, path: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <>
      <Link to="/" className="mb-2 flex items-center gap-3 px-4 py-5">
        <DigiConLogo size="md" />
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-glass-md px-4 py-3 transition-all duration-300 ${
                isActive
                  ? 'glass-regular text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-digicon-primary' : ''
                }`}
              />
              <span className="text-sm font-medium">{t(item.key)}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-digicon-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-4">
        {profile && (
          <div className="glass-thin rounded-glass-md p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-digicon-primary to-digicon-secondary text-sm font-semibold text-white">
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {profile.full_name || 'User'}
                </p>
                <p className="truncate text-xs text-white/50">
                  {profile.company_name || profile.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-glass-md px-4 py-3 text-white/60 transition-all duration-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="text-sm font-medium">{t('nav.logout')}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen">
      <aside className="glass-sidebar fixed bottom-0 left-0 top-0 z-40 hidden w-64 flex-col lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="glass-sidebar absolute bottom-0 left-0 top-0 flex w-72 flex-col animate-slide-in-right">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-glass-sm p-2 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="glass-header sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-glass-sm p-2 text-white/80 hover:bg-white/10"
            aria-label="Open navigation"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <DigiConLogo size="sm" />
          </Link>

          <div className="w-10" />
        </header>

        <main className="relative z-10 mx-auto max-w-7xl p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function LandingNav() {
  const { session } = useAuth();
  const [lang, setLang] = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="glass-header fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <DigiConLogo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#features"
            className="px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            Pricing
          </a>
          <a
            href="#eco"
            className="px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            Eco Impact
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'fil' : 'en')}
            className="glass-thin rounded-glass-sm px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:text-white"
          >
            {lang === 'en' ? 'FIL' : 'ENG'}
          </button>

          {session ? (
            <GlassButton size="sm" onClick={() => navigate('/dashboard')}>
              {translate('nav.dashboard', lang)}
            </GlassButton>
          ) : (
            <>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="hidden sm:flex"
              >
                {translate('nav.login', lang)}
              </GlassButton>
              <GlassButton size="sm" onClick={() => navigate('/auth?mode=signup')}>
                {translate('nav.getStarted', lang)}
              </GlassButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, Users, BarChart3, Settings,
  Leaf, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { GlassButton } from '@/components/ui/Glass';
import { DigiConLogo } from '@/components/brand/DigiConLogo';

export function AppLayout({ children }: { children: ReactNode }) {
  const { session, profile, signOut } = useAuth();
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
      <Link to="/" className="flex items-center gap-3 px-4 py-5 mb-2">
        <DigiConLogo size="md" />
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-glass-md transition-all duration-300 group ${
                isActive
                  ? 'glass-regular text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-digicon-primary' : ''}`} />
              <span className="text-sm font-medium">{t(item.key)}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-digicon-primary animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-3">
        {profile && (
          <div className="glass-thin rounded-glass-md p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-digicon-primary to-digicon-secondary flex items-center justify-center text-white font-semibold text-sm">
                {profile.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile.full_name || 'User'}</p>
                <p className="text-xs text-white/50 truncate">{profile.company_name || profile.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-glass-md text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">{t('nav.logout')}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen relative">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col glass-sidebar z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col glass-sidebar animate-slide-in-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-glass-sm text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 glass-header px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-glass-sm text-white/80 hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <DigiConLogo size="sm" />
          </Link>
          <div className="w-10" />
        </header>

        <main className="relative z-10 p-4 lg:p-8 max-w-7xl mx-auto">
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <DigiConLogo size="sm" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <a href="#features" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
          <a href="#eco" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Eco Impact</a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'fil' : 'en')}
            className="px-3 py-1.5 rounded-glass-sm text-xs font-medium text-white/70 hover:text-white glass-thin transition-all"
          >
            {lang === 'en' ? 'FIL' : 'ENG'}
          </button>
          {session ? (
            <GlassButton size="sm" onClick={() => navigate('/dashboard')}>
              {translate('nav.dashboard', lang)}
            </GlassButton>
          ) : (
            <>
              <GlassButton variant="ghost" size="sm" onClick={() => navigate('/auth')} className="hidden sm:flex">
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

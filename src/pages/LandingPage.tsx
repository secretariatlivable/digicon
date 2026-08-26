import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, BarChart3, RefreshCw, Leaf, Smartphone,
  Globe, ArrowRight, Check, Zap, TrendingUp, Users
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { GlassButton, GlassCard } from '@/components/ui/Glass';
import { LandingNav } from '@/components/layout/AppLayout';
import { DigiConLogo } from '@/components/brand/DigiConLogo';

export function LandingPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();
  const navigate = useNavigate();
  const t = (k: TranslationKey) => translate(k, lang);

  const features = [
    { icon: CreditCard, titleKey: 'landing.cards.title' as TranslationKey, descKey: 'landing.cards.desc' as TranslationKey, color: 'text-digicon-primary' },
    { icon: RefreshCw, titleKey: 'landing.crm.title' as TranslationKey, descKey: 'landing.crm.desc' as TranslationKey, color: 'text-digicon-secondary' },
    { icon: BarChart3, titleKey: 'landing.analytics.title' as TranslationKey, descKey: 'landing.analytics.desc' as TranslationKey, color: 'text-digicon-info' },
    { icon: Leaf, titleKey: 'landing.eco.title' as TranslationKey, descKey: 'landing.eco.desc' as TranslationKey, color: 'text-digicon-eco' },
    { icon: Globe, titleKey: 'landing.localized.title' as TranslationKey, descKey: 'landing.localized.desc' as TranslationKey, color: 'text-digicon-warning' },
    { icon: Smartphone, titleKey: 'landing.cards.title' as TranslationKey, descKey: 'landing.cards.desc' as TranslationKey, color: 'text-digicon-accent' },
  ];

  const pricingPlans = [
    {
      nameKey: 'landing.pricing.starter' as TranslationKey,
      priceKey: 'landing.pricing.starterPrice' as TranslationKey,
      descKey: 'landing.pricing.starterDesc' as TranslationKey,
      features: ['3 Digital Cards', 'Up to 100 Contacts', 'QR Code Sharing', 'Basic Analytics', 'English & Filipino'],
      highlight: false,
    },
    {
      nameKey: 'landing.pricing.growth' as TranslationKey,
      priceKey: 'landing.pricing.growthPrice' as TranslationKey,
      descKey: 'landing.pricing.growthDesc' as TranslationKey,
      features: ['Unlimited Cards', 'Unlimited Contacts', 'HubSpot CRM Sync', 'Advanced Analytics', 'Team Access (5 seats)', 'Eco Gamification', 'Priority Support'],
      highlight: true,
    },
    {
      nameKey: 'landing.pricing.enterprise' as TranslationKey,
      priceKey: 'landing.pricing.enterprisePrice' as TranslationKey,
      descKey: 'landing.pricing.enterpriseDesc' as TranslationKey,
      features: ['Everything in Growth', 'Unlimited Team Seats', 'Custom Integrations', 'API Access', 'Dedicated Manager', 'SLA Guarantee'],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen relative">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img src="/Background.png" alt="Blue digital technology pattern" className="absolute inset-0 w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/75 to-black" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-digicon-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-digicon-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-digicon-eco/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-12">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-thin mb-8 animate-fade-in-down">
            <Leaf className="w-4 h-4 text-digicon-eco" />
            <span className="text-sm text-white/70">Eco-friendly digital business cards for the Philippines</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up leading-tight tracking-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <GlassButton size="lg" onClick={() => navigate(session ? '/dashboard' : '/auth?mode=signup')}>
              {t('landing.hero.cta')}
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </GlassButton>
            <GlassButton variant="ghost" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('landing.hero.secondary')}
            </GlassButton>
          </div>

          {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0 mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: Leaf, value: '2.5T', label: 'Paper Saved' },
                { icon: Users, value: '12K+', label: 'Contacts Captured' },
                { icon: TrendingUp, value: '45%', label: 'Avg. Conversion' },
              ].map((stat, i) => (
                <div key={i} className="glass-thin rounded-glass-lg p-4">
                  <stat.icon className="w-5 h-5 text-digicon-eco mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-in-up hidden lg:block" style={{ animationDelay: '0.15s' }}>
            <div className="absolute -inset-4 rounded-[32px] bg-digicon-primary/20 blur-2xl" />
            <GlassCard variant="chrome" className="relative overflow-hidden p-2 rotate-2 hover:rotate-0 transition-transform duration-700">
              <img src="/Background.png" alt="Digital technology network visualization" className="w-full aspect-[4/3] object-cover rounded-[20px]" />
              <div className="absolute bottom-5 left-5 right-5 glass-thin rounded-glass-md px-4 py-3 text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-digicon-info">Smart networking</p>
                <p className="text-sm font-semibold text-white mt-1">Connect, capture leads, and grow your network digitally.</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Dual value proposition */}
      <section className="px-4 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard variant="thick" className="p-8 animate-fade-in-up group hover:scale-[1.02] transition-transform duration-500">
            <div className="w-14 h-14 rounded-glass-lg glass-chrome flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <Zap className="w-7 h-7 text-digicon-warning" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t('landing.startups.title')}</h3>
            <p className="text-white/60 mb-4">{t('landing.startups.desc')}</p>
            <ul className="space-y-2">
              {['Free digital cards', 'Zero printing costs', 'Eco-friendly branding', 'QR + NFC sharing'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="w-4 h-4 text-digicon-eco" />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard variant="thick" className="p-8 animate-fade-in-up group hover:scale-[1.02] transition-transform duration-500" >
            <div className="w-14 h-14 rounded-glass-lg glass-chrome flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <TrendingUp className="w-7 h-7 text-digicon-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t('landing.smes.title')}</h3>
            <p className="text-white/60 mb-4">{t('landing.smes.desc')}</p>
            <ul className="space-y-2">
              {['HubSpot CRM sync', 'CSV/Excel export', 'Lead analytics', 'Team collaboration'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="w-4 h-4 text-digicon-eco" />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </section>

      {/* Community visual */}
      <section className="px-4 lg:px-8 py-16 max-w-6xl mx-auto">
        <GlassCard variant="thick" className="overflow-hidden p-0 grid md:grid-cols-[0.9fr_1.1fr] items-stretch relative">
          <div className="relative min-h-64">
            <img src="/TRIBE_(2).png" alt="Connected community members sharing digital networks" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
          </div>
          <div className="relative p-8 md:p-10 flex flex-col justify-center overflow-hidden">
            <img src="/Cover_2.png" alt="Digital growth and resilience backdrop" className="absolute inset-0 w-full h-full object-cover opacity-10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-digicon-info text-sm font-medium mb-4"><Users className="w-4 h-4" /> Built for meaningful connections</div>
              <h2 className="text-3xl font-bold text-white mb-4">Turn every introduction into momentum.</h2>
              <p className="text-white/60 leading-relaxed">DigiCon brings your business identity, relationships, and growth insights into one connected workspace made for modern Philippine teams.</p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Features grid */}
      <section id="features" className="px-4 lg:px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">{t('landing.features.title')}</h2>
        <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">Everything you need to network smarter, not harder.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <GlassCard key={i} variant="regular" hover className="p-6 animate-fade-in-up" >
              <div className={`w-12 h-12 rounded-glass-md glass-thin flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t(feature.titleKey)}</h3>
              <p className="text-sm text-white/50">{t(feature.descKey)}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Eco impact section */}
      <section id="eco" className="px-4 lg:px-8 py-16 max-w-5xl mx-auto">
        <GlassCard variant="thick" className="p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-digicon-eco/20 rounded-full blur-[100px]" />
          <Leaf className="w-16 h-16 text-digicon-eco mx-auto mb-6 relative" />
          <h2 className="text-3xl font-bold text-white mb-4 relative">Every Card Makes a Difference</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8 relative">
            Every time you share a digital card instead of paper, you save resources. Track your impact in real-time and earn eco badges.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto relative">
            {[
              { value: '500cm²', label: 'Paper per card' },
              { value: '0.02kg', label: 'CO₂ per card' },
              { value: '17 cards', label: '= 1 tree' },
            ].map((stat, i) => (
              <div key={i} className="glass-thin rounded-glass-md p-4">
                <p className="text-2xl font-bold text-digicon-eco">{stat.value}</p>
                <p className="text-xs text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 lg:px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">{t('landing.pricing.title')}</h2>
        <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">Affordable micro-subscriptions designed for Philippine businesses.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <GlassCard
              key={i}
              variant={plan.highlight ? 'chrome' : 'regular'}
              className={`p-8 relative ${plan.highlight ? 'ring-2 ring-digicon-primary/50 scale-105' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-digicon-primary text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{t(plan.nameKey)}</h3>
              <p className="text-3xl font-bold text-white mb-1">
                {t(plan.priceKey)}
                {plan.priceKey !== 'landing.pricing.enterprisePrice' && <span className="text-sm font-normal text-white/50">/mo</span>}
              </p>
              <p className="text-sm text-white/50 mb-6">{t(plan.descKey)}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="w-4 h-4 text-digicon-eco flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <GlassButton
                variant={plan.highlight ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => navigate(session ? '/dashboard' : '/auth?mode=signup')}
              >
                {t('landing.pricing.cta')}
              </GlassButton>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 lg:px-8 py-16 max-w-4xl mx-auto">
        <GlassCard variant="chrome" className="p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-digicon-primary/10 via-transparent to-digicon-eco/10" />
          <img src="/DigiCon.png" alt="DigiCon logo" className="w-12 h-12 rounded-full mx-auto mb-6 relative ring-1 ring-white/10" />
          <h2 className="text-3xl font-bold text-white mb-4 relative">Ready to Go Digital?</h2>
          <p className="text-white/60 mb-8 relative">Join thousands of Philippine businesses saving money and the environment with DigiCon.</p>
          <GlassButton size="lg" onClick={() => navigate(session ? '/dashboard' : '/auth?mode=signup')} className="relative">
            {t('landing.hero.cta')}
            <ArrowRight className="inline ml-2 w-5 h-5" />
          </GlassButton>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="px-4 lg:px-8 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DigiConLogo size="sm" />
            <span className="text-white/30 text-sm ml-2">© 2026. Made for the Philippines.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link to="/auth" className="hover:text-white transition-colors">Sign In</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

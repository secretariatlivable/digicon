import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  BarChart3,
  Link2,
  Leaf,
  UserPlus,
  ShieldCheck,
  Globe,
  ArrowRight,
  Check,
  Zap,
  TrendingUp,
  Users,
  QrCode,
  Handshake,
  CalendarClock,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { GlassButton, GlassCard } from '@/components/ui/GlassCard';
import { LandingNav } from '@/components/layout/AppLayout';
import { DigiConLogo } from '@/components/brand/DigiConLogo';
import { PayPalSubscriptionButton } from '@/components/PayPalSubscriptionButton';
import { DIGICON_PAYPAL_PLANS, type DigiConPlanId } from '@/config/paypalPlans';

export function LandingPage() {
  const { session } = useAuth();
  const [lang] = useLanguage();
  const navigate = useNavigate();

  const t = (key: TranslationKey) => translate(key, lang);

  /*
   * The sixth entry previously repeated `landing.cards.*`, so two cards
   * rendered identical text AND collided on `key={feature.titleKey}` — a
   * duplicate React key. Each feature now maps to a distinct capability.
   *
   * `landing.crm.*` was deliberately dropped: it advertised "Auto-sync
   * contacts to CRM", which nothing in the codebase implements, and it framed
   * DigiCon as a CRM feeder — the category the product is positioned against.
   */
  const features = [
    {
      icon: CreditCard,
      titleKey: 'landing.cards.title' as TranslationKey,
      descKey: 'landing.cards.desc' as TranslationKey,
      color: 'text-digicon-primary',
    },
    {
      icon: Link2,
      titleKey: 'landing.identity.title' as TranslationKey,
      descKey: 'landing.identity.desc' as TranslationKey,
      color: 'text-digicon-secondary',
    },
    {
      icon: UserPlus,
      titleKey: 'landing.capture.title' as TranslationKey,
      descKey: 'landing.capture.desc' as TranslationKey,
      color: 'text-digicon-accent',
    },
    {
      icon: BarChart3,
      titleKey: 'landing.analytics.title' as TranslationKey,
      descKey: 'landing.analytics.desc' as TranslationKey,
      color: 'text-digicon-info',
    },
    {
      icon: ShieldCheck,
      titleKey: 'landing.ownership.title' as TranslationKey,
      descKey: 'landing.ownership.desc' as TranslationKey,
      color: 'text-digicon-eco',
    },
    {
      icon: Globe,
      titleKey: 'landing.localized.title' as TranslationKey,
      descKey: 'landing.localized.desc' as TranslationKey,
      color: 'text-digicon-warning',
    },
  ];

  const pricingPlans: Array<{
    id: Exclude<DigiConPlanId, 'startup'>;
    nameKey: TranslationKey;
    priceKey: TranslationKey;
    descKey: TranslationKey;
    features: readonly string[];
    highlight: boolean;
    /** Custom-priced plans go through sales, not a subscribe button. */
    selfServe: boolean;
  }> = [
    {
      id: 'starter',
      nameKey: 'landing.pricing.starter' as TranslationKey,
      priceKey: 'landing.pricing.starterPrice' as TranslationKey,
      descKey: 'landing.pricing.starterDesc' as TranslationKey,
      features: DIGICON_PAYPAL_PLANS.starter.features,
      selfServe: DIGICON_PAYPAL_PLANS.starter.selfServe,
      highlight: false,
    },
    {
      id: 'growth',
      nameKey: 'landing.pricing.growth' as TranslationKey,
      priceKey: 'landing.pricing.growthPrice' as TranslationKey,
      descKey: 'landing.pricing.growthDesc' as TranslationKey,
      features: DIGICON_PAYPAL_PLANS.growth.features,
      selfServe: DIGICON_PAYPAL_PLANS.growth.selfServe,
      highlight: true,
    },
    {
      id: 'enterprise',
      nameKey: 'landing.pricing.enterprise' as TranslationKey,
      priceKey: 'landing.pricing.enterprisePrice' as TranslationKey,
      descKey: 'landing.pricing.enterpriseDesc' as TranslationKey,
      features: DIGICON_PAYPAL_PLANS.enterprise.features,
      selfServe: DIGICON_PAYPAL_PLANS.enterprise.selfServe,
      highlight: false,
    },
  ];

  const handlePrimaryCTA = () => {
    navigate(session ? '/dashboard' : '/auth?mode=signup');
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="min-h-screen relative">
      <LandingNav />

      {/* Full-width banner */}
      <section
        aria-label="DigiCon introduction"
        className="relative w-full overflow-hidden"
      >
        <img
          src="/DigiCon_Banner.png"
          alt="DigiCon digital business cards, CRM automation, and analytics platform for Philippine SMEs and startups"
          className="w-full h-auto block"
        />
      </section>

      {/* Hero */}
      <section className="relative pt-20 pb-20 px-4 lg:px-8 overflow-hidden">
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-digicon-primary/20 rounded-full blur-[120px] animate-pulse" />

          <div
            className="absolute top-40 right-1/4 w-96 h-96 bg-digicon-secondary/20 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: '1s' }}
          />

          <div
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-digicon-eco/15 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="hero-kicker inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in-down">
            <Handshake className="w-4 h-4 text-digicon-primary" aria-hidden="true" />
            <span className="text-sm font-medium">{t('landing.kicker')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up leading-tight tracking-tight">
            {t('landing.hero.headlineA')}{' '}
            <span className="text-gradient">
              {t('landing.hero.headlineHighlight')}
            </span>{' '}
            {t('landing.hero.headlineB')}
          </h1>

          <p
            className="text-lg md:text-xl text-white/60 mb-10 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            {t('landing.hero.sub')}
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <GlassButton size="lg" onClick={handlePrimaryCTA}>
              {t('landing.hero.ctaPrimary')}
              <ArrowRight className="inline ml-2 w-5 h-5" aria-hidden="true" />
            </GlassButton>

            <GlassButton variant="ghost" size="lg" onClick={scrollToFeatures}>
              {t('landing.hero.ctaSecondary')}
            </GlassButton>
          </div>

          {/* How it works */}
          <div
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <h2 className="text-xl font-semibold text-white mb-2">
              {t('landing.how.title')}
            </h2>
            <p className="text-sm text-white/50 mb-6 max-w-2xl mx-auto">
              {t('landing.how.sub')}
            </p>

            <ol className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              {[
                {
                  icon: QrCode,
                  titleKey: 'landing.how.s1t' as TranslationKey,
                  descKey: 'landing.how.s1d' as TranslationKey,
                },
                {
                  icon: UserPlus,
                  titleKey: 'landing.how.s2t' as TranslationKey,
                  descKey: 'landing.how.s2d' as TranslationKey,
                },
                {
                  icon: CalendarClock,
                  titleKey: 'landing.how.s3t' as TranslationKey,
                  descKey: 'landing.how.s3d' as TranslationKey,
                },
              ].map((step, index) => (
                <li key={step.titleKey} className="glass-thin rounded-glass-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-digicon-primary/20 text-digicon-primary text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <step.icon
                      className="w-4 h-4 text-digicon-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="font-semibold text-white mb-1">
                    {t(step.titleKey)}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Dual value proposition */}
      <section className="px-4 lg:px-8 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard
            variant="thick"
            className="p-8 animate-fade-in-up group hover:scale-[1.02] transition-transform duration-500"
          >
            <div className="w-14 h-14 rounded-glass-lg glass-chrome flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <Zap className="w-7 h-7 text-digicon-warning" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              {t('landing.startups.title')}
            </h2>

            <p className="text-white/60 mb-4">
              {t('landing.startups.desc')}
            </p>

            <ul className="space-y-2">
              {/*
                * "QR + NFC sharing" was removed: NFC appears nowhere in the
                * codebase. Advertising an unbuilt capability on the pricing
                * page is a refund conversation waiting to happen.
                */}
              {(
                [
                  'landing.startups.b1',
                  'landing.startups.b2',
                  'landing.startups.b3',
                  'landing.startups.b4',
                ] as TranslationKey[]
              ).map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <Check
                    className="w-4 h-4 text-digicon-eco"
                    aria-hidden="true"
                  />
                  {t(item)}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard
            variant="thick"
            className="p-8 animate-fade-in-up group hover:scale-[1.02] transition-transform duration-500"
          >
            <div className="w-14 h-14 rounded-glass-lg glass-chrome flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
              <TrendingUp className="w-7 h-7 text-digicon-secondary" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              {t('landing.smes.title')}
            </h2>

            <p className="text-white/60 mb-4">
              {t('landing.smes.desc')}
            </p>

            <ul className="space-y-2">
              {/*
                * "HubSpot CRM sync" was removed: there is no HubSpot
                * integration, and the claim positioned DigiCon as a feeder
                * into someone else's CRM rather than the relationship layer
                * it is meant to be.
                */}
              {(
                [
                  'landing.smes.b1',
                  'landing.smes.b2',
                  'landing.smes.b3',
                  'landing.smes.b4',
                ] as TranslationKey[]
              ).map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <Check
                    className="w-4 h-4 text-digicon-eco"
                    aria-hidden="true"
                  />
                  {t(item)}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </section>

      {/* Community visual */}
      <section className="px-4 lg:px-8 py-16 max-w-6xl mx-auto">
        <GlassCard
          variant="thick"
          className="overflow-hidden p-0 grid md:grid-cols-[0.9fr_1.1fr] items-stretch relative"
        >
          <div className="relative min-h-64">
            <img
              src="/networking.png"
              alt="Connected community members sharing digital networks"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50"
              aria-hidden="true"
            />
          </div>

          <div className="relative p-8 md:p-10 flex flex-col justify-center overflow-hidden">
            <img
              src="/Cover_2.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />

            <div className="relative">
              <div className="inline-flex items-center gap-2 text-digicon-info text-sm font-medium mb-4">
                <Users className="w-4 h-4" aria-hidden="true" />
                {t('landing.community.kicker')}
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {t('landing.community.title')}
              </h2>

              <p className="text-white/60 leading-relaxed">
                {t('landing.community.desc')}
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-4 lg:px-8 py-16 max-w-6xl mx-auto scroll-mt-24"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          {t('landing.features.title')}
        </h2>

        <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
          {t('landing.features.sub')}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <GlassCard
              key={feature.titleKey}
              variant="regular"
              hover
              className="p-6 animate-fade-in-up"
            >
              <div className="w-12 h-12 rounded-glass-md glass-thin flex items-center justify-center mb-4">
                <feature.icon
                  className={`w-6 h-6 ${feature.color}`}
                  aria-hidden="true"
                />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {t(feature.titleKey)}
              </h3>

              <p className="text-sm text-white/50">
                {t(feature.descKey)}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Eco impact */}
      <section id="eco" className="px-4 lg:px-8 py-16 max-w-5xl mx-auto scroll-mt-24">
        <GlassCard
          variant="thick"
          className="p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-digicon-eco/20 rounded-full blur-[100px]"
            aria-hidden="true"
          />

          <Leaf
            className="w-16 h-16 text-digicon-eco mx-auto mb-6 relative"
            aria-hidden="true"
          />

          <h2 className="text-3xl font-bold text-white mb-4 relative">
            {t('landing.eco.sectionTitle')}
          </h2>

          <p className="text-white/60 max-w-2xl mx-auto mb-8 relative">
            {t('landing.eco.sectionDesc')}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto relative">
            {[
              { value: '500cm²', labelKey: 'landing.eco.statPaper' as TranslationKey },
              { value: '0.02kg', labelKey: 'landing.eco.statCo2' as TranslationKey },
              { value: '17', labelKey: 'landing.eco.statTree' as TranslationKey },
            ].map((stat) => (
              <div
                key={stat.labelKey}
                className="glass-thin rounded-glass-md p-4"
              >
                <p className="text-2xl font-bold text-digicon-eco">
                  {stat.value}
                </p>
                <p className="text-xs text-white/50 mt-1">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="px-4 lg:px-8 py-16 max-w-6xl mx-auto scroll-mt-24"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          {t('landing.pricing.title')}
        </h2>

        <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
          {t('landing.pricing.sub')}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <GlassCard
              key={plan.nameKey}
              variant={plan.highlight ? 'chrome' : 'regular'}
              className={`p-8 relative ${
                plan.highlight
                  ? 'ring-2 ring-digicon-primary/50 scale-105'
                  : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-digicon-primary text-white text-xs font-semibold">
                  {t('landing.pricing.popular')}
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-2">
                {t(plan.nameKey)}
              </h3>

              <p className="text-3xl font-bold text-white mb-1">
                {t(plan.priceKey)}

                {plan.priceKey !== 'landing.pricing.enterprisePrice' && (
                  <span className="text-sm font-normal text-white/50">
                    /mo
                  </span>
                )}
              </p>

              <p className="text-sm text-white/50 mb-6">
                {t(plan.descKey)}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <Check
                      className="w-4 h-4 text-digicon-eco flex-shrink-0"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {plan.selfServe ? (
                  <>
                    <PayPalSubscriptionButton
                      planId={plan.id}
                      onApproved={(subscriptionId) => {
                        console.info(
                          'DigiCon PayPal subscription approved:',
                          subscriptionId,
                        );
                        navigate('/dashboard');
                      }}
                      onError={(error) => {
                        console.error(
                          'DigiCon PayPal subscription error:',
                          error,
                        );
                      }}
                    />

                    <GlassButton
                      variant="ghost"
                      className="w-full"
                      onClick={handlePrimaryCTA}
                    >
                      {t('landing.hero.ctaPrimary')}
                    </GlassButton>
                  </>
                ) : (
                  <GlassButton
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/auth?mode=signup&plan=enterprise')}
                  >
                    {t('landing.pricing.enterpriseCta')}
                    <ArrowRight
                      className="inline ml-2 w-4 h-4"
                      aria-hidden="true"
                    />
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 lg:px-8 py-16 max-w-4xl mx-auto">
        <GlassCard
          variant="chrome"
          className="p-12 text-center relative overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-digicon-primary/10 via-transparent to-digicon-eco/10"
            aria-hidden="true"
          />

          <img
            src="/DigiCon_logo_transparent.jpg"
            alt="DigiCon logo"
            className="w-16 h-16 rounded-full mx-auto mb-6 relative ring-1 ring-white/10"
          />

          <h2 className="text-3xl font-bold text-white mb-4 relative">
            {t('landing.cta.title')}
          </h2>

          <p className="text-white/60 mb-8 relative">
            {t('landing.cta.desc')}
          </p>

          <GlassButton
            size="lg"
            onClick={handlePrimaryCTA}
            className="relative"
          >
            {t('landing.cta.button')}
            <ArrowRight className="inline ml-2 w-5 h-5" aria-hidden="true" />
          </GlassButton>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="px-4 lg:px-8 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DigiConLogo size="sm" />
            <span className="text-white/30 text-sm ml-2">
              {t('landing.footer.tagline')}
            </span>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex items-center gap-6 text-sm text-white/50"
          >
            <Link
              to="/auth"
              className="hover:text-white transition-colors"
            >
              {t('landing.footer.signin')}
            </Link>

            <a
              href="#features"
              className="hover:text-white transition-colors"
            >
              {t('landing.footer.features')}
            </a>

            <a
              href="#pricing"
              className="hover:text-white transition-colors"
            >
              {t('landing.footer.pricing')}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

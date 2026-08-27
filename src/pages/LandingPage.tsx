import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  BarChart3,
  RefreshCw,
  Leaf,
  Smartphone,
  Globe,
  ArrowRight,
  Check,
  Zap,
  TrendingUp,
  Users,
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

  const features = [
    {
      icon: CreditCard,
      titleKey: 'landing.cards.title' as TranslationKey,
      descKey: 'landing.cards.desc' as TranslationKey,
      color: 'text-digicon-primary',
    },
    {
      icon: RefreshCw,
      titleKey: 'landing.crm.title' as TranslationKey,
      descKey: 'landing.crm.desc' as TranslationKey,
      color: 'text-digicon-secondary',
    },
    {
      icon: BarChart3,
      titleKey: 'landing.analytics.title' as TranslationKey,
      descKey: 'landing.analytics.desc' as TranslationKey,
      color: 'text-digicon-info',
    },
    {
      icon: Leaf,
      titleKey: 'landing.eco.title' as TranslationKey,
      descKey: 'landing.eco.desc' as TranslationKey,
      color: 'text-digicon-eco',
    },
    {
      icon: Globe,
      titleKey: 'landing.localized.title' as TranslationKey,
      descKey: 'landing.localized.desc' as TranslationKey,
      color: 'text-digicon-warning',
    },
    {
      icon: Smartphone,
      titleKey: 'landing.cards.title' as TranslationKey,
      descKey: 'landing.cards.desc' as TranslationKey,
      color: 'text-digicon-accent',
    },
  ];

  const pricingPlans: Array<{
  id: Exclude<DigiConPlanId, 'startup'>;
  nameKey: TranslationKey;
  priceKey: TranslationKey;
  descKey: TranslationKey;
  features: readonly string[];
  highlight: boolean;
}> = [
  {
    id: 'starter',
    nameKey: 'landing.pricing.starter' as TranslationKey,
    priceKey: 'landing.pricing.starterPrice' as TranslationKey,
    descKey: 'landing.pricing.starterDesc' as TranslationKey,
    features: DIGICON_PAYPAL_PLANS.starter.features,
    highlight: false,
  },
  {
    id: 'growth',
    nameKey: 'landing.pricing.growth' as TranslationKey,
    priceKey: 'landing.pricing.growthPrice' as TranslationKey,
    descKey: 'landing.pricing.growthDesc' as TranslationKey,
    features: DIGICON_PAYPAL_PLANS.growth.features,
    highlight: true,
  },
  {
    id: 'enterprise',
    nameKey: 'landing.pricing.enterprise' as TranslationKey,
    priceKey: 'landing.pricing.enterprisePrice' as TranslationKey,
    descKey: 'landing.pricing.enterpriseDesc' as TranslationKey,
    features: DIGICON_PAYPAL_PLANS.enterprise.features,
    highlight: false,
  },
  {
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
            <Leaf className="w-4 h-4 text-digicon-eco" />
            <span className="text-sm font-medium">
              {lang === 'en'
                ? 'Your next connection starts here'
                : 'Dito nagsisimula ang susunod mong koneksyon'}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up leading-tight tracking-tight">
            {lang === 'en' ? (
              <>
                Make every{' '}
                <span className="text-gradient">hello</span> count.
              </>
            ) : (
              <>
                Gawing{' '}
                <span className="text-gradient">makabuluhan</span> ang bawat
                hello.
              </>
            )}
          </h1>

          <p
            className="text-lg md:text-xl text-white/60 mb-10 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            {lang === 'en'
              ? 'One beautiful digital card for your identity, your relationships, and the opportunities waiting on the other side of every introduction.'
              : 'Isang magandang digital card para sa iyong pagkakakilanlan, mga koneksyon, at mga oportunidad sa bawat pagpapakilala.'}
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <GlassButton size="lg" onClick={handlePrimaryCTA}>
              {lang === 'en' ? 'Create my card' : 'Gumawa ng card ko'}
              <ArrowRight className="inline ml-2 w-5 h-5" />
            </GlassButton>

            <GlassButton
              variant="ghost"
              size="lg"
              onClick={scrollToFeatures}
            >
              {lang === 'en' ? 'Explore DigiCon' : 'Tingnan ang DigiCon'}
            </GlassButton>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-16 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            {[
              {
                icon: Leaf,
                value: '2.5T',
                label: lang === 'en' ? 'Paper Saved' : 'Naitipid na Papel',
              },
              {
                icon: Users,
                value: '12K+',
                label: lang === 'en' ? 'Contacts Captured' : 'Nakuha na Contact',
              },
              {
                icon: TrendingUp,
                value: '45%',
                label:
                  lang === 'en'
                    ? 'Avg. Conversion'
                    : 'Average na Conversion',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-thin rounded-glass-lg p-4"
              >
                <stat.icon
                  className="w-5 h-5 text-digicon-eco mx-auto mb-2"
                  aria-hidden="true"
                />
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
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
              {[
                'Free digital cards',
                'Zero printing costs',
                'Eco-friendly branding',
                'QR + NFC sharing',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <Check
                    className="w-4 h-4 text-digicon-eco"
                    aria-hidden="true"
                  />
                  {item}
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
              {[
                'HubSpot CRM sync',
                'CSV/Excel export',
                'Lead analytics',
                'Team collaboration',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <Check
                    className="w-4 h-4 text-digicon-eco"
                    aria-hidden="true"
                  />
                  {item}
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
                {lang === 'en'
                  ? 'Built for meaningful connections'
                  : 'Ginawa para sa makabuluhang koneksyon'}
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {lang === 'en'
                  ? 'A good introduction should not disappear.'
                  : 'Hindi dapat nawawala ang magandang pagpapakilala.'}
              </h2>

              <p className="text-white/60 leading-relaxed">
                {lang === 'en'
                  ? 'DigiCon keeps the person, the conversation, and the next step connected—so a quick hello can become a lasting opportunity.'
                  : 'Pinananatiling magkakaugnay ng DigiCon ang tao, usapan, at susunod na hakbang—para ang simpleng hello ay maging pangmatagalang oportunidad.'}
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
          {lang === 'en'
            ? 'Less friction. More connection.'
            : 'Mas kaunting abala. Mas maraming koneksyon.'}
        </h2>

        <p className="text-white/50 text-center mb-12 max-w-2xl mx-auto">
          {lang === 'en'
            ? 'Everything important stays close, clear, and ready when the right moment arrives.'
            : 'Nasa iisang lugar ang mahahalagang bagay—simple, malinaw, at handa sa tamang pagkakataon.'}
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
            {lang === 'en'
              ? 'Every Card Makes a Difference'
              : 'Bawat Card ay May Ambag'}
          </h2>

          <p className="text-white/60 max-w-2xl mx-auto mb-8 relative">
            {lang === 'en'
              ? 'Every time you share a digital card instead of paper, you save resources. Track your impact in real-time and earn eco badges.'
              : 'Sa bawat digital card na ibinabahagi mo sa halip na papel, nakakatipid ka ng resources. Subaybayan ang impact mo at makakuha ng eco badges.'}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto relative">
            {[
              {
                value: '500cm²',
                label: lang === 'en' ? 'Paper per card' : 'Papel bawat card',
              },
              {
                value: '0.02kg',
                label: lang === 'en' ? 'CO₂ per card' : 'CO₂ bawat card',
              },
              {
                value: '17 cards',
                label: lang === 'en' ? '= 1 tree' : '= 1 puno',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-thin rounded-glass-md p-4"
              >
                <p className="text-2xl font-bold text-digicon-eco">
                  {stat.value}
                </p>
                <p className="text-xs text-white/50 mt-1">{stat.label}</p>
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
          {lang === 'en'
            ? 'Simple plans that grow with you, without the complexity.'
            : 'Simpleng plans na lumalago kasama mo, walang komplikasyon.'}
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
                  {lang === 'en' ? 'Most Popular' : 'Pinakasikat'}
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
                <PayPalSubscriptionButton
                  planId={plan.id}
                  onApproved={(subscriptionId) => {
                    console.info('DigiCon PayPal subscription approved:', subscriptionId);
                    navigate('/dashboard');
                  }}
           onError={(error: unknown) => {
                    console.error('DigiCon PayPal subscription error:', error);
                  }}
                />

                <GlassButton
                  variant="ghost"
                  className="w-full"
                  onClick={handlePrimaryCTA}
                >
                  {lang === 'en' ? 'Continue to DigiCon' : 'Magpatuloy sa DigiCon'}
                  <ArrowRight className="inline ml-2 w-4 h-4" />
                </GlassButton>
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
            {lang === 'en'
              ? 'Your next opportunity could start with one hello.'
              : 'Maaaring magsimula ang susunod mong oportunidad sa isang hello.'}
          </h2>

          <p className="text-white/60 mb-8 relative">
            {lang === 'en'
              ? 'Create a card that feels like you, share it in seconds, and stay connected after the moment is over.'
              : 'Gumawa ng card na tunay na ikaw, ibahagi ito sa ilang segundo, at manatiling konektado kahit tapos na ang sandali.'}
          </p>

          <GlassButton
            size="lg"
            onClick={handlePrimaryCTA}
            className="relative"
          >
            {lang === 'en' ? 'Create my card' : 'Gumawa ng card ko'}
            <ArrowRight className="inline ml-2 w-5 h-5" />
          </GlassButton>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="px-4 lg:px-8 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DigiConLogo size="sm" />
            <span className="text-white/30 text-sm ml-2">
              © 2026. Made for You.
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
              {lang === 'en' ? 'Sign In' : 'Mag Sign In'}
            </Link>

            <a
              href="#features"
              className="hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Features' : 'Features'}
            </a>

            <a
              href="#pricing"
              className="hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Pricing' : 'Pricing'}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

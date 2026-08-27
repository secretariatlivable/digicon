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
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { GlassButton, GlassCard } from '@/components/ui/GlassCard';
import { LandingNav } from '@/components/layout/AppLayout';
import { DigiConLogo } from '@/components/brand/DigiConLogo';
import { PayPalSubscriptionButton } from '@/components/PayPalSubscriptionButton';
import {
  DIGICON_PAYPAL_PLANS,
  type DigiConPlanId,
} from '@/config/paypalPlans';

type PaidPlanId = Exclude<DigiConPlanId, 'startup'>;

type PricingPlanView = {
  id: PaidPlanId;
  nameKey: TranslationKey;
  priceKey: TranslationKey;
  descKey: TranslationKey;
  features: readonly string[];
  highlight: boolean;
};

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

  const pricingPlans: readonly PricingPlanView[] = [
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
  ];

  const handlePrimaryCTA = () => {
    navigate(session ? '/dashboard' : '/auth?mode=signup');
  };

  const handleChoosePlan = (planId: PaidPlanId) => {
    if (!session) {
      navigate(`/auth?mode=signup&plan=${encodeURIComponent(planId)}`);
      return;
    }

    if (planId === 'enterprise') {
      navigate('/auth?mode=signup&plan=enterprise');
      return;
    }

    document
      .getElementById(`pricing-checkout-${planId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="relative min-h-screen">
      <LandingNav />

      {/* Full-width introduction banner */}
      <section
        aria-label="DigiCon introduction"
        className="relative w-full overflow-hidden"
      >
        <img
          src="/DigiCon_Banner.png"
          alt="DigiCon digital business cards, CRM automation, and analytics platform for Philippine SMEs and startups"
          className="block h-auto w-full"
        />
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-1/4 top-20 h-96 w-96 animate-pulse rounded-full bg-digicon-primary/20 blur-[120px]" />

          <div
            className="absolute right-1/4 top-40 h-96 w-96 animate-pulse rounded-full bg-digicon-secondary/20 blur-[120px]"
            style={{ animationDelay: '1s' }}
          />

          <div
            className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-digicon-eco/15 blur-[120px]"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="hero-kicker mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 animate-fade-in-down">
            <Leaf
              className="h-4 w-4 text-digicon-eco"
              aria-hidden="true"
            />
            <span className="text-sm font-medium">
              {lang === 'en'
                ? 'Your next connection starts here'
                : 'Dito nagsisimula ang susunod mong koneksyon'}
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white animate-fade-in-up md:text-7xl">
            {lang === 'en' ? (
              <>
                Make every <span className="text-gradient">hello</span> count.
              </>
            ) : (
              <>
                Gawing <span className="text-gradient">makabuluhan</span> ang
                bawat hello.
              </>
            )}
          </h1>

          <p
            className="mx-auto mb-10 max-w-3xl text-lg text-white/60 animate-fade-in-up md:text-xl"
            style={{ animationDelay: '0.1s' }}
          >
            {lang === 'en'
              ? 'One beautiful digital card for your identity, your relationships, and the opportunities waiting on the other side of every introduction.'
              : 'Isang magandang digital card para sa iyong pagkakakilanlan, mga koneksyon, at mga oportunidad sa bawat pagpapakilala.'}
          </p>

          <div
            className="flex flex-col items-center justify-center gap-4 animate-fade-in-up sm:flex-row"
            style={{ animationDelay: '0.2s' }}
          >
            <GlassButton size="lg" onClick={handlePrimaryCTA}>
              {lang === 'en' ? 'Create my card' : 'Gumawa ng card ko'}
              <ArrowRight className="ml-2 inline h-5 w-5" aria-hidden="true" />
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
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 animate-fade-in-up"
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
                label:
                  lang === 'en'
                    ? 'Contacts Captured'
                    : 'Nakuha na Contact',
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
                  className="mx-auto mb-2 h-5 w-5 text-digicon-eco"
                  aria-hidden="true"
                />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual value proposition */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard
            variant="thick"
            className="group p-8 animate-fade-in-up transition-transform duration-500 hover:scale-[1.02]"
          >
            <div className="glass-chrome mb-6 flex h-14 w-14 items-center justify-center rounded-glass-lg transition-transform group-hover:rotate-6">
              <Zap
                className="h-7 w-7 text-digicon-warning"
                aria-hidden="true"
              />
            </div>

            <h2 className="mb-3 text-2xl font-bold text-white">
              {t('landing.startups.title')}
            </h2>

            <p className="mb-4 text-white/60">{t('landing.startups.desc')}</p>

            <ul className="space-y-2">
              {[
                'Free digital cards',
                '2 cards included',
                'Zero printing costs',
                'Eco-friendly branding',
                'QR + NFC sharing',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <Check
                    className="h-4 w-4 text-digicon-eco"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard
            variant="thick"
            className="group p-8 animate-fade-in-up transition-transform duration-500 hover:scale-[1.02]"
          >
            <div className="glass-chrome mb-6 flex h-14 w-14 items-center justify-center rounded-glass-lg transition-transform group-hover:rotate-6">
              <TrendingUp
                className="h-7 w-7 text-digicon-secondary"
                aria-hidden="true"
              />
            </div>

            <h2 className="mb-3 text-2xl font-bold text-white">
              {t('landing.smes.title')}
            </h2>

            <p className="mb-4 text-white/60">{t('landing.smes.desc')}</p>

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
                    className="h-4 w-4 text-digicon-eco"
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
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <GlassCard
          variant="thick"
          className="relative grid items-stretch overflow-hidden p-0 md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="relative min-h-64">
            <img
              src="/networking.png"
              alt="Connected community members sharing digital networks"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50"
              aria-hidden="true"
            />
          </div>

          <div className="relative flex flex-col justify-center overflow-hidden p-8 md:p-10">
            <img
              src="/Cover_2.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-10"
            />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-digicon-info">
                <Users className="h-4 w-4" aria-hidden="true" />
                {lang === 'en'
                  ? 'Built for meaningful connections'
                  : 'Ginawa para sa makabuluhang koneksyon'}
              </div>

              <h2 className="mb-4 text-3xl font-bold text-white">
                {lang === 'en'
                  ? 'A good introduction should not disappear.'
                  : 'Hindi dapat nawawala ang magandang pagpapakilala.'}
              </h2>

              <p className="leading-relaxed text-white/60">
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
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 lg:px-8"
      >
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {lang === 'en'
            ? 'Less friction. More connection.'
            : 'Mas kaunting abala. Mas maraming koneksyon.'}
        </h2>

        <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
          {lang === 'en'
            ? 'Everything important stays close, clear, and ready when the right moment arrives.'
            : 'Nasa iisang lugar ang mahahalagang bagay—simple, malinaw, at handa sa tamang pagkakataon.'}
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <GlassCard
              key={`${feature.titleKey}-${feature.color}`}
              variant="regular"
              hover
              className="p-6 animate-fade-in-up"
            >
              <div className="glass-thin mb-4 flex h-12 w-12 items-center justify-center rounded-glass-md">
                <feature.icon
                  className={`h-6 w-6 ${feature.color}`}
                  aria-hidden="true"
                />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white">
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
      <section
        id="eco"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 lg:px-8"
      >
        <GlassCard
          variant="thick"
          className="relative overflow-hidden p-8 text-center md:p-12"
        >
          <div
            className="absolute right-0 top-0 h-64 w-64 rounded-full bg-digicon-eco/20 blur-[100px]"
            aria-hidden="true"
          />

          <Leaf
            className="relative mx-auto mb-6 h-16 w-16 text-digicon-eco"
            aria-hidden="true"
          />

          <h2 className="relative mb-4 text-3xl font-bold text-white">
            {lang === 'en'
              ? 'Every Card Makes a Difference'
              : 'Bawat Card ay May Ambag'}
          </h2>

          <p className="relative mx-auto mb-8 max-w-2xl text-white/60">
            {lang === 'en'
              ? 'Every time you share a digital card instead of paper, you save resources. Track your impact in real-time and earn eco badges.'
              : 'Sa bawat digital card na ibinabahagi mo sa halip na papel, nakakatipid ka ng resources. Subaybayan ang impact mo at makakuha ng eco badges.'}
          </p>

          <div className="relative mx-auto grid max-w-2xl grid-cols-3 gap-4">
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
                <p className="mt-1 text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 lg:px-8"
      >
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-digicon-eco" aria-hidden="true" />
            {lang === 'en'
              ? 'Start free. Upgrade when you need more.'
              : 'Magsimula nang libre. Mag-upgrade kapag kailangan.'}
          </div>

          <h2
            id="pricing-heading"
            className="mb-4 text-3xl font-bold text-white md:text-4xl"
          >
            {t('landing.pricing.title')}
          </h2>

          <p className="text-white/50">
            {lang === 'en'
              ? 'Choose the plan that fits your networking stage. Startups can begin free, while paid plans unlock more cards, CRM capability, collaboration, and wallet access.'
              : 'Piliin ang plan na angkop sa iyong networking stage. Maaaring magsimula nang libre ang startups, habang binubuksan ng paid plans ang mas maraming card, CRM, collaboration, at wallet features.'}
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-2xl border border-digicon-eco/20 bg-digicon-eco/5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="glass-chrome flex h-11 w-11 items-center justify-center rounded-xl">
            <Zap className="h-5 w-5 text-digicon-warning" aria-hidden="true" />
          </div>

          <div>
            <p className="font-semibold text-white">
              {lang === 'en'
                ? 'Startup plan — free to begin'
                : 'Startup plan — libre upang magsimula'}
            </p>
            <p className="mt-1 text-sm text-white/55">
              {lang === 'en'
                ? 'Create up to 2 digital business cards before payment or upgrade is required. Payment triggers are enforced inside the app when you reach the applicable limits.'
                : 'Makagawa ng hanggang 2 digital business cards bago kailanganin ang payment o upgrade. Ipinapatupad sa app ang payment triggers kapag naabot ang mga limit.'}
            </p>
          </div>

          <GlassButton
            variant="ghost"
            onClick={handlePrimaryCTA}
            className="whitespace-nowrap"
          >
            {session
              ? lang === 'en'
                ? 'Go to dashboard'
                : 'Pumunta sa dashboard'
              : lang === 'en'
                ? 'Start free'
                : 'Magsimula nang libre'}
            <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
          </GlassButton>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => {
            const paypalEnabled =
              plan.id !== 'enterprise' &&
              DIGICON_PAYPAL_PLANS[plan.id].selfServe &&
              Boolean(DIGICON_PAYPAL_PLANS[plan.id].paypalPlanId);

            return (
              <GlassCard
                key={plan.id}
                variant={plan.highlight ? 'chrome' : 'regular'}
                className={`relative flex h-full flex-col p-8 ${
                  plan.highlight
                    ? 'ring-2 ring-digicon-primary/50 md:scale-105'
                    : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-digicon-primary px-4 py-1 text-xs font-semibold text-white">
                    {lang === 'en' ? 'Most Popular' : 'Pinakasikat'}
                  </div>
                )}

                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {t(plan.nameKey)}
                    </h3>

                    <p className="text-sm text-white/50">
                      {t(plan.descKey)}
                    </p>
                  </div>

                  {plan.id === 'growth' ? (
                    <TrendingUp
                      className="h-6 w-6 shrink-0 text-digicon-secondary"
                      aria-hidden="true"
                    />
                  ) : (
                    <Building2
                      className="h-6 w-6 shrink-0 text-white/30"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-white">
                    {t(plan.priceKey)}
                    {plan.priceKey !== 'landing.pricing.enterprisePrice' && (
                      <span className="text-sm font-normal text-white/50">
                        /mo
                      </span>
                    )}
                  </p>

                  {plan.id === 'enterprise' && (
                    <p className="mt-1 text-xs text-white/40">
                      {lang === 'en'
                        ? 'Talk to DigiCon for a tailored quote.'
                        : 'Makipag-ugnayan sa DigiCon para sa custom na quote.'}
                    </p>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-white/70"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-digicon-eco"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div
                  id={`pricing-checkout-${plan.id}`}
                  className="space-y-3"
                >
                  {!session ? (
                    <GlassButton
                      size="lg"
                      variant={plan.highlight ? 'primary' : 'default'}
                      className="w-full"
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      {lang === 'en' ? 'Choose Plan' : 'Piliin ang Plan'}
                      <ArrowRight
                        className="ml-2 inline h-4 w-4"
                        aria-hidden="true"
                      />
                    </GlassButton>
                  ) : paypalEnabled ? (
                    <PayPalSubscriptionButton
                      planId={plan.id}
                      onApproved={(subscriptionId) => {
                        console.info(
                          'DigiCon PayPal subscription approved:',
                          subscriptionId,
                        );
                        navigate('/dashboard');
                      }}
                    />
                  ) : (
                    <GlassButton
                      size="lg"
                      variant={plan.highlight ? 'primary' : 'default'}
                      className="w-full"
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      {lang === 'en'
                        ? 'Talk to DigiCon'
                        : 'Makipag-ugnayan sa DigiCon'}
                      <ArrowRight
                        className="ml-2 inline h-4 w-4"
                        aria-hidden="true"
                      />
                    </GlassButton>
                  )}

                  {session && paypalEnabled && (
                    <p className="text-center text-[11px] leading-relaxed text-white/40">
                      {lang === 'en'
                        ? 'Secure recurring subscription checkout is handled by PayPal.'
                        : 'Ang secure recurring subscription checkout ay pinoproseso ng PayPal.'}
                    </p>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <GlassCard
          variant="chrome"
          className="relative overflow-hidden p-12 text-center"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-digicon-primary/10 via-transparent to-digicon-eco/10"
            aria-hidden="true"
          />

          <img
            src="/DigiCon_logo_transparent.jpg"
            alt="DigiCon logo"
            className="relative mx-auto mb-6 h-16 w-16 rounded-full ring-1 ring-white/10"
          />

          <h2 className="relative mb-4 text-3xl font-bold text-white">
            {lang === 'en'
              ? 'Your next opportunity could start with one hello.'
              : 'Maaaring magsimula ang susunod mong oportunidad sa isang hello.'}
          </h2>

          <p className="relative mb-8 text-white/60">
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
            <ArrowRight className="ml-2 inline h-5 w-5" aria-hidden="true" />
          </GlassButton>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-12 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <DigiConLogo size="sm" />
            <span className="ml-2 text-sm text-white/30">
              © 2026. Made for You.
            </span>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex items-center gap-6 text-sm text-white/50"
          >
            <Link
              to="/auth"
              className="transition-colors hover:text-white"
            >
              {lang === 'en' ? 'Sign In' : 'Mag Sign In'}
            </Link>

            <a
              href="#features"
              className="transition-colors hover:text-white"
            >
              Features
            </a>

            <a
              href="#pricing"
              className="transition-colors hover:text-white"
            >
              Pricing
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

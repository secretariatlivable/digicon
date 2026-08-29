import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bell, Check, Compass, Contact, Eye, Handshake, Heart, Layers, Lightbulb, Link2,
  MapPin, MessageSquare, Network, NotebookPen, QrCode, Share2, ShieldCheck, Sparkles,
  Target, TrendingUp, UserCircle, Users, Wallet, Workflow,
} from 'lucide-react';
import { useAuth, useLanguage } from '@/lib/auth';
import { translate, type TranslationKey } from '@/lib/i18n';
import { PayPalSubscriptionButton } from '@/components/PayPalSubscriptionButton';
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton';
import { DIGICON_PAYPAL_PLANS, type DigiConPlanId } from '@/config/paypalPlans';
import { isStripePlanId } from '@/config/stripePlans';
import { GlassButton, GlassCard } from '@/components/ui/GlassCard';
import { Section, SectionHeading, Hl, Pullquote } from '@/components/ui/Section';
import { SectionBanner } from '@/components/ui/SectionBanner';
import { AmbientVideo } from '@/components/ui/AmbientVideo';
import { Reveal } from '@/components/ui/Reveal';
import { Tooltip } from '@/components/ui/Tooltip';
import { Collapsible, CollapsibleGroup } from '@/components/ui/Collapsible';
import { ConnectionGraph } from '@/components/ui/ConnectionGraph';
import { FlowStrip, type FlowStep } from '@/components/ui/FlowStrip';
import {
  ACCENT, CheckList, FeatureCard, IconChip, StatTile, StepCard, TermPill,
} from '@/components/ui/Tiles';
import { LandingNav } from '@/components/layout/LandingNav';
import { MobileAppNav } from '@/components/layout/MobileAppNav';
import { SiteFooter, VocabularyMarquee } from '@/components/layout/SiteFooter';
import { scrollToSection } from '@/lib/motion';
import {
  AUDIENCES, BIG_IDEA, BRAND, FAQ, FINAL_CTA, GRAPH, HERO, HOW_IT_WORKS, MOVEMENTS,
  PHILOSOPHY, PRIVACY, PROBLEM, SIMPLICITY, VOCABULARY, WHAT_IS, WHY, type Movement,
} from '@/content/landing';

/* Icons are paired to content here rather than inside the content module, so
   copy stays free of presentation concerns. */
const MOVEMENT_ICONS: Record<string, typeof UserCircle> = {
  create: UserCircle,
  share: Share2,
  connect: Handshake,
  capture: NotebookPen,
  manage: Layers,
  followup: Bell,
};

const AUDIENCE_ICONS: Record<string, typeof Contact> = {
  professionals: Contact,
  teams: Users,
  organizations: Network,
};

const JOURNEY: FlowStep[] = [
  { label: 'Create', icon: UserCircle, accent: 'violet', href: '#create' },
  { label: 'Share', icon: Share2, accent: 'info', href: '#share' },
  { label: 'Connect', icon: Handshake, accent: 'primary', href: '#connect' },
  { label: 'Remember', icon: NotebookPen, accent: 'gold', href: '#capture' },
  { label: 'Follow Up', icon: Bell, accent: 'eco', href: '#followup' },
];

const SHARE_CHANNELS = [
  { label: 'QR', icon: QrCode },
  { label: 'Link', icon: Link2 },
  { label: 'NFC', icon: Sparkles },
  { label: 'Email', icon: MessageSquare },
  { label: 'Chat', icon: MessageSquare },
  { label: 'Wallet', icon: Wallet },
];

const GRAPH_ICONS = [Users, MapPin, TrendingUp, Target];
const PRIVACY_ICONS = [Handshake, Eye, ShieldCheck];

/* ------------------------------------------------------------------ hero */

function Hero() {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-32">
      <AmbientVideo />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full glass-thin px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-digicon-info">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {HERO.eyebrow}
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="text-display-lg font-bold text-white text-balance">
                {HERO.titleLead}
                <br />
                <Hl>{HERO.titleAccent}</Hl>
              </h1>
            </Reveal>

            {/* The staccato opening from the approved copy — one line per beat. */}
            <Reveal delay={120}>
              <div className="mt-7 space-y-1 border-l-2 border-digicon-info/40 pl-4 text-white/55">
                {HERO.verses.map((line) => (
                  <p key={line} className="text-sm sm:text-base">{line}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 max-w-prose text-lede text-white/70">{HERO.body}</p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-6 space-y-0.5">
                {HERO.closer.map((line, i) => (
                  <p
                    key={line}
                    className={i === 1 ? 'text-lg font-semibold text-white' : 'text-lg text-white/50'}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <GlassButton
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => navigate(session ? '/dashboard' : '/auth?mode=signup')}
                >
                  {HERO.ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  {HERO.ctaSecondary}
                </GlassButton>
              </div>
              <p className="mt-4 text-xs text-white/40">{HERO.reassurance}</p>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                {HERO.stats.map((stat) => (
                  <StatTile key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            </Reveal>
          </div>

          {/* Living network figure — the product's core idea, shown not told */}
          <Reveal from="scale" delay={140} className="hidden lg:block">
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-full bg-digicon-primary/15 blur-3xl"
                aria-hidden="true"
              />
              <div className="metal metal-sheen relative p-8">
                <ConnectionGraph />
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-digicon-info">
                    The connection graph
                  </p>
                  <p className="mt-1.5 text-sm text-white/60">
                    Every introduction adds a point. Over time, the shape of your
                    network becomes something you can actually read.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={380} className="mt-14">
          <FlowStrip steps={JOURNEY} />
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- movement */

function MovementSection({ item, index }: { item: Movement; index: number }) {
  const Icon = MOVEMENT_ICONS[item.id] ?? Sparkles;
  const flipped = index % 2 === 1;
  const a = ACCENT[item.accent];

  return (
    <Section id={item.id} size="sm" aria-labelledby={`${item.id}-title`}>
      <SectionBanner name={item.banner} scrim="side">
        <div
          className={`grid items-center gap-8 p-6 sm:p-10 lg:p-14 ${
            flipped ? 'lg:grid-cols-[0.9fr_1.1fr]' : 'lg:grid-cols-[1.1fr_0.9fr]'
          }`}
        >
          <div className={flipped ? 'lg:order-2' : ''}>
            <Reveal from={flipped ? 'right' : 'left'}>
              <p className={`mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] ${a.text}`}>
                <IconChip icon={Icon} accent={item.accent} size="sm" />
                {item.kicker}
              </p>

              <h2 id={`${item.id}-title`} className="text-display-sm font-bold text-white text-balance">
                {item.title}
              </h2>

              <p className={`mt-4 text-lg font-medium ${a.text}`}>{item.lede}</p>

              <div className="mt-5 max-w-prose space-y-3 text-white/65">
                {item.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>

              {item.closer && <Pullquote className="mt-6">{item.closer}</Pullquote>}

              {item.cta && (
                <button
                  type="button"
                  onClick={() => scrollToSection('final-cta')}
                  className={`mt-7 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${a.bg} ${a.ring} ${a.text} border-transparent ring-1`}
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </Reveal>
          </div>

          <Reveal from={flipped ? 'left' : 'right'} delay={80} className={flipped ? 'lg:order-1' : ''}>
            <div className="metal p-6 sm:p-7">
              {/* The Share movement gets the channel grid; the rest get their beats */}
              {item.id === 'share' ? (
                <ul className="grid grid-cols-3 gap-2.5">
                  {SHARE_CHANNELS.map((channel) => (
                    <li
                      key={channel.label}
                      className="flex flex-col items-center gap-2 rounded-glass-md border border-white/[0.07] bg-white/[0.03] py-4"
                    >
                      <channel.icon className="h-5 w-5 text-digicon-info" aria-hidden="true" />
                      <span className="text-xs font-semibold text-white/75">{channel.label}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3">
                  {item.beats.map((beat) => (
                    <li key={beat} className="flex items-start gap-3">
                      <span
                        className={`mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current ${a.text}`}
                        aria-hidden="true"
                      />
                      <span className="text-base text-white/80">{beat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </SectionBanner>
    </Section>
  );
}


/* -------------------------------------------------------------- pricing */

/**
 * Value-first pricing.
 *
 * The Lean Canvas is explicit that DigiCon should not charge for discovery —
 * it charges once DigiCon has become infrastructure for someone's professional
 * identity. The section is framed that way, and the PayPal subscription flow
 * from `@/config/paypalPlans` is what actually takes the payment.
 */
function Pricing() {
  const navigate = useNavigate();
  const [lang] = useLanguage();
  const t = (key: TranslationKey) => translate(key, lang);

  /* `startup` is the free tier and has no billing plan on either rail. */
  const plans: Array<{
    id: Exclude<DigiConPlanId, 'startup'>;
    nameKey: TranslationKey;
    priceKey: TranslationKey;
    descKey: TranslationKey;
    features: readonly string[];
    selfServe: boolean;
    highlight: boolean;
  }> = [
    {
      id: 'starter',
      nameKey: 'landing.pricing.starter',
      priceKey: 'landing.pricing.starterPrice',
      descKey: 'landing.pricing.starterDesc',
      features: DIGICON_PAYPAL_PLANS.starter.features,
      selfServe: DIGICON_PAYPAL_PLANS.starter.selfServe,
      highlight: false,
    },
    {
      id: 'growth',
      nameKey: 'landing.pricing.growth',
      priceKey: 'landing.pricing.growthPrice',
      descKey: 'landing.pricing.growthDesc',
      features: DIGICON_PAYPAL_PLANS.growth.features,
      selfServe: DIGICON_PAYPAL_PLANS.growth.selfServe,
      highlight: true,
    },
    {
      id: 'enterprise',
      nameKey: 'landing.pricing.enterprise',
      priceKey: 'landing.pricing.enterprisePrice',
      descKey: 'landing.pricing.enterpriseDesc',
      features: DIGICON_PAYPAL_PLANS.enterprise.features,
      selfServe: DIGICON_PAYPAL_PLANS.enterprise.selfServe,
      highlight: false,
    },
  ];

  return (
    <Section id="pricing" size="md" bordered aria-labelledby="pricing-title">
      <SectionHeading
        id="pricing-title"
        kicker="Pricing"
        title={t('landing.pricing.title')}
        lede={t('landing.pricing.sub')}
      />

      <Reveal delay={60} className="mx-auto mt-8 max-w-2xl">
        <div className="metal p-5 text-center">
          <p className="text-sm text-white/70">
            Start with your first two identities free. You are never charged for
            discovering DigiCon — only once it has become part of how you work.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid items-start gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 80} className="h-full">
            <GlassCard
              variant={plan.highlight ? 'chrome' : 'regular'}
              className={`relative h-full p-7 ${
                plan.highlight ? 'ring-2 ring-digicon-primary/50 md:-translate-y-3' : ''
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-digicon-primary px-4 py-1 text-xs font-semibold text-white">
                  {t('landing.pricing.popular')}
                </span>
              )}

              <h3 className="text-xl font-bold text-white">{t(plan.nameKey)}</h3>

              <p className="mt-2 text-3xl font-bold text-white">
                {t(plan.priceKey)}
                {plan.priceKey !== 'landing.pricing.enterprisePrice' && (
                  <span className="text-sm font-normal text-white/50">/mo</span>
                )}
              </p>

              <p className="mt-2 text-sm text-white/50">{t(plan.descKey)}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-digicon-eco" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3">
                {plan.selfServe ? (
                  <>
                    {/* Stripe is the primary rail: card, wallet and bank in one
                        hosted flow. PayPal stays available underneath — both
                        write to the same `subscriptions` table, so entitlements
                        are identical whichever the buyer picks. */}
                    {isStripePlanId(plan.id) && (
                      <StripeCheckoutButton
                        planId={plan.id}
                        onError={(error) => {
                          console.error('DigiCon Stripe checkout error:', error);
                        }}
                      />
                    )}

                    <div className="flex items-center gap-3 py-1" aria-hidden="true">
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/30">
                        or
                      </span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <PayPalSubscriptionButton
                      planId={plan.id}
                      onApproved={(subscriptionId) => {
                        console.info('DigiCon PayPal subscription approved:', subscriptionId);
                        navigate('/dashboard');
                      }}
                      onError={(error) => {
                        console.error('DigiCon PayPal subscription error:', error);
                      }}
                    />
                  </>
                ) : (
                  <GlassButton
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/auth?mode=signup&plan=enterprise')}
                  >
                    {t('landing.pricing.enterpriseCta')}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- page */


export function LandingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const startHref = session ? '/dashboard' : '/auth?mode=signup';

  return (
    <div className="relative min-h-screen has-appnav">
      <LandingNav />

      <main id="main">
        <Hero />

        {/* ---------------------------------------------------- problem */}
        <Section id="problem" size="md" aria-labelledby="problem-title">
          <SectionBanner name={PROBLEM.banner}>
            <div className="p-6 sm:p-10 lg:p-16">
              <SectionHeading
                id="problem-title"
                kicker={PROBLEM.kicker}
                title={
                  <>
                    {PROBLEM.title}
                    <br />
                    <Hl>{PROBLEM.titleAccent}</Hl>
                  </>
                }
              />

              <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <Reveal from="left">
                  <p className="text-lede text-white/70">{PROBLEM.intro}</p>
                  <ul className="mt-5 space-y-3">
                    {PROBLEM.cannotRemember.map((line) => (
                      <li
                        key={line}
                        className="flex items-center gap-3 rounded-glass-md border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 text-white/80"
                      >
                        <Compass className="h-4 w-4 flex-shrink-0 text-digicon-warning" aria-hidden="true" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal from="right" delay={80}>
                  <p className="text-white/60">{PROBLEM.after}</p>
                  <Pullquote className="mt-6">{PROBLEM.pull}</Pullquote>
                  <div className="metal mt-8 p-6">
                    <p className="text-sm text-white/50">{PROBLEM.beliefLead}</p>
                    <p className="mt-2 text-lg font-semibold leading-snug text-white">
                      {PROBLEM.belief}
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </SectionBanner>
        </Section>

        {/* --------------------------------------------------- big idea */}
        <Section id="big-idea" size="md" aria-labelledby="big-idea-title">
          <SectionBanner name={BIG_IDEA.banner}>
            <div className="p-6 sm:p-10 lg:p-16">
              <SectionHeading
                id="big-idea-title"
                kicker={BIG_IDEA.kicker}
                title={
                  <>
                    {BIG_IDEA.title} <Hl>{BIG_IDEA.titleAccent}</Hl>
                  </>
                }
              />

              <Reveal delay={60} className="mx-auto mt-8 max-w-prose space-y-3 text-center text-white/65">
                {BIG_IDEA.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </Reveal>

              <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {BIG_IDEA.steps.map((step, i) => (
                  <Reveal key={step} delay={i * 70} as="li">
                    <div className="metal metal-sheen h-full p-5">
                      <span className="font-mono text-xs text-digicon-info" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="mt-2 text-sm font-semibold leading-snug text-white">{step}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>

              <Reveal delay={120} className="mt-10 text-center">
                <p className="text-white/50">{BIG_IDEA.closerLead}</p>
                <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{BIG_IDEA.closer}</p>
              </Reveal>
            </div>
          </SectionBanner>
        </Section>

        {/* ------------------------------------------------- what is it */}
        <Section id="what-is" size="md" aria-labelledby="what-is-title">
          <SectionBanner name={WHAT_IS.banner}>
            <div className="p-6 sm:p-10 lg:p-16">
              <SectionHeading
                id="what-is-title"
                kicker={WHAT_IS.kicker}
                title={WHAT_IS.title}
                lede={WHAT_IS.body[0]}
              />

              <Reveal delay={60} className="mx-auto mt-6 max-w-prose space-y-3 text-center text-white/60">
                {WHAT_IS.body.slice(1).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </Reveal>

              <div className="mt-10">
                <FlowStrip steps={JOURNEY} />
                <p className="mt-4 text-center text-sm text-white/40">{WHAT_IS.flowNote}</p>
              </div>
            </div>
          </SectionBanner>
        </Section>

        {/* ------------------------------ the six movements of the product */}
        <div id="journey" tabIndex={-1}>
          {MOVEMENTS.map((item, i) => (
            <MovementSection key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* ---------------------------------------------- connection graph */}
        <Section id="graph" size="md" aria-labelledby="graph-title">
          <SectionBanner name={GRAPH.banner}>
            <div className="p-6 sm:p-10 lg:p-16">
              <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
                <Reveal from="left">
                  <ConnectionGraph className="mx-auto max-w-sm" />
                </Reveal>

                <div>
                  <SectionHeading
                    id="graph-title"
                    kicker={GRAPH.kicker}
                    align="left"
                    title={
                      <>
                        {GRAPH.title} <Hl>{GRAPH.titleAccent}</Hl>
                      </>
                    }
                  />

                  <Reveal delay={60} className="mt-5 max-w-prose space-y-3 text-white/65">
                    {GRAPH.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </Reveal>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {GRAPH.facets.map((facet, i) => (
                      <Reveal key={facet.title} delay={i * 70}>
                        <div className="metal metal-sheen h-full p-5">
                          <IconChip icon={GRAPH_ICONS[i] ?? Users} accent="info" size="sm" />
                          <h3 className="mt-3.5 text-sm font-bold text-white">{facet.title}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-white/55">{facet.desc}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <Pullquote className="mt-8">{GRAPH.closer}</Pullquote>
                </div>
              </div>
            </div>
          </SectionBanner>
        </Section>

        {/* ----------------------------------------------------- audiences */}
        {AUDIENCES.map((audience) => (
          <Section key={audience.id} id={audience.id} size="sm" aria-labelledby={`${audience.id}-title`}>
            <SectionBanner name={audience.banner} scrim="side">
              <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
                <Reveal from="left">
                  <p className={`mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] ${ACCENT[audience.accent].text}`}>
                    <IconChip icon={AUDIENCE_ICONS[audience.id] ?? Users} accent={audience.accent} size="sm" />
                    {audience.kicker}
                  </p>

                  <h2 id={`${audience.id}-title`} className="text-display-sm font-bold text-white text-balance">
                    {audience.title}
                  </h2>

                  <p className={`mt-4 text-lg font-medium ${ACCENT[audience.accent].text}`}>
                    {audience.lede}
                  </p>

                  <div className="mt-5 max-w-prose space-y-3 text-white/65">
                    {audience.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(startHref)}
                    className={`mt-7 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ring-1 transition-transform hover:-translate-y-0.5 ${ACCENT[audience.accent].bg} ${ACCENT[audience.accent].ring} ${ACCENT[audience.accent].text}`}
                  >
                    {audience.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Reveal>

                <Reveal from="right" delay={80}>
                  <div className="metal metal-sheen p-6 sm:p-7">
                    <CheckList items={[...audience.points]} accent={audience.accent} />
                    <p className="mt-6 border-t border-white/10 pt-5 text-sm font-medium text-white/70">
                      {audience.closer}
                    </p>
                  </div>
                </Reveal>
              </div>
            </SectionBanner>
          </Section>
        ))}

        {/* ---------------------------------------------------- simplicity */}
        <Section id="simplicity" size="md" aria-labelledby="simplicity-title">
          <SectionBanner name={SIMPLICITY.banner}>
            <div className="p-6 sm:p-10 lg:p-16">
              <SectionHeading
                id="simplicity-title"
                kicker={SIMPLICITY.kicker}
                title={SIMPLICITY.title}
                lede={SIMPLICITY.body[0]}
              />

              <Reveal delay={60} className="mx-auto mt-8 max-w-2xl text-center">
                <p className="text-xl font-semibold text-white sm:text-2xl">{SIMPLICITY.question}</p>
              </Reveal>

              <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {SIMPLICITY.needs.map((need, i) => (
                  <Reveal key={need} delay={i * 70} as="li">
                    <div className="metal h-full p-5 text-center">
                      <IconChip
                        icon={[UserCircle, Share2, Heart, Lightbulb, Bell][i] ?? Sparkles}
                        accent="info"
                        size="sm"
                        className="mx-auto"
                      />
                      <p className="mt-3 text-sm font-medium text-white/85">{need}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={140} className="mt-10 text-center">
                <p className="text-lg font-bold text-white">{SIMPLICITY.thatsIt}</p>
                <div className="mt-5 space-y-1">
                  {SIMPLICITY.closer.map((line, i) => (
                    <p key={line} className={i === 1 ? 'text-white font-semibold' : 'text-white/50'}>
                      {line}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          </SectionBanner>
        </Section>

        {/* ------------------------------------------------------- privacy */}
        <Section id="privacy" size="md" aria-labelledby="privacy-title">
          <SectionBanner name={PRIVACY.banner}>
            <div className="p-6 sm:p-10 lg:p-16">
              <SectionHeading
                id="privacy-title"
                kicker={PRIVACY.kicker}
                title={PRIVACY.title}
                lede={PRIVACY.body[0]}
              />

              <Reveal delay={60} className="mx-auto mt-5 max-w-prose text-center text-white/60">
                <p>{PRIVACY.body[1]}</p>
              </Reveal>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {PRIVACY.pillars.map((pillar, i) => (
                  <FeatureCard
                    key={pillar.title}
                    icon={PRIVACY_ICONS[i] ?? ShieldCheck}
                    title={pillar.title}
                    accent="eco"
                    delay={i * 80}
                  >
                    {pillar.desc}
                  </FeatureCard>
                ))}
              </div>
            </div>
          </SectionBanner>
        </Section>

        {/* ----------------------------------------------------------- why */}
        <Section id="why" size="md" width="narrow" aria-labelledby="why-title">
          <SectionHeading
            id="why-title"
            kicker={WHY.kicker}
            title={
              <>
                {WHY.title} <Hl>{WHY.titleAccent}</Hl>
              </>
            }
            lede={WHY.lead}
          />

          <ul className="mt-10 space-y-3">
            {WHY.moments.map((moment, i) => (
              <Reveal key={moment} delay={i * 80} as="li">
                <div className="metal metal-sheen flex items-start gap-4 p-5">
                  <span
                    className="mt-0.5 font-mono text-xs text-digicon-info"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-base text-white/85 sm:text-lg">{moment}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={340} className="mt-10 text-center">
            <p className="text-xl font-bold text-white sm:text-2xl">{WHY.closer}</p>
          </Reveal>
        </Section>

        {/* ---------------------------------------------------- philosophy */}
        <Section id="philosophy" size="md" width="narrow" bordered aria-labelledby="philosophy-title">
          <SectionHeading
            id="philosophy-title"
            kicker={PHILOSOPHY.kicker}
            title={
              <>
                {PHILOSOPHY.title} <Hl>{PHILOSOPHY.titleAccent}</Hl>
              </>
            }
          />

          <Reveal delay={60}>
            <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2.5">
              {PHILOSOPHY.remembered.map((item) => (
                <li key={item}>
                  <TermPill>{item}</TermPill>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={140} className="mt-10 text-center">
            <p className="text-sm text-white/45">{PHILOSOPHY.quoteLead}</p>
            <blockquote className="mt-3">
              <p className="text-2xl font-bold text-white sm:text-3xl">
                “{PHILOSOPHY.quote}”
              </p>
            </blockquote>
            <p className="mt-8 text-lede text-white/60">{PHILOSOPHY.closer}</p>
          </Reveal>
        </Section>

        {/* -------------------------------------------------- how it works */}
        <Section id="how-it-works" size="md" bordered aria-labelledby="how-title">
          <SectionHeading
            id="how-title"
            kicker={HOW_IT_WORKS.kicker}
            title={HOW_IT_WORKS.title}
            lede={
              <>
                Six steps, from a blank profile to a network that compounds. Every
                one of them is designed to take{' '}
                <Tooltip
                  title="Minimum viable identity"
                  content="DigiCon deliberately asks only for what people actually need to know — no bio, no résumé. A card that takes two minutes gets finished; one that takes twenty does not."
                >
                  less than two minutes
                </Tooltip>
                .
              </>
            }
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS.steps.map((step, i) => (
              <StepCard
                key={step.step}
                step={step.step}
                title={step.title}
                icon={[UserCircle, Share2, Handshake, NotebookPen, Bell, Workflow][i] ?? Sparkles}
                accent={(['violet', 'info', 'primary', 'gold', 'eco', 'secondary'] as const)[i] ?? 'info'}
                delay={i * 70}
              >
                {step.desc}
              </StepCard>
            ))}
          </div>
        </Section>

        <Pricing />

        {/* ----------------------------------------------------------- faq */}
        <Section id="faq" size="md" width="narrow" bordered aria-labelledby="faq-title">
          <SectionHeading
            id="faq-title"
            kicker="Questions"
            title="Answered plainly"
            lede="The things people actually ask before they create their first DigiCon."
          />

          <CollapsibleGroup className="mt-10">
            {FAQ.map((item, i) => (
              <Collapsible key={item.q} label={item.q} defaultOpen={i === 0}>
                {item.a}
              </Collapsible>
            ))}
          </CollapsibleGroup>
        </Section>

        {/* ------------------------------------------------------ language */}
        <Section id="language" size="sm" width="narrow" aria-labelledby="language-title">
          <SectionHeading
            id="language-title"
            kicker="The DigiCon Vocabulary"
            title="We changed the words, because the words change the behaviour"
            lede="Generic SaaS labels describe a database. These describe a relationship."
          />
        </Section>

        <VocabularyMarquee items={VOCABULARY} />

        {/* ----------------------------------------------------- final cta */}
        <Section id="final-cta" size="lg" aria-labelledby="final-cta-title">
          <SectionBanner name={FINAL_CTA.banner}>
            <div className="p-8 text-center sm:p-12 lg:p-20">
              <Reveal>
                <h2 id="final-cta-title" className="text-display-md font-bold text-white text-balance">
                  {FINAL_CTA.title}
                  <br />
                  <Hl>{FINAL_CTA.titleAccent}</Hl>
                </h2>
              </Reveal>

              <Reveal delay={60} className="mx-auto mt-7 max-w-prose space-y-3 text-white/65">
                {FINAL_CTA.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </Reveal>

              <Reveal delay={120}>
                <ul className="mx-auto mt-7 flex max-w-xl flex-wrap justify-center gap-2.5">
                  {FINAL_CTA.becomes.map((item) => (
                    <li key={item}>
                      <TermPill accent="primary">{item}</TermPill>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={180}>
                <p className="mt-9 text-lg font-semibold text-white">{FINAL_CTA.kicker}</p>
                <GlassButton
                  size="lg"
                  className="mt-6"
                  onClick={() => navigate(startHref)}
                >
                  {FINAL_CTA.cta}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </GlassButton>
              </Reveal>

              <Reveal delay={240} className="mt-12 border-t border-white/10 pt-8">
                {FINAL_CTA.signoff.map((line, i) => (
                  <p key={line} className={i === 0 ? 'text-white/50' : 'font-semibold text-white'}>
                    {line}
                  </p>
                ))}
                <p className="mt-6 text-sm italic text-digicon-info/80">{BRAND.philosophyLine}</p>
              </Reveal>
            </div>
          </SectionBanner>
        </Section>
      </main>

      <SiteFooter />
      <MobileAppNav />
    </div>
  );
}

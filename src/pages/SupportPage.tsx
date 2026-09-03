import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Check, ChevronRight, Clock, Copy, Handshake, Headphones,
  LifeBuoy, Mail, MessageSquare, Search, Send, Share2, ShieldCheck, Sparkles, UserCircle,
  Users, Wallet, X,
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { GlassButton } from '@/components/ui/GlassCard';
import { Section, SectionHeading, Hl, Pullquote } from '@/components/ui/Section';
import { SectionBanner } from '@/components/ui/SectionBanner';
import { Reveal } from '@/components/ui/Reveal';
import { Collapsible, CollapsibleGroup } from '@/components/ui/Collapsible';
import { ACCENT, IconChip, StatTile, TermPill } from '@/components/ui/Tiles';
import { LandingNav } from '@/components/layout/LandingNav';
import { MobileAppNav } from '@/components/layout/MobileAppNav';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { scrollToSection } from '@/lib/motion';
import { useHashLanding } from '@/lib/navigation';
import {
  BILLING, CONTACT, HELP_GROUPS, RESPONSE_TIMES, STILL_STUCK, SUPPORT_CHANNELS,
  SUPPORT_HERO, TROUBLESHOOTING, type HelpGroup, type SupportChannel,
} from '@/content/support';

/* Icons are paired to content here rather than in the content module, so copy
   stays free of presentation concerns — same contract as the landing page. */
const CHANNEL_ICONS: Record<SupportChannel['icon'], typeof Mail> = {
  search: Search,
  mail: Mail,
  chat: MessageSquare,
  community: Users,
  status: Wallet,
  phone: Headphones,
};

const GROUP_ICONS: Record<HelpGroup['icon'], typeof UserCircle> = {
  identity: UserCircle,
  share: Share2,
  connect: Handshake,
  network: Users,
  account: ShieldCheck,
};

/* ------------------------------------------------------------------ hero */

function SupportHero() {
  return (
    <section id="top" className="relative overflow-hidden pb-12 pt-28 sm:pb-16 sm:pt-32">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionBanner name={SUPPORT_HERO.banner} scrim="side" priority>
          <div className="p-6 sm:p-10 lg:p-16">
            <div className="max-w-2xl">
              <Reveal>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full glass-thin px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-digicon-info">
                  <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
                  {SUPPORT_HERO.eyebrow}
                </p>
              </Reveal>

              <Reveal delay={60}>
                <h1 className="text-display-md font-bold text-white text-balance">
                  {SUPPORT_HERO.titleLead}
                  <br />
                  <Hl>{SUPPORT_HERO.titleAccent}</Hl>
                </h1>
              </Reveal>

              {/* The staccato opening the landing page established */}
              <Reveal delay={120}>
                <div className="mt-7 space-y-1 border-l-2 border-digicon-info/40 pl-4 text-white/55">
                  {SUPPORT_HERO.verses.map((line) => (
                    <p key={line} className="text-sm sm:text-base">{line}</p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={180}>
                <p className="mt-6 max-w-prose text-lede text-white/70">{SUPPORT_HERO.body}</p>
              </Reveal>

              <Reveal delay={220}>
                <div className="mt-6 space-y-0.5">
                  {SUPPORT_HERO.closer.map((line, i) => (
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
                    onClick={() => scrollToSection('help-topics')}
                  >
                    {SUPPORT_HERO.ctaPrimary}
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => scrollToSection('contact')}
                  >
                    {SUPPORT_HERO.ctaSecondary}
                  </GlassButton>
                </div>
                <p className="mt-4 text-xs text-white/40">{SUPPORT_HERO.reassurance}</p>
              </Reveal>
            </div>

            <Reveal delay={320}>
              <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {SUPPORT_HERO.stats.map((stat) => (
                  <StatTile key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </div>
            </Reveal>
          </div>
        </SectionBanner>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- channels */

function Channels() {
  return (
    <Section id="channels" size="md" bordered aria-labelledby="channels-title">
      <SectionHeading
        id="channels-title"
        kicker="Ways to reach us"
        title={
          <>
            Start where the answer is <Hl>fastest</Hl>
          </>
        }
        lede="Ordered by how quickly each one actually resolves something — not by how much we would like you to use it."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {SUPPORT_CHANNELS.map((channel, i) => {
          const Icon = CHANNEL_ICONS[channel.icon];
          const a = ACCENT[channel.accent];
          const inner = (
            <>
              <IconChip icon={Icon} accent={channel.accent} />
              <h3 className="mt-5 text-lg font-semibold text-white">{channel.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{channel.desc}</p>
              <p className="mt-4 text-xs text-white/40">{channel.detail}</p>
              <span
                className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${a.text}`}
              >
                {channel.action}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </>
          );

          const cls =
            'metal metal-sheen block h-full w-full p-6 text-left transition-transform duration-500 hover:-translate-y-1';

          return (
            <Reveal key={channel.id} delay={i * 70} className="h-full">
              {channel.href ? (
                <a href={channel.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => channel.section && scrollToSection(channel.section)}
                  className={cls}
                >
                  {inner}
                </button>
              )}
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- search */

/**
 * The search index covers every answer on the page — help topics, the
 * troubleshooting entries and the billing questions alike.
 *
 * Indexing only the help groups was the obvious first cut and the wrong one:
 * the two words a customer is most likely to type, "wallet" and "billing",
 * appear only in the sections that were left out, so the search confidently
 * reported no answers for the questions the page answers best.
 */
type Indexed = { key: string; text: string };

/* Each entry also carries its section's own heading. Without it a term that
   names a whole section matched nothing inside it — "billing" appears in the
   billing heading but in none of the five billing answers, so the section a
   customer was looking straight at reported no results. */
const HELP_ENTRIES: Indexed[] = HELP_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    key: item.q,
    text: `${group.kicker} ${group.title} ${group.lede} ${item.q} ${item.a}`,
  })),
);
const TROUBLE_ENTRIES: Indexed[] = TROUBLESHOOTING.items.map((item) => ({
  key: item.symptom,
  text: `${TROUBLESHOOTING.kicker} ${TROUBLESHOOTING.title} ${item.symptom} ${item.cause} ${item.fix}`,
}));
const BILLING_ENTRIES: Indexed[] = BILLING.items.map((item) => ({
  key: item.q,
  text: `${BILLING.kicker} ${BILLING.title} ${BILLING.lede} ${item.q} ${item.a}`,
}));

const TOTAL_ANSWERS =
  HELP_ENTRIES.length + TROUBLE_ENTRIES.length + BILLING_ENTRIES.length;

/** `null` means "not searching" — distinct from "searching, nothing matched". */
export type SearchMatches = Set<string> | null;

function matchSet(entries: Indexed[], terms: string[]): Set<string> {
  return new Set(
    entries
      .filter((entry) => {
        const haystack = entry.text.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .map((entry) => entry.key),
  );
}

function useSupportSearch() {
  const [query, setQuery] = useState('');
  const trimmed = query.trim().toLowerCase();

  const result = useMemo(() => {
    if (!trimmed) {
      return {
        help: null,
        trouble: null,
        billing: null,
        total: TOTAL_ANSWERS,
        elsewhere: [] as string[],
      };
    }
    const terms = trimmed.split(/\s+/);
    const help = matchSet(HELP_ENTRIES, terms);
    const trouble = matchSet(TROUBLE_ENTRIES, terms);
    const billing = matchSet(BILLING_ENTRIES, terms);
    return {
      help: help as SearchMatches,
      trouble: trouble as SearchMatches,
      billing: billing as SearchMatches,
      total: help.size + trouble.size + billing.size,
      elsewhere: [
        trouble.size > 0 ? 'Troubleshooting' : null,
        billing.size > 0 ? 'Billing' : null,
      ].filter(Boolean) as string[],
    };
  }, [trimmed]);

  return { query, setQuery, searching: Boolean(trimmed), ...result };
}

/* ----------------------------------------------------------- help topics */

function HelpTopics({
  query,
  setQuery,
  searching,
  matches,
  total,
  elsewhere,
}: {
  query: string;
  setQuery: (value: string) => void;
  searching: boolean;
  matches: SearchMatches;
  total: number;
  /** Names of the other sections holding matches, for signposting. */
  elsewhere: string[];
}) {
  const visibleGroups = HELP_GROUPS.map((group) => ({
    group,
    items: matches ? group.items.filter((item) => matches.has(item.q)) : group.items,
  })).filter((entry) => entry.items.length > 0);

  return (
    <Section id="help-topics" size="md" bordered aria-labelledby="help-title">
      <SectionHeading
        id="help-title"
        kicker="Help topics"
        title="Answered plainly"
        lede="Grouped the way the product is: create, share, capture, account. Search if you already know what went wrong."
      />

      <Reveal delay={60} className="mx-auto mt-10 max-w-2xl">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search — upload, QR, wallet, billing…"
            aria-label="Search help topics"
            aria-describedby="help-search-status"
            className="glass-input w-full !rounded-full !py-3.5 !pl-11 !pr-11"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Announced, so the result count reaches a screen reader too */}
        <p
          id="help-search-status"
          role="status"
          aria-live="polite"
          className="mt-3 text-center text-xs text-white/40"
        >
          {searching
            ? `${total} ${total === 1 ? 'answer' : 'answers'} match “${query.trim()}” ` +
              'across help topics, troubleshooting and billing'
            : `${TOTAL_ANSWERS} answers across help topics, troubleshooting and billing`}
        </p>
      </Reveal>

      {searching && total > 0 && visibleGroups.length === 0 ? (
        /* The count says there are matches but none of them are here. Without
           this the section headline sits above empty space and the customer
           has no reason to keep scrolling. */
        <Reveal delay={80} className="mx-auto mt-8 max-w-2xl">
          <div className="glass-thin flex items-start gap-3 rounded-glass-lg p-5">
            <ChevronRight
              className="mt-0.5 h-4 w-4 flex-shrink-0 rotate-90 text-digicon-info"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-white/70">
              No help topic matches “{query.trim()}”. The{' '}
              {total === 1 ? 'match is' : `${total} matches are`} further down,
              under {elsewhere.join(' and ')}.
            </p>
          </div>
        </Reveal>
      ) : searching && total === 0 ? (
        <Reveal delay={80} className="mx-auto mt-8 max-w-2xl">
          <div className="metal p-8 text-center">
            <IconChip icon={MessageSquare} accent="gold" className="mx-auto" />
            <p className="mt-5 text-lg font-semibold text-white">
              Nothing here matches that.
            </p>
            <p className="mx-auto mt-2 max-w-prose text-sm text-white/60">
              Which is worth knowing — it means this page has a gap. Tell us what
              you were looking for and we will answer you and fix the page.
            </p>
            <GlassButton className="mt-6" onClick={() => scrollToSection('contact')}>
              Message support
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </GlassButton>
          </div>
        </Reveal>
      ) : (
        <div className="mt-10 space-y-8">
          {visibleGroups.map(({ group, items }, gi) => {
            return (
              <div key={group.id}>
                <Reveal delay={gi * 60}>
                  <div className="mb-4 flex items-center gap-3">
                    <IconChip icon={GROUP_ICONS[group.icon]} accent={group.accent} size="sm" />
                    <div className="min-w-0">
                      <p
                        className={`text-[0.68rem] font-bold uppercase tracking-[0.16em] ${ACCENT[group.accent].text}`}
                      >
                        {group.kicker}
                      </p>
                      <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-white/50">{group.lede}</p>
                </Reveal>

                <CollapsibleGroup>
                  {items.map((item, i) => (
                    <Collapsible
                      key={item.q}
                      label={item.q}
                      /* Auto-open while searching: hiding the answer behind a
                         second click defeats the point of having searched. */
                      defaultOpen={Boolean(matches) || (gi === 0 && i === 0)}
                    >
                      {item.a}
                    </Collapsible>
                  ))}
                </CollapsibleGroup>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------- troubleshooting */

function Troubleshooting({ matches }: { matches: SearchMatches }) {
  const items = matches
    ? TROUBLESHOOTING.items.filter((item) => matches.has(item.symptom))
    : TROUBLESHOOTING.items;

  // While searching, a section with nothing to show is noise rather than
  // reassurance — the running count above already says what was found.
  if (items.length === 0) return null;

  return (
    <Section id="troubleshooting" size="md" aria-labelledby="trouble-title">
      <SectionBanner name={TROUBLESHOOTING.banner}>
        <div className="p-6 sm:p-10 lg:p-16">
          <SectionHeading
            id="trouble-title"
            kicker={TROUBLESHOOTING.kicker}
            title={TROUBLESHOOTING.title}
            lede={TROUBLESHOOTING.lede}
          />

          <ul className="mt-10 space-y-3">
            {items.map((item, i) => (
              <Reveal key={item.symptom} delay={i * 60} from="left">
                <li className="metal p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        item.ours ? 'text-digicon-warning' : 'text-digicon-info'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-white">{item.symptom}</h3>

                      <dl className="mt-3 space-y-2.5 text-sm">
                        <div className="sm:flex sm:gap-3">
                          <dt className="w-24 flex-shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                            Cause
                          </dt>
                          <dd className="text-white/65">{item.cause}</dd>
                        </div>
                        <div className="sm:flex sm:gap-3">
                          <dt className="w-24 flex-shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                            What to do
                          </dt>
                          <dd className="text-white/80">{item.fix}</dd>
                        </div>
                      </dl>

                      {item.ours && (
                        <p className="mt-3">
                          <TermPill accent="gold">Ours to fix</TermPill>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={360} className="mt-10">
            <Pullquote>
              A fault we caused is not a support burden we get to pass to you.
              Reporting one should cost you a sentence, not an afternoon.
            </Pullquote>
          </Reveal>
        </div>
      </SectionBanner>
    </Section>
  );
}

/* --------------------------------------------------------------- billing */

function Billing({ matches }: { matches: SearchMatches }) {
  const items = matches
    ? BILLING.items.filter((item) => matches.has(item.q))
    : BILLING.items;

  if (items.length === 0) return null;

  return (
    <Section id="billing" size="md" width="narrow" bordered aria-labelledby="billing-title">
      <SectionHeading
        id="billing-title"
        kicker={BILLING.kicker}
        title={BILLING.title}
        lede={BILLING.lede}
      />

      <CollapsibleGroup className="mt-10">
        {items.map((item, i) => (
          <Collapsible
            key={item.q}
            label={item.q}
            defaultOpen={Boolean(matches) || i === 0}
          >
            {item.a}
          </Collapsible>
        ))}
      </CollapsibleGroup>
    </Section>
  );
}

/* -------------------------------------------------------- response times */

function ResponseTimes() {
  return (
    <Section id="response-times" size="md" bordered aria-labelledby="response-title">
      <SectionHeading
        id="response-title"
        kicker={RESPONSE_TIMES.kicker}
        title={RESPONSE_TIMES.title}
        lede={RESPONSE_TIMES.lede}
      />

      {/* Scrolls inside its own container rather than pushing the page wide */}
      <Reveal delay={60} className="mt-10">
        <div className="metal metal-sheen overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">
              First-reply times and available channels by DigiCon plan
            </caption>
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  Plan
                </th>
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  First reply
                </th>
                <th scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  Channels
                </th>
              </tr>
            </thead>
            <tbody>
              {RESPONSE_TIMES.rows.map((row) => (
                <tr key={row.plan} className="border-b border-white/[0.06] last:border-b-0">
                  <th scope="row" className="px-5 py-4 font-semibold text-white">
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`h-2 w-2 flex-shrink-0 rounded-full bg-current ${ACCENT[row.accent].text}`}
                        aria-hidden="true"
                      />
                      {row.plan}
                      <span className="text-xs font-normal text-white/35">{row.price}</span>
                    </span>
                  </th>
                  <td className="px-5 py-4 text-white/75">{row.first}</td>
                  <td className="px-5 py-4 text-white/55">{row.channels}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={140} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="glass-thin flex items-start gap-3 rounded-glass-lg p-5">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-digicon-gold" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-white/65">{RESPONSE_TIMES.note}</p>
        </div>
        <div className="glass-thin flex items-start gap-3 rounded-glass-lg p-5">
          <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-digicon-info" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-white/65">{RESPONSE_TIMES.hours}</p>
        </div>
      </Reveal>
    </Section>
  );
}

/* --------------------------------------------------------------- contact */

/**
 * The contact form composes a message and hands it to the customer's own email
 * client. Deliberately not a backend submission: a support form that posts to a
 * server the customer cannot see gives them no copy of what they sent and no
 * thread to reply into. This way the message lands in their sent items, the
 * reply comes back to an inbox they already watch, and nothing they type is
 * transmitted or stored until they press send themselves.
 */
function ContactForm() {
  const { session, plan } = useAuth();
  // Widened deliberately: `CONTACT.topics` is a readonly tuple of literals, so
  // an inferred state type would be the first topic and nothing else.
  const [topic, setTopic] = useState<string>(CONTACT.topics[0]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  // Prefill from the session when there is one, without locking the field —
  // people do write in about an account other than the one they are signed into.
  useEffect(() => {
    const sessionEmail = session?.user?.email;
    if (sessionEmail) setEmail((current) => current || sessionEmail);
  }, [session]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  /* Diagnostics we would otherwise have to ask for in the first reply. */
  const diagnostics = useMemo(
    () =>
      [
        `Plan: ${plan ?? 'unknown'}`,
        `Signed in: ${session ? 'yes' : 'no'}`,
        typeof window !== 'undefined' ? `Page: ${window.location.origin}` : null,
        typeof navigator !== 'undefined' ? `Browser: ${navigator.userAgent}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    [plan, session],
  );

  const body = useMemo(
    () =>
      [
        message.trim() || '(describe what happened here)',
        '',
        '—',
        `Topic: ${topic}`,
        email.trim() ? `Reply to: ${email.trim()}` : null,
        diagnostics,
      ]
        .filter((line) => line !== null)
        .join('\n'),
    [message, topic, email, diagnostics],
  );

  const mailto = `mailto:${CONTACT.emailTo}?subject=${encodeURIComponent(
    `DigiCon support — ${topic}`,
  )}&body=${encodeURIComponent(body)}`;

  const copy = async () => {
    const text = `To: ${CONTACT.emailTo}\nSubject: DigiCon support — ${topic}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access is refused in some embedded browsers; the textarea
      // still holds everything the customer needs to select by hand.
      return;
    }
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 4000);
  };

  const field =
    'glass-input w-full !py-3 placeholder:text-white/30';

  return (
    <Section id="contact" size="md" width="narrow" bordered aria-labelledby="contact-title">
      <SectionHeading
        id="contact-title"
        kicker={CONTACT.kicker}
        title={CONTACT.title}
        lede={CONTACT.lede}
      />

      <Reveal delay={60} className="mt-10">
        <form
          className="metal metal-sheen space-y-5 p-6 sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            window.location.href = mailto;
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="support-topic" className="mb-2 block text-sm font-medium text-white/80">
                What is this about?
              </label>
              <select
                id="support-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className={field}
              >
                {CONTACT.topics.map((option) => (
                  <option key={option} value={option} className="bg-[#0b1020] text-white">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="support-email" className="mb-2 block text-sm font-medium text-white/80">
                Where should we reply?{' '}
                <span className="font-normal text-white/35">Optional</span>
              </label>
              <input
                id="support-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor="support-message" className="mb-2 block text-sm font-medium text-white/80">
              What happened?
            </label>
            <textarea
              id="support-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              placeholder="What you were doing, what you expected, and what you saw instead. Rough is fine."
              className={`${field} resize-y`}
            />
            <p className="mt-2 text-xs text-white/40">
              Your plan, sign-in state and browser are attached automatically, so
              we do not have to ask for them in the first reply.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
            <GlassButton type="submit" size="lg" className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              {CONTACT.submitLabel}
            </GlassButton>

            <GlassButton
              type="button"
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
              onClick={copy}
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-digicon-eco" aria-hidden="true" />
              ) : (
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {copied ? 'Copied' : CONTACT.copyLabel}
            </GlassButton>
          </div>

          <p role="status" aria-live="polite" className="text-xs text-white/45">
            {copied ? CONTACT.copiedLabel : CONTACT.privacyNote}
          </p>
        </form>
      </Reveal>
    </Section>
  );
}

/* ----------------------------------------------------------- still stuck */

function StillStuck() {
  const navigate = useNavigate();

  return (
    <Section id="still-stuck" size="lg" aria-labelledby="stuck-title">
      <SectionBanner name={STILL_STUCK.banner}>
        <div className="p-8 text-center sm:p-12 lg:p-20">
          <Reveal>
            <h2 id="stuck-title" className="text-display-md font-bold text-white text-balance">
              {STILL_STUCK.title}
              <br />
              <Hl>{STILL_STUCK.titleAccent}</Hl>
            </h2>
          </Reveal>

          <Reveal delay={60} className="mx-auto mt-7 max-w-prose space-y-3 text-white/65">
            {STILL_STUCK.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 text-lg font-semibold text-white">{STILL_STUCK.reassurance}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <GlassButton size="lg" onClick={() => scrollToSection('contact')}>
                {STILL_STUCK.cta}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </GlassButton>
              <GlassButton variant="ghost" size="lg" onClick={() => navigate('/')}>
                Back to DigiCon
              </GlassButton>
            </div>
          </Reveal>

          <Reveal delay={220} className="mt-12 border-t border-white/10 pt-8">
            {STILL_STUCK.signoff.map((line, i) => (
              <p key={line} className={i === 0 ? 'text-white/50' : 'font-semibold text-white'}>
                {line}
              </p>
            ))}
          </Reveal>
        </div>
      </SectionBanner>
    </Section>
  );
}

/* ------------------------------------------------------------------ page */

export function SupportPage() {
  useHashLanding();

  /* One search across the whole page, owned here so the sections it filters
     stay presentational. */
  const search = useSupportSearch();

  // Scroll reset is handled once, for every route, by `ScrollToTop` in App.
  // What is left here is the hash destination — /support#billing — and the
  // document title.
  useEffect(() => {
    document.title = 'Support · DigiCon';
    return () => {
      document.title = 'DigiCon';
    };
  }, []);

  return (
    /* Art-directed dark: the banners are dark photography in both themes,
       so the copy set over them stays white rather than following the
       theme. See the forced-dark block in index.css. */
    <div className="relative min-h-screen has-appnav" data-force-theme="dark">
      <LandingNav />

      <main id="main">
        <SupportHero />
        <Channels />
        <HelpTopics
          query={search.query}
          setQuery={search.setQuery}
          searching={search.searching}
          matches={search.help}
          total={search.total}
          elsewhere={search.elsewhere}
        />
        <Troubleshooting matches={search.trouble} />
        <Billing matches={search.billing} />
        <ResponseTimes />
        <ContactForm />
        <StillStuck />
      </main>

      <SiteFooter />
      <MobileAppNav />
    </div>
  );
}

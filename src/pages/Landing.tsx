import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  CalendarClock,
  CreditCard,
  QrCode,
  Send,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/Layouts";
import BrandImage from "@/components/brand/BrandImage";
import { Avatar, StatusBadge } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { FlowStrip } from "@/components/ui/FlowStrip";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Section,
  SectionHeading,
  Pullquote,
} from "@/components/ui/Section";
import { Tooltip } from "@/components/ui/Tooltip";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";

const GOLD_BUTTON =
  "min-h-[48px] border border-[#f8e49b]/80 bg-gradient-to-b from-[#fff1a4] via-[#d4af37] to-[#9c6b10] text-[#061a3a] shadow-[0_10px_28px_rgba(212,175,55,0.28)] hover:from-[#fff9c9] hover:via-[#e7c75b] hover:to-[#b57a12] hover:text-[#04142e]";

const GLASS_SURFACE =
  "border border-[#d4af37]/25 bg-gradient-to-br from-white/[0.10] via-[#123567]/35 to-[#061a3a]/80 backdrop-blur-xl";

const HERO_CARD_IMAGE_SRC =
  "https://raw.githubusercontent.com/secretariatlivable/digicon/main/public/digicon_dcard.png";

type ActivityKind = "upgrade" | "checkout" | "engagement" | "sharing";

type LiveActivityItem = {
  name: string;
  location: string;
  action: string;
  kind: ActivityKind;
};

const LIVE_ACTIVITY: LiveActivityItem[] = [
  {
    name: "Priya Sharma",
    location: "Mumbai, India",
    action: "upgraded to DigiCon Pro",
    kind: "upgrade",
  },
  {
    name: "Kenji Tanaka",
    location: "Tokyo, Japan",
    action: "shared his card via QR at SmartCity Expo",
    kind: "sharing",
  },
  {
    name: "Mei Ling Wong",
    location: "Singapore",
    action: "is checking out the Growth plan",
    kind: "checkout",
  },
  {
    name: "Budi Santoso",
    location: "Jakarta, Indonesia",
    action: "captured 4 new connections today",
    kind: "engagement",
  },
  {
    name: "Soo-jin Park",
    location: "Seoul, South Korea",
    action: "upgraded her team to Business",
    kind: "upgrade",
  },
  {
    name: "Anong Chaiya",
    location: "Bangkok, Thailand",
    action: "added her card to Google Wallet",
    kind: "engagement",
  },
  {
    name: "Liam Nguyen",
    location: "Ho Chi Minh City, Vietnam",
    action: "scheduled a follow-up with a new partner",
    kind: "engagement",
  },
  {
    name: "Grace Liu",
    location: "Taipei, Taiwan",
    action: "is exploring the Pro checkout",
    kind: "checkout",
  },
  {
    name: "Fatima Hassan",
    location: "Kuala Lumpur, Malaysia",
    action: "upgraded to DigiCon Pro",
    kind: "upgrade",
  },
  {
    name: "Jack Thompson",
    location: "Sydney, Australia",
    action: "reviewed his network health score",
    kind: "engagement",
  },
  {
    name: "Arjun Mehta",
    location: "Bengaluru, India",
    action: "is checking out team workspaces",
    kind: "checkout",
  },
  {
    name: "Chloe Tan",
    location: "Manila, Philippines",
    action: "sent her card via NFC tap",
    kind: "sharing",
  },
  {
    name: "Olivia Martin",
    location: "Auckland, New Zealand",
    action: "viewed her weekly relationship digest",
    kind: "engagement",
  },
  {
    name: "Rafiq Islam",
    location: "Dhaka, Bangladesh",
    action: "shared his card via link",
    kind: "sharing",
  },
];

const ACTIVITY_META: Record<
  ActivityKind,
  { icon: typeof Sparkles; label: string; badge: string }
> = {
  upgrade: {
    icon: Sparkles,
    label: "Upgrade",
    badge: "border-[#d4af37]/40 bg-[#d4af37]/15 text-[#f5dd8d]",
  },
  checkout: {
    icon: CreditCard,
    label: "Checkout",
    badge: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  },
  engagement: {
    icon: Users,
    label: "Active",
    badge: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  sharing: {
    icon: Share2,
    label: "Sharing",
    badge: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  },
};

const FEED_TIMES = ["just now", "2m ago", "6m ago", "12m ago"];

const JOURNEY = [
  {
    icon: QrCode,
    title: "Identity",
    href: "#create-share",
    body: "One card, portrait or landscape, live at its own URL and QR.",
  },
  {
    icon: Share2,
    title: "Share",
    href: "#create-share",
    body: "QR, link, SMS, email, chat, NFC or wallet — in seconds.",
  },
  {
    icon: Users,
    title: "Connect",
    href: "#connect",
    body: "An introduction becomes a captured, two-way connection.",
  },
  {
    icon: Bell,
    title: "Remember",
    href: "#remember",
    body: "Where you met, what you discussed, and what they need.",
  },
  {
    icon: CalendarClock,
    title: "Follow Up",
    href: "#follow-up",
    body: "One clear next action with a due date, never a vague reminder.",
  },
  {
    icon: BarChart3,
    title: "Grow",
    href: "#grow",
    body: "See health, sources, opportunities, and follow-through.",
  },
];

const SHARE_CHANNELS = [
  "QR code",
  "Link",
  "NFC tap",
  "Email",
  "Chat",
  "Digital wallet",
];

const REMEMBER_FIELDS = [
  {
    label: "Met at",
    value: "Global Tech Conference 2026, San Francisco",
  },
  {
    label: "Discussed",
    value: "AI-powered solutions for business growth",
  },
  {
    label: "They need",
    value: "Scalable marketing automation",
  },
  {
    label: "Shared purpose",
    value: "Partnership opportunities",
  },
  {
    label: "Status",
    value: "Follow Up",
  },
];

const GROW_METRICS = [
  { value: "128", label: "Connections" },
  { value: "36", label: "Follow-ups" },
  { value: "12", label: "Meetings" },
  { value: "8", label: "Opportunities" },
];

const PILLARS = [
  {
    icon: Bell,
    title: "Remember",
    body: "Never forget a connection — the context of the conversation stays with the person.",
  },
  {
    icon: Brain,
    title: "Understand",
    body: "Capture what matters: their interest, shared purpose, and the value in play.",
  },
  {
    icon: Send,
    title: "Follow Up",
    body: "Take the right next action before the moment goes cold.",
  },
  {
    icon: Sparkles,
    title: "Grow",
    body: "Build a network that compounds instead of a contact list that decays.",
  },
];

function GoldLinkButton({
  to,
  children,
  testId,
}: {
  to: string;
  children: ReactNode;
  testId: string;
}) {
  return (
    <Button
      render={<Link to={to} />}
      size="lg"
      className={GOLD_BUTTON}
      data-testid={testId}
    >
      {children}
    </Button>
  );
}

function LiveActivityFeed() {
  const [head, setHead] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHead((current) => (current + 1) % LIVE_ACTIVITY.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const visible = Array.from({ length: 4 }, (_, offset) => ({
    item: LIVE_ACTIVITY[(head + offset) % LIVE_ACTIVITY.length],
    time: FEED_TIMES[offset],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="mt-5"
      data-testid="landing-live-activity"
      aria-label="Live DigiCon activity across Asia Pacific"
    >
      <div className="mb-2.5 flex items-center justify-between px-1">
        <p className="label-caps text-[#f5dd8d]">Live across Asia Pacific</p>
        <span className="dense flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Updating live
        </span>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {visible.map(({ item, time }) => {
            const meta = ACTIVITY_META[item.kind];
            const Icon = meta.icon;

            return (
              <motion.div
                key={item.name}
                layout
                initial={{ opacity: 0, y: -18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <GlassCard
                  variant="chrome"
                  className="flex items-center gap-3 p-3"
                >
                  <Avatar name={item.name} size="sm" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="dense truncate text-xs text-muted-foreground">
                      {item.location} · {item.action}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        meta.badge
                      )}
                    >
                      <Icon className="h-3 w-3" aria-hidden />
                      {meta.label}
                    </span>
                    <span className="dense text-[10px] text-muted-foreground">
                      {time}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StorySection({
  id,
  eyebrow,
  title,
  lead,
  image,
  alt,
  reverse = false,
  children,
  testId,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  image: "connect" | "share" | "remember" | "grow" | "male";
  alt: string;
  reverse?: boolean;
  children?: ReactNode;
  testId: string;
}) {
  const copy = (
    <div className="min-w-0">
      <SectionHeading
        id={`${id}-title`}
        kicker={eyebrow}
        title={title}
        lede={lead}
        align="left"
      />
      {children}
    </div>
  );

  const media = (
    <GlassCard
      variant="chrome"
      className="overflow-hidden p-1"
      aria-label={alt}
    >
      <BrandImage
        name={image}
        alt={alt}
        testId={`${testId}-image`}
      />
    </GlassCard>
  );

  return (
    <Section
      id={id}
      size="md"
      bordered
      aria-labelledby={`${id}-title`}
      data-testid={testId}
    >
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className={cn("order-1", reverse && "lg:order-2")}>{copy}</div>
        <div className={cn("order-2", reverse && "lg:order-1")}>{media}</div>
      </div>
    </Section>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const startHref = user ? "/dashboard" : "/signup";

  return (
    <PublicLayout>
      <section
        className="relative -mt-px overflow-hidden border-b border-[#d4af37]/30"
        aria-label="DigiCon professional networking"
      >
        <BrandImage
          name="connect"
          priority
          testId="landing-banner-hero"
          alt="Professionals exchanging DigiCon cards and building relationships"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061a3a] via-[#061a3a]/75 to-transparent px-4 pb-6 pt-24 sm:px-8 sm:pb-10">
          <div className="mx-auto max-w-6xl">
            <Tooltip
              title="Relationship memory"
              content="DigiCon keeps the context, next action, and follow-up behind every introduction."
            >
              <span className="font-heading text-base font-bold text-[#f5dd8d] sm:text-2xl">
                An introduction is easy. Remembering is what builds the
                relationship.
              </span>
            </Tooltip>
          </div>
        </div>
      </section>

      <Section size="lg" aria-labelledby="hero-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="label-caps text-[#f5dd8d]"
            >
              DigiCon · Digitally Connected
            </motion.p>

            <motion.h1
              id="hero-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-heading mt-2 break-words text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-5xl"
              data-testid="landing-hero-heading"
            >
              More than a digital business card.
              <span className="block text-[#f5dd8d]">
                It&apos;s your relationship workspace.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="dense mt-5 max-w-lg text-base text-muted-foreground sm:text-lg"
            >
              Your professional identity. Your connections. Your network.
              Create your identity, share it instantly, capture the people you
              meet, and turn everyday networking into relationships you can
              actually manage.
            </motion.p>

            <p className="font-heading mt-4 text-sm font-semibold tracking-wide text-[#f5dd8d]">
              Create. Share. Connect. Remember. Follow Up. Grow.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <GoldLinkButton
                to={startHref}
                testId="landing-primary-cta"
              >
                Create Your DigiCon
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </GoldLinkButton>

              <Button
                render={<a href="#how-it-works" />}
                size="lg"
                className={GOLD_BUTTON}
                data-testid="landing-secondary-cta"
              >
                See How It Works
              </Button>
            </div>

            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4">
              {[
                { key: "Never lost", value: "Connections" },
                { key: "One action", value: "Per relationship" },
                { key: "Measurable", value: "Networking" },
              ].map((stat) => (
                <GlassCard
                  key={stat.key}
                  variant="thin"
                  className="p-3"
                >
                  <dt className="font-heading text-sm font-bold text-[#f5dd8d] sm:text-base">
                    {stat.key}
                  </dt>
                  <dd className="dense text-xs text-muted-foreground">
                    {stat.value}
                  </dd>
                </GlassCard>
              ))}
            </dl>
          </div>

          <div className="relative min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-xs"
            >
              <img
                src={HERO_CARD_IMAGE_SRC}
                alt="DigiCon digital business card preview"
                data-testid="landing-hero-card"
                className="h-auto w-full rounded-2xl border border-[#d4af37]/30 shadow-[0_18px_50px_rgba(3,12,32,0.45)]"
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.dataset.fallback) return;
                  img.dataset.fallback = "true";
                  img.src = "/digicon_dcard.png";
                }}
              />
            </motion.div>

            <LiveActivityFeed />
          </div>
        </div>
      </Section>

      <Section
        id="how-it-works"
        size="md"
        bordered
        aria-labelledby="journey-title"
      >
        <SectionHeading
          id="journey-title"
          kicker="How it works"
          title="Identity → Share → Connect → Remember → Follow Up → Grow"
          lede="DigiCon makes each step of professional networking deliberate, memorable, and measurable."
        />

        <FlowStrip
          className="mt-10"
          steps={JOURNEY.map((step) => ({
            label: step.title,
            icon: step.icon,
            href: step.href,
          }))}
        />

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEY.map((step, index) => {
            const Icon = step.icon;

            return (
              <li key={step.title}>
                <GlassCard
                  variant="chrome"
                  hover
                  className={cn(GLASS_SURFACE, "h-full p-5")}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/15 text-[#f5dd8d]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>

                  <p className="label-caps mt-4 text-[#f5dd8d]">
                    Step {index + 1}
                  </p>

                  <h3 className="font-heading mt-1 text-base font-bold">
                    {step.title}
                  </h3>

                  <p className="dense mt-1.5 text-sm text-muted-foreground">
                    {step.body}
                  </p>
                </GlassCard>
              </li>
            );
          })}
        </ol>
      </Section>

      <StorySection
        id="create-share"
        eyebrow="Create & Share"
        title="Your identity, ready to hand over in one tap"
        lead="Build your DigiCon card once, then share it the way the moment allows — scan the QR at a booth, drop the link in chat, tap phones over NFC, or keep it in your digital wallet."
        image="share"
        alt="DigiCon user sharing a digital business card through QR code, link, NFC, email, chat, and a digital wallet"
        testId="landing-section-share"
      >
        <ul
          className="mt-6 flex flex-wrap gap-2"
          data-testid="landing-share-channels"
        >
          {SHARE_CHANNELS.map((channel) => (
            <li
              key={channel}
              className="rounded-full border border-[#d4af37]/25 bg-white/[0.06] px-3 py-1.5 text-sm text-[#f5dd8d] backdrop-blur-md"
            >
              {channel}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <GoldLinkButton
            to={startHref}
            testId="landing-share-cta"
          >
            Create Your DigiCon
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </GoldLinkButton>
        </div>
      </StorySection>

      <StorySection
        id="connect"
        eyebrow="Connect"
        title="Both sides walk away with something useful"
        lead="When someone opens your card, they can save your contact or send theirs straight back — no signup and no app installation required. Their details land in your workspace with the context of how you met."
        image="male"
        alt="DigiCon professional networking profile with QR code, contact information, social links, and connection options"
        reverse
        testId="landing-section-connect"
      >
        <Pullquote className="mt-6 text-[#f5dd8d]">
          An introduction becomes a connection.
        </Pullquote>
      </StorySection>

      <StorySection
        id="remember"
        eyebrow="Remember"
        title="The conversation stays attached to the person"
        lead="DigiCon keeps the details that matter weeks after the meeting: where you met, when you met, what you discussed, what they need, and where the relationship stands."
        image="remember"
        alt="DigiCon relationship record showing meeting context, discussion notes, shared purpose, and a next action"
        testId="landing-section-remember"
      >
        <dl
          className="mt-6 space-y-2"
          data-testid="landing-remember-fields"
        >
          {REMEMBER_FIELDS.map((field) => (
            <GlassCard
              key={field.label}
              variant="thin"
              className="flex flex-wrap gap-x-3 rounded-lg px-3 py-2"
            >
              <dt className="label-caps min-w-[7rem] text-[#f5dd8d]">
                {field.label}
              </dt>
              <dd className="dense min-w-0 flex-1 text-sm">
                {field.value}
              </dd>
            </GlassCard>
          ))}
        </dl>
      </StorySection>

      <Section
        id="follow-up"
        size="md"
        bordered
        aria-labelledby="followup-title"
      >
        <SectionHeading
          id="followup-title"
          kicker="Follow Up"
          title="One clear next action, with a date"
          lede="Replace vague reminders with an intentional action that moves the relationship forward."
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Send partnership proposal",
              who: "David Lim · NovaTech",
              due: "Due in 2 days",
              status: "Follow Up",
            },
            {
              title: "Share portfolio & case studies",
              who: "Aisha Rahman · PeopleFirst",
              due: "Due tomorrow",
              status: "Pending",
            },
            {
              title: "Send updated metrics deck",
              who: "Jessica Chen · NextWave",
              due: "Due in 3 days",
              status: "Opportunity",
            },
            {
              title: "Plan joint webinar agenda",
              who: "Miguel Reyes · GreenGrid",
              due: "In progress",
              status: "Partner",
            },
          ].map((followUp, index) => (
            <GlassCard
              key={followUp.title}
              variant="chrome"
              hover
              className={cn(GLASS_SURFACE, "p-4")}
              data-testid={`landing-followup-card-${index}`}
            >
              <StatusBadge status={followUp.status} />
              <h3 className="font-heading mt-3 text-sm font-bold">
                {followUp.title}
              </h3>
              <p className="dense mt-1 text-xs text-muted-foreground">
                {followUp.who}
              </p>
              <p className="dense mt-3 text-xs text-[#f5dd8d]">
                {followUp.due}
              </p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <StorySection
        id="grow"
        eyebrow="Grow"
        title="See whether your network is actually growing"
        lead="Connections, follow-ups, meetings, opportunities, and relationship health — the numbers that tell you who to re-engage and where your best introductions come from."
        image="grow"
        alt="DigiCon networking analytics dashboard showing connections, follow-ups, meetings, opportunities, and relationship health"
        reverse
        testId="landing-section-grow"
      >
        <dl
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
          data-testid="landing-grow-metrics"
        >
          {GROW_METRICS.map((metric) => (
            <GlassCard
              key={metric.label}
              variant="thin"
              className="rounded-xl p-3"
            >
              <dt className="label-caps text-[#f5dd8d]">
                {metric.label}
              </dt>
              <dd className="metric mt-1 text-xl text-white">
                {metric.value}
              </dd>
            </GlassCard>
          ))}
        </dl>
      </StorySection>

      <Section
        size="md"
        bordered
        aria-labelledby="difference-title"
      >
        <GlassCard
          variant="chrome"
          className={cn(GLASS_SURFACE, "rounded-2xl p-6 sm:p-9")}
        >
          <SectionHeading
            id="difference-title"
            kicker="The difference"
            title="A connection is not just a contact"
            lede="The digital card is useful at the moment of introduction. DigiCon is useful after it."
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="label-caps text-muted-foreground">
                A digital business card gives you
              </p>
              <ul className="dense mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Name, company, and links</li>
                <li>A tap or a scan</li>
                <li>A contact saved somewhere</li>
                <li>…and then nothing</li>
              </ul>
            </div>

            <div>
              <p className="label-caps text-[#f5dd8d]">
                DigiCon gives you
              </p>
              <ul className="dense mt-3 space-y-2 text-sm">
                <li>Where you met and what you discussed</li>
                <li>What they need and what it is worth</li>
                <li>One clear next action with a due date</li>
                <li>Proof that your network is actually growing</li>
              </ul>
            </div>
          </div>

          <Pullquote className="mt-8 text-[#f5dd8d]">
            The card is the entry point. The relationship is the product.
          </Pullquote>

          <motion.figure
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-8 overflow-hidden rounded-2xl border border-[#d4af37]/30 shadow-[0_20px_60px_rgba(3,12,32,0.45)]"
            data-testid="landing-relationship-banner"
          >
            <img
              src="/digicon-female-professional.png"
              alt="Professional woman using DigiCon to turn introductions into lasting relationships"
              loading="lazy"
              className="h-56 w-full object-cover object-top sm:h-72 lg:h-80"
            />
          </motion.figure>
        </GlassCard>
      </Section>

      <Section size="md" aria-label="DigiCon relationship benefits">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <GlassCard
                key={pillar.title}
                variant="chrome"
                hover
                className={cn(GLASS_SURFACE, "p-5")}
                data-testid={`landing-pillar-${pillar.title.toLowerCase()}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/15 text-[#f5dd8d]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-heading mt-4 text-base font-bold">
                  {pillar.title}
                </h3>
                <p className="dense mt-2 text-sm text-muted-foreground">
                  {pillar.body}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </Section>

      <Section size="lg" aria-labelledby="final-cta-title">
        <GlassCard
          variant="chrome"
          className="border border-[#d4af37]/45 bg-[radial-gradient(circle_at_top,#264c7f_0%,#0b2451_42%,#061a3a_100%)] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-12"
        >
          <h2
            id="final-cta-title"
            className="font-heading text-2xl font-extrabold sm:text-3xl"
          >
            Every conversation can become a meaningful relationship.
          </h2>

          <p className="dense mx-auto mt-4 max-w-lg text-muted-foreground">
            Start free with one card and the full relationship workspace.
            Upgrade when DigiCon becomes infrastructure for your professional
            identity.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <GoldLinkButton
              to={startHref}
              testId="landing-footer-cta"
            >
              Create Your DigiCon
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </GoldLinkButton>

            <GoldLinkButton
              to="/pricing"
              testId="landing-pricing-cta"
            >
              Explore DigiCon
            </GoldLinkButton>
          </div>

          <p className="font-heading mt-7 text-sm font-semibold">
            Your identity. Your connections.{" "}
            <span className="text-[#f5dd8d]">Your future.</span>
          </p>
        </GlassCard>
      </Section>
    </PublicLayout>
  );
}

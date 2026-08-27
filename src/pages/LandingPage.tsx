import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Leaf,
  Link2,
  Menu,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { PayPalSubscriptionButton } from "@/components/PayPalSubscriptionButton";
import {
  DIGICON_PAYPAL_PLANS,
  type DigiConPlanId,
} from "@/config/paypalPlans";

type PricingPlan = {
  id: DigiConPlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
};

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₱199",
    period: "/month",
    description: "Essential digital networking tools for individuals and small businesses.",
    features: [
      "Professional digital business card",
      "QR code and shareable card URL",
      "Contact capture",
      "Basic card analytics",
      "Photo or company logo",
      "Eco-impact tracking",
    ],
    cta: "Choose Starter",
  },
  {
    id: "growth",
    name: "Growth",
    price: "₱499",
    period: "/month",
    description: "Advanced networking and CRM tools for growing teams and businesses.",
    features: [
      "Everything in Starter",
      "Advanced contact management",
      "Lead and conversion analytics",
      "CRM workflow support",
      "Advanced eco analytics",
      "Apple Wallet and Google Wallet support",
      "Priority support",
    ],
    highlighted: true,
    badge: "Most Popular",
    cta: "Choose Growth",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "A scalable networking and relationship-management solution for organizations.",
    features: [
      "Everything in Growth",
      "Team and multi-seat access",
      "Organization-level analytics",
      "Advanced governance controls",
      "Enterprise onboarding",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Choose Enterprise",
  },
];

const FEATURES = [
  {
    icon: WalletCards,
    title: "Digital Business Cards",
    description:
      "Create polished, mobile-first cards that are easy to share through QR codes, links, NFC and messaging.",
  },
  {
    icon: Users,
    title: "Contact Management",
    description:
      "Turn networking interactions into organized contacts and actionable relationships.",
  },
  {
    icon: BarChart3,
    title: "Actionable Analytics",
    description:
      "Understand card engagement, contact growth and networking performance from one dashboard.",
  },
  {
    icon: Leaf,
    title: "Eco Impact",
    description:
      "Track paper saved, trees preserved and carbon impact as your digital network grows.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Security",
    description:
      "Built around modern authentication, controlled access and responsible data handling.",
  },
  {
    icon: QrCode,
    title: "One Scan Away",
    description:
      "Give prospects and partners a fast path to your verified digital profile.",
  },
];

function scrollToPricing() {
  document
    .getElementById("pricing")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToPayPal(planId: DigiConPlanId) {
  document
    .getElementById(`paypal-${planId}`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<DigiConPlanId | null>(null);

  const paypalClientId =
    import.meta.env.VITE_PAYPAL_CLIENT_ID?.trim() || "";

  const plans = useMemo(
    () =>
      PRICING_PLANS.map((plan) => ({
        ...plan,
        paypalPlanId: DIGICON_PAYPAL_PLANS[plan.id].planId,
      })),
    [],
  );

  useEffect(() => {
    const handler = () => setMobileMenuOpen(false);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleChoosePlan = (planId: DigiConPlanId) => {
    setSelectedPlan(planId);
    requestAnimationFrame(() => scrollToPayPal(planId));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="DigiCon home"
          >
            <img
              src="/DigiCon_logo_transparent.jpg"
              alt="DigiCon"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <span className="text-lg font-bold tracking-tight">DigiCon</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            <a className="text-sm text-white/70 transition hover:text-white" href="#features">
              Features
            </a>
            <a className="text-sm text-white/70 transition hover:text-white" href="#pricing">
              Pricing
            </a>
            <a className="text-sm text-white/70 transition hover:text-white" href="#how-it-works">
              How it works
            </a>
            <Link
              to="/auth"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              to="/auth?mode=signup"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Get started
            </Link>
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 px-4 pb-5 pt-4 md:hidden">
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              <a className="rounded-lg px-3 py-3 text-white/80 hover:bg-white/5" href="#features">
                Features
              </a>
              <a className="rounded-lg px-3 py-3 text-white/80 hover:bg-white/5" href="#pricing">
                Pricing
              </a>
              <a className="rounded-lg px-3 py-3 text-white/80 hover:bg-white/5" href="#how-it-works">
                How it works
              </a>
              <Link className="rounded-lg px-3 py-3 text-white/80 hover:bg-white/5" to="/auth">
                Sign in
              </Link>
              <Link
                className="rounded-lg bg-white px-3 py-3 text-center font-semibold text-black"
                to="/auth?mode=signup"
              >
                Get started
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(180,37,170,0.28),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_30%)]" />

          <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-32 lg:pt-28">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
                <Sparkles size={15} />
                Digital networking for modern businesses
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Make every
                <span className="block bg-gradient-to-r from-fuchsia-400 via-purple-300 to-white bg-clip-text text-transparent">
                  hello count.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
                DigiCon replaces paper business cards with beautiful digital
                profiles, smarter contact capture and practical CRM tools for
                SMEs, startups and teams.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-black transition hover:bg-white/90"
                >
                  Create your card
                  <ArrowRight size={18} />
                </Link>
                <button
                  type="button"
                  onClick={scrollToPricing}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                >
                  View plans
                </button>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
                <span className="inline-flex items-center gap-2">
                  <Check size={15} /> No paper waste
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={15} /> Share anywhere
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={15} /> Built for growth
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-2xl">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/60 p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src="/DigiCon_logo_transparent.jpg"
                      alt=""
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="text-xl font-bold">Your Digital Card</p>
                      <p className="text-sm text-white/50">Ready to share</p>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <QrCode className="mb-3" size={22} />
                      <p className="font-semibold">QR sharing</p>
                      <p className="mt-1 text-xs text-white/45">One scan to connect</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Link2 className="mb-3" size={22} />
                      <p className="font-semibold">Smart link</p>
                      <p className="mt-1 text-xs text-white/45">Share from anywhere</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                    <div className="flex items-center gap-3">
                      <Leaf size={20} className="text-emerald-300" />
                      <div>
                        <p className="font-semibold">Eco impact</p>
                        <p className="text-xs text-white/45">
                          Every digital card helps reduce paper use.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                Everything connected
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                More than a business card.
              </h2>
              <p className="mt-5 text-white/60">
                Give every introduction a useful next step—from the first scan
                to the next relationship.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:bg-white/[0.06]"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <Icon size={21} />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-3">
              {[
                ["01", "Create", "Build your professional digital card and add your photo or company logo."],
                ["02", "Connect", "Share your card through your unique URL, QR code, NFC or messaging."],
                ["03", "Grow", "Capture contacts, measure engagement and turn introductions into relationships."],
              ].map(([number, title, description]) => (
                <div key={number} className="relative">
                  <span className="text-sm font-bold text-fuchsia-300">{number}</span>
                  <h3 className="mt-3 text-2xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-white/55">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                Simple pricing
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Choose the plan that fits your network.
              </h2>
              <p className="mt-5 text-white/60">
                Select a plan first, then complete your subscription securely
                through PayPal.
              </p>
            </div>

            {!paypalClientId && (
              <div
                role="status"
                className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-center text-sm text-amber-200"
              >
                Online subscription checkout is currently unavailable. Please
                configure <code>VITE_PAYPAL_CLIENT_ID</code> before enabling
                live PayPal checkout.
              </div>
            )}

            <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={[
                    "relative flex h-full flex-col rounded-3xl border p-7",
                    plan.highlighted
                      ? "border-fuchsia-400/50 bg-fuchsia-400/[0.07] shadow-2xl shadow-fuchsia-900/20"
                      : "border-white/10 bg-white/[0.04]",
                  ].join(" ")}
                >
                  {plan.badge && (
                    <span className="absolute right-5 top-5 rounded-full bg-fuchsia-400 px-3 py-1 text-xs font-bold text-black">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-white/55">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-7 flex items-end gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    {plan.period && (
                      <span className="pb-1 text-sm text-white/45">{plan.period}</span>
                    )}
                  </div>

                  <ul className="mt-7 space-y-3 border-t border-white/10 pt-7">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-white/75"
                      >
                        <Check
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-300"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => handleChoosePlan(plan.id)}
                      aria-pressed={selectedPlan === plan.id}
                      className={[
                        "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition",
                        selectedPlan === plan.id
                          ? "bg-white text-black"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                      ].join(" ")}
                    >
                      {plan.cta}
                      <ArrowRight size={17} />
                    </button>
                  </div>

                  <div
                    id={`paypal-${plan.id}`}
                    className="mt-5 scroll-mt-28 rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-3">
                      <p className="text-sm font-semibold">
                        Subscribe with PayPal
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        Secure recurring payment for {plan.name}.
                      </p>
                    </div>

                    {paypalClientId ? (
                      <PayPalSubscriptionButton
                        clientId={paypalClientId}
                        planId={plan.paypalPlanId}
                        planName={plan.name}
                      />
                    ) : (
                      <div className="rounded-xl border border-white/10 px-4 py-3 text-center text-xs text-white/40">
                        PayPal checkout unavailable
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-white/35">
              PayPal subscription availability and payment methods are subject
              to PayPal account eligibility, plan configuration and applicable
              regional restrictions.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Ready to make every hello count?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-white/60">
              Create your DigiCon card and turn your next introduction into a
              lasting connection.
            </p>
            <div className="mt-8">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-black transition hover:bg-white/90"
              >
                Start with DigiCon
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-white/40 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} DigiCon. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/auth" className="hover:text-white">
              Sign in
            </Link>
            <Link to="/auth?mode=signup" className="hover:text-white">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
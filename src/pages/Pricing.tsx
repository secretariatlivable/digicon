import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { PublicLayout } from "@/components/layout/Layouts";
import { SectionHeading } from "@/components/kit";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/session";
import { cn } from "@/lib/utils";

const ROWS = [
  { feature: "Digital business card", free: "1 card", pro: "Unlimited cards" },
  { feature: "QR, link, SMS, email & NFC sharing", free: true, pro: true },
  { feature: "Contact capture from your public card", free: true, pro: true },
  { feature: "Relationship records & interaction history", free: true, pro: true },
  { feature: "Follow-ups and next actions", free: true, pro: true },
  { feature: "CRM pipeline view", free: false, pro: true },
  { feature: "Networking analytics & badges", free: false, pro: true },
  { feature: "Card image / vCard export", free: false, pro: true },
  { feature: "Apple & Google Wallet identity", free: false, pro: true },
  { feature: "Personal landing PWA templates", free: false, pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="dense text-sm">{value}</span>;
  }

  return value ? (
    <Check className="h-4 w-4 text-accent" aria-label="Included" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground" aria-label="Not included" />
  );
}

const CURRENCIES = [
  { code: "PHP", label: "Philippine Peso", symbol: "₱", rate: 58.8, decimals: 0 },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", rate: 1.28, decimals: 0 },
  { code: "MYR", label: "Malaysian Ringgit", symbol: "RM", rate: 4.05, decimals: 0 },
  { code: "THB", label: "Thai Baht", symbol: "฿", rate: 32.3, decimals: 0 },
  { code: "IDR", label: "Indonesian Rupiah", symbol: "Rp", rate: 16600, decimals: 0 },
  { code: "VND", label: "Vietnamese Dong", symbol: "₫", rate: 26400, decimals: 0 },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", rate: 148, decimals: 0 },
  { code: "KRW", label: "South Korean Won", symbol: "₩", rate: 1390, decimals: 0 },
  { code: "INR", label: "Indian Rupee", symbol: "₹", rate: 88, decimals: 0 },
  { code: "USD", label: "US Dollar", symbol: "$", rate: 1, decimals: 0 },
] as const;

const USD_PRICES = { monthly: 11, yearly: 111 } as const;

function formatLocalPrice(usd: number, currency: (typeof CURRENCIES)[number]) {
  const value = usd * currency.rate;
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(value);
}

export default function Pricing() {
  const { user, isPaid } = useAuth();
  const [currencyCode, setCurrencyCode] = useState("PHP");
  const currency = useMemo(
    () => CURRENCIES.find((item) => item.code === currencyCode) ?? CURRENCIES[0],
    [currencyCode],
  );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <p className="label-caps">Pricing</p>
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            Free to discover. Pro when DigiCon becomes infrastructure.
          </h1>
          <p className="dense mx-auto mt-3 max-w-xl text-muted-foreground">
            Start with the core relationship workspace for free. Upgrade to Pro for
            unlimited cards, CRM, analytics, wallet identity and more.
          </p>
        </div>

        <section className="glass mt-8 rounded-2xl p-5" aria-labelledby="currency-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="label-caps" id="currency-title">Display currency</p>
              <p className="dense mt-1 text-sm text-muted-foreground">
                Prices are converted from USD for easy local comparison. Stripe checkout remains in USD.
              </p>
            </div>
            <label className="sr-only" htmlFor="pricing-currency">Choose currency</label>
            <select
              id="pricing-currency"
              value={currencyCode}
              onChange={(event) => setCurrencyCode(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="glass rounded-2xl p-6" data-testid="plan-free">
            <p className="label-caps">Free</p>
            <p className="metric mt-1 text-3xl">{currency.symbol}0</p>
            <p className="dense mt-1 text-sm text-muted-foreground">
              Forever. One card, full relationship basics.
            </p>
            <Link
              to={user ? "/dashboard" : "/signup"}
              className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full")}
              data-testid="plan-free-cta"
            >
              {user ? "Go to dashboard" : "Start free"}
            </Link>
          </div>

          <div className="metal-edge rounded-2xl p-6" data-testid="plan-pro-monthly">
            <p className="label-caps">Pro · Monthly</p>
            <p className="metric mt-1 text-3xl gold-text">
              {currency.symbol}{formatLocalPrice(USD_PRICES.monthly, currency)}
            </p>
            <p className="dense mt-1 text-sm text-muted-foreground">
              per month · based on $11 USD
            </p>
            <Link
              to={isPaid ? "/billing" : "/checkout?plan=pro_monthly"}
              className={cn(buttonVariants(), "mt-5 w-full bg-gold text-[#1a1200] hover:bg-gold-metal")}
              data-testid="plan-pro-monthly-cta"
            >
              {isPaid ? "Manage subscription" : "Upgrade monthly"}
            </Link>
          </div>

          <div className="glass rounded-2xl p-6" data-testid="plan-pro-yearly">
            <p className="label-caps">Pro · Yearly</p>
            <p className="metric mt-1 text-3xl">
              {currency.symbol}{formatLocalPrice(USD_PRICES.yearly, currency)}
            </p>
            <p className="dense mt-1 text-sm text-muted-foreground">
              per year · two months free · based on $111 USD
            </p>
            <Link
              to={isPaid ? "/billing" : "/checkout?plan=pro_yearly"}
              className={cn(buttonVariants({ variant: "outline" }), "mt-5 w-full")}
              data-testid="plan-pro-yearly-cta"
            >
              {isPaid ? "Manage subscription" : "Upgrade yearly"}
            </Link>
          </div>
        </div>

        <section className="glass mt-10 overflow-x-auto rounded-2xl p-5" aria-label="Plan comparison">
          <SectionHeading eyebrow="Compare" title="What's in each plan" />
          <table className="w-full min-w-[520px] text-left" data-testid="pricing-table">
            <thead>
              <tr className="label-caps">
                <th scope="col" className="pb-2">Feature</th>
                <th scope="col" className="pb-2">Free</th>
                <th scope="col" className="pb-2">Pro</th>
              </tr>
            </thead>
            <tbody className="dense text-sm">
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-t border-border/60">
                  <th scope="row" className="py-2.5 pr-4 font-normal">{row.feature}</th>
                  <td className="py-2.5"><Cell value={row.free} /></td>
                  <td className="py-2.5"><Cell value={row.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </PublicLayout>
  );
}

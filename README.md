# DigiCon — Digital Connections

> **Your digital identity. Your connections. Your network.**

DigiCon turns the business card from a static identity page into a practical relationship-management tool for professionals, startups, SMEs, and growing organizations.

DigiCon is built around one outcome:

> **Never lose a valuable connection again.**

The product journey is intentionally broader than a digital-card generator:

```text
Identity → Share → Connect → Capture → Organize → Follow up → Measure → Grow
```

The current application implements the first layers of that journey through digital cards, public identities, contact capture, relationship-oriented contact states, analytics, subscription entitlements, wallet/PWA support, accessibility, and a Supabase backend.

## 1. Product thesis

A digital business card is the entry point, not the destination.

DigiCon is designed for people who meet people whose relationships matter: SME owners, founders, consultants, freelancers, sales and business-development professionals, recruiters, agency owners, real-estate professionals, community leaders, and other frequent networkers.

The product should help a user move from:

> “Nice meeting you.”

to:

> **“This person is now a structured, actionable relationship in my network.”**

That principle should guide new features, schema changes, UX decisions, analytics, and monetization.

## 2. What DigiCon is — and is not

### DigiCon is

- A professional digital identity layer.
- A fast sharing and connection layer.
- A lightweight networking CRM.
- A place to capture and organize relationships.
- An analytics surface for networking activity and outcomes.
- A foundation for follow-up, relationship intelligence, and network growth.

### DigiCon is not

- Merely a prettier QR business card.
- A full enterprise CRM replacement.
- A collection of disconnected templates and vanity metrics.

The strategic category is the **missing middle between the digital business card and heavyweight CRM**.

## 3. Current product capabilities

| Capability | Current direction |
|---|---|
| Digital identity | Branded cards, profile data, photos, QR/share URLs |
| Sharing | Public card links, QR codes, native share/clipboard, vCard |
| Connection capture | Public-card contact capture and owner-scoped contact records |
| Contact management | Search, filtering, statuses, notes, consent, CSV export |
| Networking analytics | Card shares, captured contacts, conversion rate and dashboards |
| Entitlements | Free Startup limits and paid-plan capability checks |
| Billing | Provider adapters for Stripe and PayPal feeding a canonical subscription model |
| Public identity | `/c/:cardId` shareable card pages with a constrained public projection |
| Wallet | vCard plus Apple/Google Wallet integration path |
| PWA | Install prompt handling, iOS guidance, service-worker registration |
| Accessibility | Accessibility provider, skip link, user-facing accessibility tools |
| Localization | English and Filipino/Tagalog support infrastructure |
| Sustainability | Eco-impact tracking and badges |
| Quality controls | Typecheck, lint, build preflight, migration/RLS assertions in CI |

Some capabilities described in product or architecture documentation are still evolving. Treat the implementation in `src/`, `supabase/`, and deployment configuration as the executable source of truth.

## 4. Architecture at a glance

```text
                          DIGICON
                   Digital Connections

      ┌───────────────────────┼───────────────────────┐
      │                       │                       │
   Identity                Connection             Relationship
      │                       │                       │
   Cards/Profile         QR / Link / Share       Contacts
   Public Identity       Contact Capture         Notes/Status
   Wallet/PWA             Consent                 Follow-up
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              │
                       Relationship Data
                              │
                 ┌────────────┼────────────┐
                 │            │            │
              Insights    Automation    Analytics
                 │            │            │
             Network       Reminders       ROI
              quality       Tasks        Conversion
                 │            │            │
                 └────────────┼────────────┘
                              │
                             Growth
```

### Frontend

```text
index.html
  ↓
src/main.tsx
  ↓
src/App.tsx
  ├── A11yProvider
  ├── ThemeProvider
  ├── BrowserRouter
  ├── AuthProvider
  ├── Public routes
  └── Protected routes
       ↓
    AppLayout
       ├── Dashboard
       ├── Cards
       ├── Contacts
       ├── Analytics
       ├── Eco
       └── Settings
```

Authenticated pages are route-level lazy loaded so public-card and first-visit paths do not pay the cost of authenticated application chunks until needed.

### Backend

Supabase provides:

- PostgreSQL data storage.
- Authentication.
- Row Level Security (RLS).
- Storage for card photos.
- SQL functions/RPCs for trusted mutations and counters.
- Edge Functions for provider-backed operations such as payment webhooks and wallet services.

### Architectural boundary

The browser is responsible for presentation, interaction, optimistic UX, and public-safe calls.

The backend is authoritative for:

- identity ownership;
- authorization;
- row visibility;
- paid-plan state;
- entitlement enforcement;
- provider webhook state;
- mutation integrity;
- security-sensitive counters and operations.

Client-side entitlement checks exist to guide UX; they are not a security boundary.

## 5. Repository structure

```text
digicon/
├── .github/
│   └── workflows/
│       ├── deploy-pages.yml
│       └── verify.yml
├── .gitignore
├── LICENSE
├── README.md
├── accessibility-bar-content.txt
├── backend/
│   ├── lib/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── dates.py
│   │   ├── db.py
│   │   └── insights_rules.py
│   ├── models/
│   │   └── __init__.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── cards.py
│   │   ├── content.py
│   │   ├── followups.py
│   │   ├── insights.py
│   │   ├── payments.py
│   │   └── relationships.py
│   ├── test/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_tscheck_admin_blog.py
│   │   ├── test_tscheck_auth_onboarding.py
│   │   ├── test_tscheck_card_builder_gating.py
│   │   ├── test_tscheck_dashboard_analytics_shape.py
│   │   ├── test_tscheck_plan_gating.py
│   │   └── test_tscheck_public_connect.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── seed.py
│   └── server.py
├── complete-audit.txt
├── components.json
├── docs/
│   └── DEVELOPER.md
├── eslint.config.js
├── index.html
├── memory/
│   └── SPEC.md
├── netlify.toml
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
│   ├── brand/
│   │   ├── connect-sm.webp
│   │   ├── connect.webp
│   │   ├── grow-sm.webp
│   │   ├── grow.webp
│   │   ├── male-sm.webp
│   │   ├── male.webp
│   │   ├── remember-sm.webp
│   │   ├── remember.webp
│   │   ├── share-sm.webp
│   │   └── share.webp
│   ├── media/
│   │   ├── banners/
│   │   │   ├── bigidea-1200.jpg
│   │   │   ├── bigidea-2400.jpg
│   │   │   ├── capture-1200.jpg
│   │   │   ├── capture-2400.jpg
│   │   │   ├── connect-1200.jpg
│   │   │   ├── connect-2400.jpg
│   │   │   ├── create-1200.jpg
│   │   │   ├── create-2400.jpg
│   │   │   ├── cta-1200.jpg
│   │   │   ├── cta-2400.jpg
│   │   │   ├── digicon_portrait1.png
│   │   │   ├── followup-1200.jpg
│   │   │   ├── followup-2400.jpg
│   │   │   ├── graph-1200.jpg
│   │   │   ├── graph-2400.jpg
│   │   │   ├── hero-1200.jpg
│   │   │   ├── hero-2400.jpg
│   │   │   ├── manage-1200.jpg
│   │   │   ├── manage-2400.jpg
│   │   │   ├── organizations-1200.jpg
│   │   │   ├── organizations-2400.jpg
│   │   │   ├── platform-1200.jpg
│   │   │   ├── platform-2400.jpg
│   │   │   ├── privacy-1200.jpg
│   │   │   ├── privacy-2400.jpg
│   │   │   ├── problem-1200.jpg
│   │   │   ├── problem-2400.jpg
│   │   │   ├── professionals-1200.jpg
│   │   │   ├── professionals-2400.jpg
│   │   │   ├── share-1200.jpg
│   │   │   ├── share-2400.jpg
│   │   │   ├── simplicity-1200.jpg
│   │   │   ├── simplicity-2400.jpg
│   │   │   ├── support-1200.jpg
│   │   │   ├── support-2400.jpg
│   │   │   ├── teams-1200.jpg
│   │   │   └── teams-2400.jpg
│   │   ├── digicon-contact-exchange.png
│   │   ├── digicon-female-professional.png
│   │   ├── digicon_beginning.png
│   │   ├── digicon_female_portrait_banner.png
│   │   ├── digicon_lasts.png
│   │   ├── digicon_male_portrait_banner.png
│   │   ├── digicon_male_wide_banner.png
│   │   ├── digicon_portrait1.png
│   │   ├── digicon_wide_banner copy.png
│   │   ├── digicon_wide_banner.png
│   │   ├── hero-loop-poster.jpg
│   │   ├── hero-loop.mp4
│   │   ├── hero-loop.webm
│   │   ├── og-image.jpg
│   │   └── what-is-digicon.png
│   ├── Background.png
│   ├── Cover_2.png
│   ├── DigiCon.png
│   ├── DigiCon_Banner.png
│   ├── DigiCon_banner.svg
│   ├── DigiCon_logo_transparent.jpg
│   ├── Digicon_logo.jpg
│   ├── apple-touch-icon.png
│   ├── digicon-contact-exchange.png
│   ├── digicon-female-professional.png
│   ├── digicon_beginning.png
│   ├── digicon_dcard.png
│   ├── digicon_dcard.svg
│   ├── digicon_female_portrait_banner.png
│   ├── digicon_lasts.png
│   ├── digicon_male_portrait_banner.png
│   ├── digicon_male_wide_banner.png
│   ├── digicon_portrait1.png
│   ├── digicon_wide_banner.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── favicon.webp
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   ├── icon-maskable-512.png
│   ├── icons.svg
│   ├── manifest.json
│   ├── manifest.webmanifest
│   ├── networking.png
│   ├── sw.js
│   └── what-is-digicon.png
├── scripts/
│   ├── check-repo-complete.sh
│   └── preflight.mjs
├── src/
│   ├── a11y/
│   │   ├── AccessibilityBar.tsx
│   │   ├── AccessibilityTools.tsx
│   │   ├── CookieConsent.tsx
│   │   ├── a11y.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminPanels.tsx
│   │   ├── brand/
│   │   │   ├── BrandImage.tsx
│   │   │   └── DigiConLogo.tsx
│   │   ├── card/
│   │   │   ├── BuilderTabs.tsx
│   │   │   ├── CardCanvas.tsx
│   │   │   ├── CardParts.tsx
│   │   │   └── DigiConCard.tsx
│   │   ├── contacts/
│   │   │   └── ContactDetailPanels.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardSections.tsx
│   │   ├── kit/
│   │   │   └── index.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AppShell.tsx
│   │   │   ├── LandingNav.tsx
│   │   │   ├── Layouts.tsx
│   │   │   ├── MobileAppNav.tsx
│   │   │   └── SiteFooter.tsx
│   │   ├── ui/
│   │   │   ├── AmbientVideo.tsx
│   │   │   ├── Collapsible.tsx
│   │   │   ├── ConnectionGraph.tsx
│   │   │   ├── FlowStrip.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Reveal.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── SectionBanner.tsx
│   │   │   ├── Tiles.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── DigiConPayPalProvider.tsx
│   │   ├── PayPalSubscriptionButton.tsx
│   │   ├── StripeCheckoutButton.tsx
│   │   ├── UpgradeRequiredDialog.tsx
│   │   └── theme-provider.tsx
│   ├── config/
│   │   ├── paypalPlans.ts
│   │   └── stripePlans.ts
│   ├── content/
│   │   ├── landing.ts
│   │   └── support.ts
│   ├── hooks/
│   │   ├── useCardBuilder.ts
│   │   └── useContactDetail.ts
│   ├── lib/
│   │   ├── a11y.tsx
│   │   ├── api.ts
│   │   ├── auth.tsx
│   │   ├── cardMutations.ts
│   │   ├── entitlements.ts
│   │   ├── i18n.ts
│   │   ├── motion.ts
│   │   ├── navigation.ts
│   │   ├── pwa.ts
│   │   ├── queryClient.ts
│   │   ├── session.ts
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   └── wallet.ts
│   ├── pages/
│   │   ├── Admin.tsx
│   │   ├── Analytics.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── Billing.tsx
│   │   ├── Blog.tsx
│   │   ├── CardBuilder.tsx
│   │   ├── CardsPage.tsx
│   │   ├── ContactDetail.tsx
│   │   ├── Contacts.tsx
│   │   ├── ContactsPage.tsx
│   │   ├── Crm.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EcoPage.tsx
│   │   ├── FollowUps.tsx
│   │   ├── Home.tsx
│   │   ├── InfoPage.tsx
│   │   ├── Landing.tsx
│   │   ├── LandingPwa.tsx
│   │   ├── Login.tsx
│   │   ├── MyCards.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Pricing.tsx
│   │   ├── PublicCard.tsx
│   │   ├── Settings.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── Share.tsx
│   │   ├── Signup.tsx
│   │   ├── SupportPage.tsx
│   │   └── WalletExport.tsx
│   ├── pwa/
│   │   ├── InstallBar.tsx
│   │   └── InstallPrompt.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   ├── functions/
│   │   ├── apple-wallet-pass/
│   │   │   └── index.ts
│   │   ├── google-wallet-pass/
│   │   │   └── index.ts
│   │   ├── paypal-create-subscription/
│   │   │   └── index.ts
│   │   └── paypal-webhook/
│   │       └── index.ts
│   ├── migrations/
│   │   ├── 20260822144224_create_digicon_schema.sql
│   │   ├── 20260826155006_add_card_builder_fields.sql
│   │   ├── 20260828000000_production_security_subscriptions.sql
│   │   ├── 20260828000001_public_cards_wallet_security.sql
│   │   ├── 20260828120000_fix_rls_billing_and_counters.sql
│   │   ├── 20260830000000_normalize_subscription_status.sql
│   │   ├── 20260830010000_server_authoritative_capabilities.sql
│   │   └── 20260830020000_trusted_card_mutations.sql
│   ├── tests/
│   │   ├── 00_supabase_stubs.sql
│   │   ├── 01_rls_and_entitlements.sql
│   │   ├── 02_trusted_card_mutations.sql
│   │   ├── README.md
│   │   └── run.sh
│   ├── config.toml
│   ├── reconcile-subscription.sql
│   └── verify-deployment.sql
├── tailwind.config.js
├── tools/
│   ├── gen_banners.py
│   └── gen_brand.py
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── typecheck-errors.txt
├── vercel.json
└── vite.config.ts
```

### Where to put new code

- **Page-level user journeys:** `src/pages/`
- **Reusable UI primitives:** `src/components/ui/`
- **DigiCon-specific domain components:** `src/components/card/`, or another domain folder under `src/components/`
- **Cross-cutting application services:** `src/lib/`
- **Browser-safe configuration:** `src/config/`
- **Product copy/content:** `src/content/`
- **Database changes:** `supabase/migrations/`
- **Trusted server operations:** `supabase/functions/` and SQL RPCs
- **Database behavior tests:** `supabase/tests/`
- **Build/deployment checks:** `scripts/` and `.github/workflows/`

Avoid putting business rules directly inside large page components when a rule can be expressed as a reusable domain contract.

## 6. Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing experience |
| `/auth` | Public | Sign in, sign up, password reset |
| `/c/:cardId` | Public | Public DigiCon identity |
| `/dashboard` | Authenticated | Networking overview and KPIs |
| `/cards` | Authenticated | Create, edit, share and manage cards |
| `/contacts` | Authenticated | Manage captured relationships |
| `/analytics` | Authenticated | Networking analytics |
| `/eco` | Authenticated | Environmental impact and badges |
| `/settings` | Authenticated | Account and subscription settings |

Protected pages are wrapped by `ProtectedRoute` and `AppLayout`.

Unknown routes currently redirect to `/`.

## 7. Core domain model

### Identity

A `business_cards` row represents a professional identity that can be rendered publicly and shared through a stable URL.

### Contact

A `contacts` row represents a person captured into the user's relationship space. It currently stores identity information, relationship status, notes, source, consent, and CRM synchronization state.

### Connection

The current system captures the result of a connection but does not yet model every interaction as a first-class append-only event.

The preferred future model is:

```text
relationship_events
-------------------
id
user_id
contact_id
card_id
event_type
event_time
metadata
created_at
```

Candidate event types:

```text
card_shared
card_viewed
contact_captured
contact_saved
note_added
status_changed
followup_created
followup_completed
meeting_recorded
email_clicked
phone_clicked
website_clicked
```

This event layer should become the foundation for analytics, reminders, auditability, and relationship intelligence.

### Relationship

The product direction is to evolve from a flat contact record toward a relationship record containing:

- how and where the people met;
- interaction history;
- relationship status;
- ownership;
- notes/context;
- next action;
- last interaction;
- future follow-up.

This is the core product differentiator.

## 8. Entitlements and monetization

The current entitlement policy lives in `src/lib/entitlements.ts`.

The current free Startup policy is:

- up to two cards;
- two completed edits per card;
- wallet export requires an active paid plan;
- active paid plans bypass Startup limits.

The architectural rule is:

> **The client can explain a capability; the server must enforce it.**

### Canonical subscription vocabulary

```text
plan:
  startup | starter | growth | enterprise

status:
  active | approval_pending | suspended | cancelled | expired
```

Stripe and PayPal provider-specific states should be normalized before entering the application subscription model.

## 9. API and backend contracts

DigiCon does not currently expose a single standalone REST API specification.

The backend contract is composed of:

- Supabase table/view access;
- SQL RPCs;
- Edge Functions.

For that reason, API documentation belongs in the developer documentation, but it must document the **real current contract** rather than invent an OpenAPI API that does not exist.

See:

- [`docs/DEVELOPER.md`](docs/DEVELOPER.md)
- [`docs/API.md`](docs/API.md)

### API design rule

When a capability changes system state, prefer:

```text
UI
 ↓
Domain contract
 ↓
Trusted RPC / Edge Function
 ↓
Database mutation
```

Security-sensitive business logic must not live only inside React components.

### Public versus authenticated data

Public card reads should use the constrained public-card projection.

Authenticated queries remain owner-scoped and protected by RLS.

## 10. Security model

DigiCon treats security as a system property.

### Browser environment

Only `VITE_*` variables are exposed to the browser bundle.

Never expose:

- service-role keys;
- wallet signing keys;
- payment-provider secrets;
- other server-only credentials.

### Authentication

Supabase Auth is the canonical application identity provider.

### Row Level Security

RLS forms part of the authorization model.

Security tests should execute under the role being tested; superuser/table-owner execution can bypass policies and create false confidence.

### Storage

Card-photo paths should be owner-scoped.

### Public data

Anonymous users should see only the intended public-card projection.

### CSV export

CSV output must safely escape quotes and guard against spreadsheet formula injection because contact fields are user-controlled.

### HTTP security

Deployment configuration includes baseline security headers and CSP. Changes to third-party integrations must be reflected in CSP and verified in production.

## 11. Accessibility and UX principles

DigiCon optimizes for clarity, confidence, and speed at the moment of connection.

The preferred UX progression is:

```text
Create identity
   ↓
Share
   ↓
Capture connection
   ↓
Organize relationship
   ↓
Take next action
   ↓
Measure outcome
```

Advanced functionality should appear progressively rather than overwhelming the first interaction.

Every new flow should preserve:

- keyboard accessibility;
- visible focus states;
- semantic controls;
- accessible labels;
- meaningful status announcements;
- readable contrast;
- mobile touch targets;
- clear error recovery;
- reduced-motion accommodation where relevant.

## 12. Environment variables

Start from `.env.example`.

### Browser configuration

| Variable | Required | Purpose |
|---|---:|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public/anonymous key |
| `VITE_PUBLIC_APP_URL` | No | Canonical origin for share URLs and QR codes |
| `VITE_PAYPAL_CLIENT_ID` | No | Public PayPal client identifier |
| `VITE_PAYPAL_ENVIRONMENT` | No | PayPal environment selector |
| `VITE_SENTRY_DSN` | No | Client error tracking |
| `VITE_GA_MEASUREMENT_ID` | No | Analytics measurement identifier |
| `VITE_APP_ENV` | No | Environment marker |

### Server-only configuration

Keep these in Supabase Edge Function secrets or the equivalent secure secret store:

```text
SUPABASE_SERVICE_ROLE_KEY
PUBLIC_APP_URL
WALLET_ALLOWED_ORIGINS

PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_ENVIRONMENT
PAYPAL_WEBHOOK_ID
PAYPAL_STARTER_PLAN_ID
PAYPAL_GROWTH_PLAN_ID
PAYPAL_ENTERPRISE_PLAN_ID

APPLE_PASS_TYPE_IDENTIFIER
APPLE_TEAM_IDENTIFIER
APPLE_CERTIFICATE_PEM
APPLE_PRIVATE_KEY_PEM
APPLE_WWDR_CERTIFICATE_PEM

GOOGLE_WALLET_ISSUER_ID
GOOGLE_WALLET_CLASS_ID
GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL
GOOGLE_WALLET_PRIVATE_KEY
```

## 13. Local development

The repository currently targets Node 22+ and npm 10+.

```bash
git clone https://github.com/secretariatlivable/digicon.git
cd digicon
npm ci
cp .env.example .env
npm run dev
```

Useful commands:

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run verify
```

`npm run verify` is the broad local quality gate.

## 14. Database development

Database changes belong in versioned migrations under `supabase/migrations/`.

Migrations should be:

- deterministic;
- idempotent where practical;
- forward-compatible with existing data;
- explicit about constraints;
- paired with behavioral tests when changing authorization, visibility, entitlements, or mutation integrity.

Run the migration/RLS suite locally with PostgreSQL:

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres ./supabase/tests/run.sh
```

See [`supabase/tests/README.md`](supabase/tests/README.md).

## 15. CI and quality gates

GitHub Actions verifies the frontend and database layers.

```text
frontend
  ├── npm ci
  ├── TypeScript typecheck
  ├── ESLint
  └── Vite build

migrations
  └── PostgreSQL migration + RLS assertions
```

The preflight script also detects unresolved aliased imports and missing runtime assets.

## 16. Deployment

DigiCon is a Vite SPA.

The repository currently contains both Netlify and Vercel deployment definitions. The project should designate **one canonical production platform** and treat other deployment definitions as explicitly secondary.

Before deployment:

```bash
npm run verify
```

Confirm:

1. hosting environment variables are configured;
2. migrations have been applied;
3. storage buckets and policies exist;
4. Edge Function secrets are configured;
5. billing webhooks point to the correct environment;
6. wallet credentials are server-only;
7. CSP matches actual third-party integrations;
8. `/c/:cardId` works anonymously;
9. protected routes require authentication;
10. entitlement limits cannot be bypassed through direct client calls.

## 17. Operational readiness

Production readiness means more than a successful build.

Failures should be distinguishable as:

```text
configuration failure
        ↓
authentication failure
        ↓
authorization/RLS failure
        ↓
business-rule/entitlement failure
        ↓
provider/webhook failure
        ↓
UI/network failure
```

User-facing errors should be actionable without leaking infrastructure details or secrets.

## 18. Product architecture roadmap

### P0 — Authoritative domain boundaries

- Enforce card creation/edit limits server-side.
- Centralize subscription-to-entitlement resolution.
- Keep Stripe/PayPal provider states behind billing adapters.
- Keep public-card access behind a constrained projection.

### P1 — Relationship infrastructure

- Introduce `relationship_events`.
- Add relationship timeline.
- Add “how we met” context.
- Add next action/follow-up.
- Track last interaction.
- Track relationship state transitions.

### P1 — Outcome-centered analytics

Evolve from activity-only metrics toward:

```text
connections
→ qualified relationships
→ follow-ups due
→ follow-ups completed
→ opportunities
→ conversions
```

### P2 — Network intelligence

- Relationship health.
- Follow-up suggestions.
- Event mode.
- Shared relationship ownership.
- Offline-first connection capture and synchronization.

## 19. Architecture protection rules

### Rule 1 — One domain concept, one canonical vocabulary

Do not introduce provider-specific synonyms into the domain model.

### Rule 2 — Client checks are UX, not security

Anything affecting access, money, or protected data must be enforced by trusted backend logic.

### Rule 3 — Prefer events over counters for business history

Counters are derived metrics. Capture the underlying interaction whenever future analytics or auditability matter.

### Rule 4 — Keep public identity deliberately narrow

A field being present in a user's profile does not mean it should be anonymously queryable.

### Rule 5 — Avoid duplicate identity representations

The same identity should render consistently across editor preview, card list, public card, sharing surfaces, and wallet representations.

### Rule 6 — Design for recovery

Authentication, billing, uploads, connectivity, and provider failures must produce understandable recovery paths.

### Rule 7 — Document architectural decisions

Significant architectural changes should update ADRs/developer documentation instead of relying solely on implementation comments.

## 20. Contribution workflow

Before opening a pull request:

```bash
npm ci
npm run verify
```

For schema/security changes:

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres ./supabase/tests/run.sh
```

A PR should explain:

- the user/business outcome;
- the changed domain contract;
- data/API/RLS implications;
- how behavior was tested;
- whether documentation or environment configuration changed.

Prefer small, coherent changes that preserve a green verification pipeline.

## 21. Documentation map

| Document | Purpose |
|---|---|
| `README.md` | Product, architecture, setup, quality and contribution overview |
| `docs/DEVELOPER.md` | Detailed developer handbook and architecture conventions |
| `docs/API.md` | Current backend/API/RPC/Edge Function contract |
| `supabase/tests/README.md` | Database/RLS testing methodology |
| `supabase/migrations/` | Executable database history |
| `.env.example` | Browser/server environment boundary |
| `.github/workflows/verify.yml` | CI quality gates |

## Final principle

DigiCon should not try to win by becoming another generic digital-business-card clone.

It should win by owning what happens **after the card is shared**:

> **Capture the connection. Understand the relationship. Remember the next step. Measure what matters. Grow the network.**

# DigiCon Developer Handbook

## Purpose

This document is the engineering-level companion to the root README.

Its purpose is to keep the DigiCon codebase coherent as the product evolves from a digital business-card application into a relationship-management platform.

The guiding system model is:

```text
Identity
   ↓
Share
   ↓
Connect
   ↓
Capture
   ↓
Organize
   ↓
Follow up
   ↓
Measure
   ↓
Grow
```

When choosing between two technically valid implementations, prefer the one that strengthens this chain.

---

## 1. Architecture principles

### 1.1 Domain before page

Pages are user journeys.

Domain concepts are the system.

Avoid implementing core business behavior exclusively inside:

```text
DashboardPage.tsx
CardsPage.tsx
ContactsPage.tsx
```

Prefer reusable domain functions/services/components.

### 1.2 Backend authority

The browser may provide:

- validation;
- previews;
- optimistic states;
- user messaging;
- client-side entitlement hints.

The browser must not be the final authority for:

- ownership;
- protected data;
- subscription status;
- plan entitlements;
- privileged mutations;
- security-sensitive counters.

### 1.3 One canonical contract

Every important concept should have one canonical vocabulary.

For example:

```text
startup
starter
growth
enterprise
```

and:

```text
active
approval_pending
suspended
cancelled
expired
```

Provider-specific states are translated into this domain vocabulary.

---

## 2. Frontend architecture

### Application shell

`src/App.tsx` owns:

- application providers;
- public routes;
- authenticated routes;
- protected-route handling;
- route-level code splitting;
- configuration failure handling;
- PWA registration;
- accessibility integration.

Do not duplicate layout wrappers inside individual protected pages.

### Component layers

Use three conceptual layers:

```text
Design tokens
    ↓
UI primitives
    ↓
Domain components
```

Examples:

```text
UI primitives
  Button
  Input
  Dialog
  Badge
  Card

Domain components
  DigiConCard
  ContactRow
  RelationshipTimeline
  FollowUpCard
  NetworkMetric
```

### Page responsibility

A page should orchestrate a journey.

It should not become a catch-all repository for:

- SQL business rules;
- billing policy;
- authorization;
- design-system primitives;
- duplicated card rendering;
- domain event semantics.

---

## 3. Authentication contract

Supabase Auth is DigiCon's canonical identity provider.

The application expects:

```text
auth.users
   ↓
profiles
```

Profile provisioning is backend-driven.

The frontend should not attempt to create duplicate identity records merely because a signup has not yet acquired a session.

### Protected route contract

Authenticated application routes must:

1. wait for authentication resolution;
2. redirect unauthenticated users to `/auth`;
3. preserve intended return paths where practical;
4. render the authenticated application shell only after access is established.

---

## 4. Public identity contract

Public cards are accessed through:

```text
/c/:cardId
```

A public response should expose only explicitly public fields.

The public shape should be conceptually similar to:

```text
id
full_name
job_title
company
email
phone
website
address
bio
photo_url
card_color
accent_color
design_template
font_family
```

Internal ownership and operational fields must remain private.

Future enhancement:

```text
field_visibility
----------------
email: public
phone: connection_only
address: hidden
website: public
```

---

## 5. Card domain contract

A business card is both:

1. an identity representation;
2. a shareable relationship entry point.

The shared `DigiConCard` component should remain the canonical presentation layer for:

- editor preview;
- authenticated card list;
- share surfaces;
- public identity where compatible.

Do not create separate renderers that allow the editor and recipient to see different identity representations.

---

## 6. Entitlement architecture

Current client-side helpers are intentionally useful for UX.

They are not sufficient authorization.

### Preferred contract

```text
React
 ↓
capability request
 ↓
trusted RPC / Edge Function
 ↓
canonical subscription
 ↓
entitlement policy
 ↓
mutation
```

Preferred conceptual API:

```text
can('card.create')
can('card.edit')
can('wallet.export')
can('team.member.add')
```

rather than spreading plan comparisons throughout the UI.

### Free plan

Current Startup policy:

```text
max cards = 2
max completed edits per card = 2
wallet export = paid only
```

Paid subscriptions bypass Startup limits while active.

---

## 7. Billing architecture

Stripe and PayPal are infrastructure providers, not domain concepts.

The target architecture is:

```text
Stripe      PayPal
   │           │
   └─────┬─────┘
         ↓
    Billing Adapter
         ↓
 Canonical Subscription
         ↓
   Entitlement Policy
         ↓
 Application Capability
```

Provider-specific webhooks may contain very different lifecycle states.

Normalize them before writing application subscription state.

Never leak provider-specific terminology into feature authorization.

---

## 8. Relationship architecture

The current `contacts` table is the beginning of the relationship model.

The target model is:

```text
Contact
  +
Context
  +
Interactions
  +
Status
  +
Next Action
  +
Ownership
```

A future relationship record should answer:

- Who is this person?
- Where did we meet?
- When did we meet?
- Why does the connection matter?
- Who owns the relationship?
- What has happened since?
- What should happen next?

### Relationship status

A baseline lifecycle can be:

```text
new
follow_up
active
converted
dormant
archived
```

The exact vocabulary should remain centralized.

---

## 9. Event architecture

Long-term analytics should not depend on mutable counters alone.

Preferred model:

```text
relationship_events
```

with:

```text
id
user_id
contact_id
card_id
event_type
event_time
metadata
created_at
```

Events should be append-oriented.

Counters such as:

```text
share_count
contacts_saved
cards_shared
```

should be regarded as derived operational metrics, not the complete history of what happened.

---

## 10. API architecture

DigiCon's backend API is currently composed of Supabase-native interfaces rather than one public REST API.

### Surface A — Table/view access

Used for:

- owner-scoped reads;
- public-card projection reads;
- simple CRUD where RLS is the authoritative control.

### Surface B — RPCs

Use SQL functions/RPCs when a mutation needs:

- atomicity;
- security-sensitive counting;
- entitlement enforcement;
- trusted ownership derivation;
- multiple coordinated database operations.

### Surface C — Edge Functions

Use Edge Functions when the operation needs:

- server-only credentials;
- payment-provider APIs;
- wallet signing;
- webhook handling;
- external service integration;
- elevated server-side logic.

See `docs/API.md` for the contract reference.

---

## 11. Database and RLS

RLS is part of the application authorization model.

Every protected table should answer:

```text
Who owns this row?
Who can read it?
Who can create it?
Who can modify it?
Who can delete it?
Can anonymous users access it?
```

### Testing principle

Never validate an RLS policy only as a privileged database owner.

The test must model the real role:

```text
anon
authenticated
service_role
```

as appropriate.

---

## 12. Storage

Card photos are stored in the `card-photos` storage area.

The expected ownership relationship is:

```text
user_id/
  photo-1.jpg
  photo-2.jpg
```

Storage policies must prevent cross-user writes.

Never trust the browser to choose a secure storage path.

---

## 13. Data privacy

DigiCon holds professional identity and relationship information.

Therefore:

### Minimize anonymous exposure

Only explicitly public fields should be anonymously queryable.

### Preserve consent state

Contact capture should retain consent information where appropriate.

### Do not log secrets

Never log:

- service credentials;
- wallet private keys;
- payment secrets;
- auth tokens;
- unnecessary personal information.

### Export safety

Generated CSV files must defend against:

- malformed quoting;
- formula injection;
- encoding issues.

---

## 14. UX architecture

DigiCon should optimize for the moment of human connection.

### Primary UX flow

```text
Meet someone
   ↓
Share identity
   ↓
Exchange details
   ↓
Capture relationship
   ↓
Add context
   ↓
Choose next action
   ↓
Follow up
```

### Avoid premature complexity

Do not expose enterprise CRM complexity before the user has a relationship to manage.

Use progressive disclosure.

---

## 15. Accessibility contract

New functionality must preserve:

- semantic HTML;
- keyboard navigation;
- focus visibility;
- accessible names;
- live-region status messaging where needed;
- adequate contrast;
- touch target size;
- reduced-motion behavior.

Accessibility is not limited to the authenticated dashboard.

Public cards are also customer-facing product surfaces.

---

## 16. PWA and offline architecture

Current PWA behavior focuses on installation and caching.

The long-term strategic requirement is stronger:

```text
Offline identity
   ↓
Offline sharing
   ↓
Offline connection capture
   ↓
Local pending events
   ↓
Sync
   ↓
Conflict resolution
```

For networking use cases, offline relationship capture is more strategically valuable than generic offline page caching.

---

## 17. Analytics architecture

Do not optimize only for:

```text
shares
views
card count
```

The long-term KPI hierarchy should be:

```text
connections
→ qualified relationships
→ follow-ups due
→ follow-ups completed
→ opportunities
→ conversions
```

Activity metrics remain useful as diagnostic signals.

Outcome metrics should guide product decisions.

---

## 18. Error-handling strategy

User-visible errors should answer:

1. What happened?
2. Can the user recover?
3. What should they do next?

Examples:

```text
Authentication
→ sign in again

Configuration
→ configure required environment values

Payment
→ retry or contact support

Storage
→ retry / administrator action

Network
→ preserve pending work where possible
```

Avoid exposing raw infrastructure details unless useful for developers/operators.

---

## 19. Testing strategy

### Frontend

At minimum:

```text
typecheck
lint
build
```

### Database

Test:

- RLS;
- public-card visibility;
- cross-user isolation;
- entitlement limits;
- RPC behavior;
- trigger behavior;
- counter integrity;
- storage ownership.

### End-to-end priorities

Test the highest-value journeys:

```text
signup
→ create card
→ publish/share card
→ public contact capture
→ authenticated contact management
→ follow-up state change
→ paid upgrade
→ entitlement change
```

---

## 20. Deployment contract

A deployment is not complete until:

- frontend build passes;
- migrations are applied;
- RLS assertions pass;
- environment variables exist;
- storage exists;
- Edge Functions exist;
- provider webhooks point at the correct environment;
- public-card sharing works;
- authenticated flows work;
- entitlements are enforced server-side.

The canonical production host should be explicitly selected to prevent deployment configuration drift.

---

## 21. Change management

Changes fall into four categories.

### UI-only

Examples:

- copy;
- spacing;
- visual hierarchy.

Usually low architectural risk.

### Domain behavior

Examples:

- card limits;
- relationship state;
- billing rules.

Require domain-contract review.

### Data/security

Examples:

- migrations;
- RLS;
- views;
- storage policies.

Require database tests.

### External integrations

Examples:

- Stripe;
- PayPal;
- wallets;
- analytics vendors.

Require:

- environment review;
- CSP review;
- webhook review;
- failure-path testing.

---

## 22. Architectural decision records

Significant decisions should live under:

```text
docs/adr/
```

Recommended baseline:

```text
ADR-001-auth-identity.md
ADR-002-billing-provider-abstraction.md
ADR-003-entitlement-boundary.md
ADR-004-relationship-model.md
ADR-005-public-identity-privacy.md
ADR-006-event-and-analytics-model.md
ADR-007-offline-connection-capture.md
```

An ADR should describe:

```text
Context
Decision
Alternatives
Consequences
Migration/implementation notes
```

---

## 23. Developer checklist

Before coding:

```text
What user/business outcome changes?
What domain concept changes?
Does data change?
Does authorization change?
Does entitlement change?
Does the public/private boundary change?
Does analytics need a new event?
```

Before merging:

```text
npm run verify
database tests when applicable
review security implications
review documentation implications
```

The goal is not simply shipping code.

The goal is preserving a coherent system.

---

## 24. North-star engineering test

Before adding a feature, ask:

> **Does this make DigiCon better at turning networking activity into relationship capital?**

If the answer is no, the feature should justify itself on another strong architectural or commercial basis.

If the answer is yes, it should strengthen one or more of:

```text
Identity
Share
Connect
Capture
Organize
Follow up
Measure
Grow
```
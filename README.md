# DigiCon

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3ECF8E?logo=supabase)](https://supabase.com)

> **DigiCon** is an all-in-one digital business card and CRM platform built for Philippine SMEs and startups.

DigiCon replaces traditional paper business cards with beautiful, shareable digital cards while capturing leads into a lightweight CRM.

The platform helps users:

- Create professional digital business cards
- Share cards through QR codes, links, SMS, and other channels
- Capture and manage contacts
- Track networking and lead-generation activity
- Monitor environmental impact
- Earn eco-badges through sustainable networking
- Manage business connections through a centralized dashboard
- Save digital cards to supported mobile wallets

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Application Architecture](#application-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Available Scripts](#available-scripts)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)
  - [Vercel](#vercel-recommended)
  - [Manual Build](#manual-build)
- [Contributing](#contributing)
- [Code Standards](#code-standards)
- [License](#license)

---

## Features

| Feature | Description |
|---|---|
| **Smart Digital Cards** | Create branded digital business cards with QR codes, NFC-compatible sharing, SMS, and link sharing. |
| **CRM Automation** | Capture leads, manage contacts, export contact data, and support CRM workflows. |
| **Analytics Dashboard** | Track leads, contact activity, networking performance, and environmental impact. |
| **Eco Gamification** | Track paper saved, trees saved, and carbon reduction while earning sustainability badges. |
| **Multi-language Support** | Support for English and Filipino (Tagalog) localization. |
| **Glassmorphism UI** | Apple-inspired liquid-glass visual design system with responsive and accessibility-conscious components. |
| **Wallet Integration** | Support for vCard downloads and server-generated Apple Wallet and Google Wallet passes. |
| **Public Digital Cards** | Shareable public business-card pages using `/c/:cardId`. |
| **Authentication** | Supabase authentication with protected application routes. |
| **Team Collaboration** | Multi-seat access for supported Growth and Enterprise plans. |
| **Responsive Design** | Optimized for desktop, tablet, and mobile devices. |
| **Progressive Web App** | PWA manifest and mobile installation support. |

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Custom CSS design system
- Lucide React

### Backend

- Supabase
  - PostgreSQL
  - Authentication
  - Row Level Security
  - Storage
  - Realtime capabilities

### Application Libraries

- Recharts — analytics and data visualization
- `qrcode.react` — QR-code generation
- React Router — client-side routing

### Deployment

- Vercel
- GitHub
- Vite production build

---

## Application Architecture

DigiCon uses a React application architecture where the root `index.html` loads the Vite entry point, `main.tsx` bootstraps React, and `App.tsx` manages application providers and routing.

```text
index.html
    │
    ▼
src/main.tsx
    │
    ▼
src/App.tsx
    │
    ├── ThemeProvider
    │
    ├── AuthProvider
    │
    └── BrowserRouter
          │
          ▼
       AppRoutes
          │
          ├── LandingPage
          ├── AuthPage
          ├── PublicCardPage
          │
          └── Protected Routes
                │
                ▼
             AppLayout
                │
                ├── DashboardPage
                ├── CardsPage
                ├── ContactsPage
                ├── AnalyticsPage
                ├── EcoPage
                └── SettingsPage
````

### Application Entry Point

The root `index.html` loads:

```html
<script type="module" src="/src/main.tsx"></script>
```

React dependencies should be imported through `main.tsx` and the application's TypeScript modules rather than directly from `index.html`.

For example:

```text
index.html
    ↓
main.tsx
    ↓
App.tsx
    ↓
AppLayout
    ↓
Application pages
```

---

## Getting Started

### Prerequisites

Make sure the following are installed:

* [Node.js](https://nodejs.org/) `>= 18.0.0`
* [npm](https://www.npmjs.com/) `>= 9.0.0`
* A [Supabase](https://supabase.com/) project
* Git
* A modern web browser

---

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/secretariatlivable/digicon.git
cd digicon
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env
```

Then edit `.env` and provide the required Supabase configuration.

#### 4. Start the development server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file based on `.env.example`.

| Variable                 | Required | Description                                                                 |
| ------------------------ | -------- | --------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Yes      | Supabase project URL.                                                       |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous/public key.                                              |
| `VITE_SENTRY_DSN`        | No       | Sentry DSN for client-side error tracking.                                  |
| `VITE_GA_MEASUREMENT_ID` | No       | Google Analytics 4 measurement ID.                                          |
| `VITE_APP_ENV`           | No       | Application environment, such as `development`, `staging`, or `production`. |

### Security Note

Only variables prefixed with `VITE_` are exposed to the Vite client bundle.

Never commit your `.env` file to Git.

The Supabase anonymous key is designed for client-side use when Supabase Row Level Security is correctly configured. It must still be protected from accidental exposure through source-control files, logs, or configuration commits.

Never place Supabase service-role keys, private API keys, wallet signing credentials, or other server-side secrets in variables exposed to the browser.

---

## Project Structure

The expected project structure is:

```text
digicon/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── ...static assets
│
├── src/
│   ├── components/
│   │   ├── brand/
│   │   │   └── ...brand components
│   │   │
│   │   ├── AppLayout.tsx
│   │   ├── theme-provider.tsx
│   │   │
│   │   └── ui/
│   │       ├── GlassCard.tsx
│   │       └── ...UI components
│   │
│   ├── lib/
│   │   ├── auth.tsx
│   │   ├── i18n.ts
│   │   ├── supabase.ts
│   │   ├── wallet.ts
│   │   └── ...shared services
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CardsPage.tsx
│   │   ├── ContactsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── EcoPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── PublicCardPage.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

> **Note:** If your repository uses `src/components/pages/LandingPage.tsx` instead of `src/pages/LandingPage.tsx`, update the import in `App.tsx` accordingly. The import path must match the actual repository structure.

---

## Routes

DigiCon uses React Router for client-side navigation.

### Public Routes

| Route        | Component        | Access |
| ------------ | ---------------- | ------ |
| `/`          | `LandingPage`    | Public |
| `/auth`      | `AuthPage`       | Public |
| `/c/:cardId` | `PublicCardPage` | Public |

### Protected Routes

Authenticated users can access:

| Route        | Component       | Access        |
| ------------ | --------------- | ------------- |
| `/dashboard` | `DashboardPage` | Authenticated |
| `/cards`     | `CardsPage`     | Authenticated |
| `/contacts`  | `ContactsPage`  | Authenticated |
| `/analytics` | `AnalyticsPage` | Authenticated |
| `/eco`       | `EcoPage`       | Authenticated |
| `/settings`  | `SettingsPage`  | Authenticated |

Unauthenticated users attempting to access protected routes are redirected to:

```text
/auth
```

Unknown routes are redirected to:

```text
/
```

---

## Available Scripts

| Command             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the Vite development server.                   |
| `npm run build`     | Type-check and build the application for production. |
| `npm run preview`   | Preview the production build locally.                |
| `npm run lint`      | Run ESLint.                                          |
| `npm run lint:fix`  | Run ESLint and automatically fix supported issues.   |
| `npm run typecheck` | Run the TypeScript compiler without emitting files.  |

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npm run typecheck
```

---

## Database Schema

DigiCon uses Supabase PostgreSQL tables.

### `profiles`

| Column         | Type   | Notes                                                   |
| -------------- | ------ | ------------------------------------------------------- |
| `id`           | `uuid` | Primary key; references `auth.users`.                   |
| `email`        | `text` | User email address.                                     |
| `full_name`    | `text` | User's full name.                                       |
| `company_name` | `text` | Company or organization name.                           |
| `language`     | `text` | Supported values include `en` and `fil`.                |
| `region`       | `text` | User's region.                                          |
| `role`         | `text` | Application role such as `owner`, `admin`, or `member`. |

### `business_cards`

| Column            | Type      | Notes                         |
| ----------------- | --------- | ----------------------------- |
| `id`              | `uuid`    | Primary key.                  |
| `user_id`         | `uuid`    | Foreign key to `profiles`.    |
| `full_name`       | `text`    | Card owner's name.            |
| `job_title`       | `text`    | Professional title.           |
| `company`         | `text`    | Company name.                 |
| `email`           | `text`    | Business email.               |
| `phone`           | `text`    | Business telephone number.    |
| `website`         | `text`    | Website URL.                  |
| `address`         | `text`    | Business address.             |
| `bio`             | `text`    | Short professional biography. |
| `photo_url`       | `text`    | Supabase Storage URL.         |
| `card_color`      | `text`    | Primary card color.           |
| `accent_color`    | `text`    | Accent color.                 |
| `design_template` | `text`    | Card design template.         |
| `font_family`     | `text`    | Card typography selection.    |
| `is_active`       | `boolean` | Whether the card is active.   |
| `share_count`     | `integer` | Number of recorded shares.    |

### `contacts`

| Column          | Type      | Notes                                                         |
| --------------- | --------- | ------------------------------------------------------------- |
| `id`            | `uuid`    | Primary key.                                                  |
| `user_id`       | `uuid`    | Foreign key to the owning user.                               |
| `full_name`     | `text`    | Contact name.                                                 |
| `email`         | `text`    | Contact email.                                                |
| `phone`         | `text`    | Contact phone number.                                         |
| `company`       | `text`    | Contact company.                                              |
| `job_title`     | `text`    | Contact job title.                                            |
| `notes`         | `text`    | Additional notes.                                             |
| `status`        | `text`    | `new`, `follow_up`, `converted`, or `archived`.               |
| `source`        | `text`    | `qr`, `link`, `sms`, or `manual`.                             |
| `consent_given` | `boolean` | Consent status for data processing.                           |
| `synced_to_crm` | `boolean` | Whether the contact has been synchronized to an external CRM. |

### `eco_stats`

| Column              | Type      | Notes                                    |
| ------------------- | --------- | ---------------------------------------- |
| `user_id`           | `uuid`    | Primary key / user reference.            |
| `cards_shared`      | `integer` | Number of cards shared.                  |
| `contacts_saved`    | `integer` | Number of contacts saved.                |
| `paper_saved_sqm`   | `float`   | Estimated paper saved in square meters.  |
| `trees_saved`       | `float`   | Estimated trees saved.                   |
| `carbon_reduced_kg` | `float`   | Estimated carbon reduction in kilograms. |

### Badges and User Badges

DigiCon also supports gamification through badge definitions and user-earned badge relationships.

Typical responsibilities include:

* Defining available sustainability badges
* Recording earned badges
* Associating badges with users
* Displaying progress and achievements

The exact columns should be kept synchronized with the actual Supabase schema.

---

## Wallet Integration

DigiCon supports digital wallet functionality for business cards.

The application should distinguish between:

### vCard

A `.vcf` file can be generated client-side and imported into compatible contacts applications.

### Apple Wallet

Apple Wallet passes require a properly signed `.pkpass` package.

A plain JSON file renamed to `.pkpass` or a `.pkpass.json` file is **not** a valid Apple Wallet pass.

Production Apple Wallet generation should therefore be performed by a trusted server-side service or Supabase Edge Function capable of:

1. Building the pass payload.
2. Including the required pass assets.
3. Signing the pass with the appropriate Apple-issued certificate.
4. Returning the generated `.pkpass` file to the client.

### Google Wallet

Google Wallet passes should similarly be generated using Google's Wallet API and appropriate server-side credentials.

Private Google service-account credentials must never be included in the browser bundle.

Wallet-related client functionality should use the application's wallet service rather than exposing signing credentials or private keys.

---

## Security

DigiCon follows several security practices.

### Environment-Based Configuration

Credentials and environment-specific configuration are loaded through environment variables.

Never commit `.env` files or server-side secrets.

### Supabase Row Level Security

Supabase Row Level Security should be enabled for application tables containing user-specific information.

Policies should ensure that users can only access data they are authorized to access.

### Authentication

Protected routes use the application's authentication provider and redirect unauthenticated users to `/auth`.

### Input Validation

Forms should use appropriate validation for:

* Required fields
* Email addresses
* URLs
* File uploads
* Maximum text lengths
* User-generated content

### File Upload Security

Uploaded profile images should be validated for:

* File type
* File size
* Acceptable image formats

Server-side validation should also be applied where appropriate.

### Wallet Credentials

Apple Wallet signing certificates and Google Wallet service-account credentials must remain server-side.

They must never be stored in:

```text
src/
public/
index.html
```

or any other client-accessible location.

### Security Headers

Vercel deployment configuration may include security headers such as:

* `X-Content-Type-Options`
* `X-Frame-Options`
* `Referrer-Policy`
* Strict Transport Security

These should be reviewed before production deployment to ensure they are compatible with all required DigiCon services.

---

## Deployment

## Vercel (Recommended)

DigiCon is designed to be deployed on Vercel.

### 1. Push the repository to GitHub

```bash
git add .
git commit -m "Prepare DigiCon for production"
git push origin main
```

### 2. Import the repository into Vercel

Connect the GitHub repository to your Vercel project.

### 3. Configure environment variables

Add the required production environment variables in the Vercel project settings.

At minimum:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Add optional variables when their corresponding services are configured:

```text
VITE_SENTRY_DSN
VITE_GA_MEASUREMENT_ID
VITE_APP_ENV
```

### 4. Build

The standard Vite production build is:

```bash
npm run build
```

The generated production files are normally placed in:

```text
dist/
```

### 5. SPA Routing

Because DigiCon uses React Router, Vercel must rewrite application routes to the root application entry point.

The project includes:

```text
vercel.json
```

for SPA routing configuration.

Static assets such as JavaScript, CSS, images, fonts, manifests, and favicons should not be rewritten to the SPA entry point.

---

## Manual Build

Build the production application:

```bash
npm run build
```

The resulting production files are generated in:

```text
dist/
```

You can preview the generated application locally:

```bash
npm run preview
```

For deployment to another static hosting provider, deploy the contents of `dist/` according to that provider's Vite/SPA deployment requirements.

---

## Production Checklist

Before deploying DigiCon to production, verify:

* [ ] `npm install` completes successfully.
* [ ] `npm run typecheck` passes.
* [ ] `npm run lint` passes.
* [ ] `npm run build` succeeds.
* [ ] Supabase production environment variables are configured.
* [ ] Supabase Row Level Security policies are enabled and tested.
* [ ] Authentication redirects work correctly.
* [ ] Public digital cards work at `/c/:cardId`.
* [ ] Protected routes redirect unauthenticated users to `/auth`.
* [ ] QR codes resolve correctly.
* [ ] Profile image uploads work correctly.
* [ ] Contact creation and management work correctly.
* [ ] Analytics load without errors.
* [ ] Eco statistics are calculated correctly.
* [ ] vCard downloads work.
* [ ] Apple Wallet generation is connected to a real pass-generation service.
* [ ] Google Wallet generation is connected to a real Wallet API integration.
* [ ] No wallet signing credentials are exposed client-side.
* [ ] PWA manifest loads correctly.
* [ ] Favicon and Apple touch icon load correctly.
* [ ] Open Graph metadata is correct.
* [ ] Canonical URL is correct.
* [ ] Google Analytics configuration is correct.
* [ ] Security headers are reviewed.
* [ ] Vercel SPA rewrites are tested.
* [ ] Mobile responsiveness is tested.
* [ ] Production domain and HTTPS are working.

---

## Contributing

Contributions are welcome.

### 1. Fork the repository

Create your own fork of the DigiCon repository.

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make your changes

Keep changes focused and consistent with the existing architecture.

### 4. Run validation

Before submitting a pull request:

```bash
npm run typecheck
npm run lint
npm run build
```

### 5. Commit your changes

Use a clear commit message:

```bash
git add .
git commit -m "Add your feature description"
```

### 6. Push your branch

```bash
git push origin feature/your-feature-name
```

### 7. Open a Pull Request

Provide:

* A clear description of the change
* The reason for the change
* Testing performed
* Screenshots where applicable
* Any migration or configuration requirements

---

## Code Standards

DigiCon follows these development principles:

* TypeScript strict mode should remain enabled.
* Use functional React components.
* Prefer React hooks for component state and lifecycle behavior.
* Follow ESLint and React Hooks rules.
* Use the existing `@/` path aliases where configured.
* Reuse existing UI components where possible.
* Keep user-facing text compatible with the existing localization system.
* Avoid hardcoded credentials or secrets.
* Validate user input.
* Handle asynchronous operations and errors explicitly.
* Keep components focused and maintainable.
* Avoid unnecessary duplication.
* Keep production and development configuration clearly separated.

### Imports

Use consistent absolute imports where the project's TypeScript configuration supports them:

```tsx
import AppLayout from '@/components/AppLayout';
import { AuthProvider } from '@/lib/auth';
import { DashboardPage } from '@/pages/DashboardPage';
```

Use relative imports when they are more appropriate within a local component hierarchy.

---

## License

Copyright 2026 ASilva Innovations.

Licensed under the Apache License, Version 2.0.

You may obtain a copy of the license at:

[https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

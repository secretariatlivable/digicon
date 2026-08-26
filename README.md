# DigiCon

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3ECF8E?logo=supabase)](https://supabase.com)

&gt; The all-in-one digital business card and CRM platform built for Philippine SMEs and startups.

DigiCon replaces paper business cards with beautiful, shareable digital cards while capturing leads into a lightweight CRM. Track your environmental impact in real-time and earn eco-badges as you grow your network.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| **Smart Digital Cards** | Create branded digital business cards with QR codes, NFC, SMS, and link sharing |
| **CRM Automation** | Auto-capture leads, manage contacts, export to CSV, and sync to HubSpot |
| **Analytics Dashboard** | Track leads over time, conversion funnels, networking ROI, and eco impact |
| **Eco Gamification** | Real-time paper saved, trees saved, and carbon reduced tracking with badges |
| **Multi-language** | Full English and Filipino (Tagalog) localization |
| **Glassmorphism UI** | Apple-inspired liquid glass design system with accessibility support |
| **Wallet Integration** | Download cards as vCard, Apple Wallet pass, or Google Wallet pass |
| **Team Collaboration** | Multi-seat access for Growth and Enterprise plans |

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Custom CSS Design System
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Charts:** Recharts
- **QR Codes:** qrcode.react
- **Icons:** Lucide React
- **Deployment:** Vercel (SPA configuration included)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) &gt;= 18.0.0
- [npm](https://www.npmjs.com) &gt;= 9.0.0
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/secretariatlivable/digicon.git
cd digicon

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in your Supabase credentials

# 4. Start the development server
npm run dev
The app will be available at http://localhost:5173.


## Environment Variables

Table
Variable	Required	Description
VITE_SUPABASE_URL	Yes	Your Supabase project URL
VITE_SUPABASE_ANON_KEY	Yes	Your Supabase anon/public key
VITE_SENTRY_DSN	No	Sentry DSN for error tracking
VITE_GA_MEASUREMENT_ID	No	Google Analytics 4 Measurement ID
VITE_APP_ENV	No	development (default), staging, or production
Security Note: Only variables prefixed with VITE_ are exposed to the client bundle. Never commit your .env file. The VITE_SUPABASE_ANON_KEY is safe for client-side use but should still be kept out of version control.

## Project Structure
plain
digicon/
├── public/                 # Static assets (images, favicon, manifest)
├── src/
│   ├── components/
│   │   ├── brand/          # Logo components
│   │   ├── layout/         # AppLayout, LandingNav
│   │   ├── theme-provider.tsx   # Global theme context
│   │   └── ui/             # Glass design system components
│   ├── lib/
│   │   ├── auth.tsx        # Authentication context
│   │   ├── i18n.ts         # Translation system (EN + FIL)
│   │   └── supabase.ts     # Supabase client + DB types
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
│   ├── App.tsx             # Root component + routing
│   ├── main.tsx            # Entry point with error boundary
│   └── index.css           # Global styles + design tokens
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vercel.json             # Vercel deployment config
└── vite.config.ts

##Available Scripts

Table
Script	Description
npm run dev	Start development server
npm run build	Type-check and build for production
npm run preview	Preview production build locally
npm run lint	Run ESLint
npm run lint:fix	Run ESLint with auto-fix
npm run typecheck	Run TypeScript compiler without emitting
Database Schema
DigiCon uses the following Supabase tables:
profiles
Table
Column	Type	Notes
id	uuid	PK, references auth.users
email	text	
full_name	text	
company_name	text	
language	text	en or fil
region	text	
role	text	owner, admin, member
business_cards
Table
Column	Type	Notes
id	uuid	PK
user_id	uuid	FK to profiles
full_name	text	
job_title	text	
company	text	
email, phone, website, address, bio	text	
photo_url	text	Supabase Storage URL
card_color, accent_color	text	Hex colors
design_template	text	futuristic, professional, simple, custom
font_family	text	
is_active	boolean	
share_count	int	
contacts
Table
Column	Type	Notes
id	uuid	PK
user_id	uuid	FK
full_name, email, phone, company, job_title, notes	text	
status	text	new, follow_up, converted, archived
source	text	qr, link, sms, manual
consent_given	boolean	GDPR / Data Privacy Act
synced_to_crm	boolean	
eco_stats
Table
Column	Type	Notes
user_id	uuid	PK
cards_shared	int	
contacts_saved	int	
paper_saved_sqm	float	
trees_saved	float	
carbon_reduced_kg	float	
badges & user_badges
Gamification badge definitions and user-earned badge linking.
Security
DigiCon implements several security best practices:
Environment-based secrets: No hardcoded API keys. All credentials are loaded from .env.
Row Level Security (RLS): Supabase tables use RLS policies to ensure users only access their own data.
Content Security: vercel.json includes security headers (X-Frame-Options, X-Content-Type-Options, HSTS).
Input Validation: Form inputs use native HTML5 validation + minimum length requirements.
Consent Management: Contact capture requires explicit consent for GDPR/Data Privacy Act compliance.
Rotating Leaked Secrets
If you accidentally commit a secret:
Rotate the secret immediately at the provider dashboard.
Purge from history using BFG Repo-Cleaner or git-filter-repo.
Force-push the cleaned history: git push --force-with-lease.
Notify your team to update their local clones.
Deployment
Vercel (Recommended)
Push to GitHub.
Import into Vercel.
Add environment variables in Project Settings.
Deploy — vercel.json is pre-configured for SPA routing and caching.
Manual Build
bash
npm run build
# Deploy the `dist/` folder to any static host
Contributing
We welcome contributions! Please follow these guidelines:
Fork the repository.
Create a branch: git checkout -b feature/your-feature-name.
Commit with clear messages.
Open a Pull Request with a detailed description.
Code Standards
TypeScript strict mode enabled.
ESLint + React Hooks rules enforced.
Prefer functional components with hooks.
Use the Glass UI components from @/components/ui/Glass.
Follow existing i18n patterns for all user-facing text.
License
plain
Copyright 2026 Secretariat Livable

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
DigiCon is licensed under the Apache License 2.0. See LICENSE for the full text.
Acknowledgments
Built for Philippine SMEs and startups.
Eco impact calculations based on EPA paper waste statistics.
Design inspired by Apple's Liquid Glass and iOS design language.
<p align="center">
  <sub>Made with 💚 for the Philippines · © 2026 ASilva Innovations</sub>
</p>

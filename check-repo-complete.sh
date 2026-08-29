#!/usr/bin/env bash
# Run this INSIDE your digicon repo. Reports any required file git isn't tracking.
set -uo pipefail
missing=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if ! git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    echo "  UNTRACKED  $f"
    missing=$((missing+1))
  fi
done <<'FILES'
docs/stripe-setup.md
index.html
package.json
public/Background.png
public/Cover_2.png
public/DigiCon.png
public/DigiCon_Banner.png
public/DigiCon_banner.svg
public/DigiCon_logo_transparent.jpg
public/Digicon_logo.jpg
public/apple-touch-icon.png
public/favicon.ico
public/favicon.svg
public/icon-192.png
public/icon-512.png
public/icon-maskable-192.png
public/icon-maskable-512.png
public/manifest.json
public/media/banners/bigidea-1200.jpg
public/media/banners/bigidea-2400.jpg
public/media/banners/capture-1200.jpg
public/media/banners/capture-2400.jpg
public/media/banners/connect-1200.jpg
public/media/banners/connect-2400.jpg
public/media/banners/create-1200.jpg
public/media/banners/create-2400.jpg
public/media/banners/cta-1200.jpg
public/media/banners/cta-2400.jpg
public/media/banners/followup-1200.jpg
public/media/banners/followup-2400.jpg
public/media/banners/graph-1200.jpg
public/media/banners/graph-2400.jpg
public/media/banners/hero-1200.jpg
public/media/banners/hero-2400.jpg
public/media/banners/manage-1200.jpg
public/media/banners/manage-2400.jpg
public/media/banners/organizations-1200.jpg
public/media/banners/organizations-2400.jpg
public/media/banners/platform-1200.jpg
public/media/banners/platform-2400.jpg
public/media/banners/privacy-1200.jpg
public/media/banners/privacy-2400.jpg
public/media/banners/problem-1200.jpg
public/media/banners/problem-2400.jpg
public/media/banners/professionals-1200.jpg
public/media/banners/professionals-2400.jpg
public/media/banners/share-1200.jpg
public/media/banners/share-2400.jpg
public/media/banners/simplicity-1200.jpg
public/media/banners/simplicity-2400.jpg
public/media/banners/teams-1200.jpg
public/media/banners/teams-2400.jpg
public/media/hero-loop-poster.jpg
public/media/hero-loop.mp4
public/media/hero-loop.webm
public/media/og-image.jpg
public/networking.png
public/sw.js
scripts/preflight.mjs
src/App.tsx
src/components/DigiConPayPalProvider.tsx
src/components/PayPalSubscriptionButton.tsx
src/components/StripeCheckoutButton.tsx
src/components/UpgradeRequiredDialog.tsx
src/components/a11y/AccessibilityTools.tsx
src/components/brand/DigiConLogo.tsx
src/components/layout/AppLayout.tsx
src/components/layout/LandingNav.tsx
src/components/layout/MobileAppNav.tsx
src/components/layout/SiteFooter.tsx
src/components/pwa/InstallBar.tsx
src/components/theme-provider.tsx
src/components/ui/AmbientVideo.tsx
src/components/ui/Collapsible.tsx
src/components/ui/ConnectionGraph.tsx
src/components/ui/FlowStrip.tsx
src/components/ui/GlassCard.tsx
src/components/ui/Reveal.tsx
src/components/ui/Section.tsx
src/components/ui/SectionBanner.tsx
src/components/ui/Tiles.tsx
src/components/ui/Tooltip.tsx
src/config/paypalPlans.ts
src/config/stripePlans.ts
src/content/landing.ts
src/index.css
src/lib/a11y.tsx
src/lib/auth.tsx
src/lib/entitlements.ts
src/lib/i18n.ts
src/lib/motion.ts
src/lib/pwa.ts
src/lib/supabase.ts
src/lib/wallet.ts
src/main.tsx
src/pages/AnalyticsPage.tsx
src/pages/AuthPage.tsx
src/pages/CardsPage.tsx
src/pages/ContactsPage.tsx
src/pages/DashboardPage.tsx
src/pages/EcoPage.tsx
src/pages/LandingPage.tsx
src/pages/PublicCardPage.tsx
src/pages/SettingsPage.tsx
src/vite-env.d.ts
supabase/functions/apple-wallet-pass/index.ts
supabase/functions/google-wallet-pass/index.ts
supabase/functions/paypal-create-subscription/index.ts
supabase/functions/paypal-webhook/index.ts
supabase/functions/stripe-create-checkout-session/index.ts
supabase/functions/stripe-webhook/index.ts
tailwind.config.js
tools/gen_banners.py
tools/gen_brand.py
tsconfig.app.json
FILES
if [ "$missing" -eq 0 ]; then
  echo "✓ all required files are tracked by git"
else
  echo
  echo "$missing file(s) missing from the repo. Fix with:"
  echo "    git add -A src public scripts docs supabase tools"
  echo "    git commit -m 'Add missing UI, PWA and Stripe files'"
  echo "    git push"
  exit 1
fi

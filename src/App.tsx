// Import the route primitives used by the DigiCon single-page application.
import { Routes, Route } from "react-router-dom";
// Import the global notification component.
import { Toaster } from "@/components/ui/sonner";
// Import the progressive web application installation prompt.
import InstallPrompt from "@/pwa/InstallPrompt";
// Import the protected and public layout primitives.
import { Protected } from "@/components/layout/Layouts";
// Import the global accessibility and privacy interfaces.
import AccessibilityBar from "@/a11y/AccessibilityBar";
import CookieConsent from "@/a11y/CookieConsent";
// Import all public and authenticated DigiCon pages.
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import MyCards from "@/pages/MyCards";
import CardBuilder from "@/pages/CardBuilder";
import Share from "@/pages/Share";
import PublicCard from "@/pages/PublicCard";
import Contacts from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import FollowUps from "@/pages/FollowUps";
import Crm from "@/pages/Crm";
import Analytics from "@/pages/Analytics";
import WalletExport from "@/pages/WalletExport";
import LandingPwa from "@/pages/LandingPwa";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Pricing from "@/pages/Pricing";
import InfoPage from "@/pages/InfoPage";
import { Blog, BlogArticle } from "@/pages/Blog";
import {
  Billing,
  Checkout,
  PaymentCancel,
  PaymentSuccess,
} from "@/pages/Billing";

// Define every public informational route served by the shared information page.
const INFO_PATHS = [
  "/about",
  "/faq",
  "/use-cases",
  "/resources",
  "/support",
  "/terms",
  "/privacy",
  "/cookies",
  "/accessibility",
];

// Export the application route tree.
export default function App() {
  // Render the complete DigiCon application.
  return (
    <>
      {/* Render every route without duplicating global accessibility code. */}
      <Routes>
        {/* Render the public landing experience. */}
        <Route path="/" element={<Landing />} />
        {/* Render authentication routes. */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Render public commercial content. */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/c/:slug" element={<PublicCard />} />

        {/* Render shared public informational pages. */}
        {INFO_PATHS.map((path) => (
          <Route key={path} path={path} element={<InfoPage />} />
        ))}

        {/* Render the authenticated onboarding experience without the main shell. */}
        <Route
          path="/onboarding"
          element={<Protected bare><Onboarding /></Protected>}
        />
        {/* Render authenticated application pages through the protected shell. */}
        <Route
          path="/dashboard"
          element={<Protected><Dashboard /></Protected>}
        />
        <Route
          path="/cards"
          element={<Protected><MyCards /></Protected>}
        />
        <Route
          path="/cards/new"
          element={<Protected><CardBuilder /></Protected>}
        />
        <Route
          path="/cards/:cardId"
          element={<Protected><CardBuilder /></Protected>}
        />
        <Route
          path="/share"
          element={<Protected><Share /></Protected>}
        />
        <Route
          path="/contacts"
          element={<Protected><Contacts /></Protected>}
        />
        <Route
          path="/contacts/:relId"
          element={<Protected><ContactDetail /></Protected>}
        />
        <Route
          path="/followups"
          element={<Protected><FollowUps /></Protected>}
        />
        <Route
          path="/crm"
          element={<Protected><Crm /></Protected>}
        />
        <Route
          path="/analytics"
          element={<Protected><Analytics /></Protected>}
        />
        <Route
          path="/wallet"
          element={<Protected><WalletExport /></Protected>}
        />
        <Route
          path="/landing-pwa"
          element={<Protected><LandingPwa /></Protected>}
        />
        <Route
          path="/settings"
          element={<Protected><Settings /></Protected>}
        />
        <Route
          path="/billing"
          element={<Protected><Billing /></Protected>}
        />
        <Route
          path="/checkout"
          element={<Protected><Checkout /></Protected>}
        />
        <Route
          path="/payment/success"
          element={<Protected><PaymentSuccess /></Protected>}
        />
        <Route
          path="/payment/cancel"
          element={<Protected><PaymentCancel /></Protected>}
        />

        {/* Render super-administrator functionality only for authorized users. */}
        <Route
          path="/admin"
          element={<Protected adminOnly><Admin /></Protected>}
        />

        {/* Send unknown routes to the public landing page. */}
        <Route path="*" element={<Landing />} />
      </Routes>

      {/* Render global application notifications. */}
      <Toaster position="top-center" richColors />

      {/* Render the existing progressive web application installation prompt. */}
      <InstallPrompt />

      {/* Render the privacy-choice interface globally on public and protected pages. */}
      <CookieConsent />

      {/* Render accessibility controls globally on public and protected pages. */}
      <AccessibilityBar />
    </>
  );
}
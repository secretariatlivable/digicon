import { useEffect, useState } from "react";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "digicon-cookie-consent";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-md sm:left-auto sm:right-6 sm:bottom-6"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="cookie-consent"
    >
      <div className="rounded-2xl border border-border/60 bg-[#050b1c]/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">We value your privacy</h3>
            <p className="dense text-sm text-muted-foreground">
              DigiCon uses essential cookies to keep you signed in and secure. We do not track you across other sites.
            </p>
          </div>
          <button
            type="button"
            onClick={declineCookies}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            aria-label="Dismiss cookie notice"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={acceptCookies}
            className="dense inline-flex h-10 items-center justify-center rounded-lg bg-sky px-4 text-sm font-semibold text-white hover:bg-sky/90"
          >
            Accept & Continue
          </button>
          <button
            type="button"
            onClick={declineCookies}
            className="dense inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-secondary/30 px-4 text-sm font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
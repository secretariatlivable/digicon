import { useEffect, useState } from "react";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "digicon-cookie-consent";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
<<<<<<< HEAD
=======
      // Show after a short delay so it doesn't flash immediately
>>>>>>> da54b2619b70e470b9504727e59a54d4eb34e98c
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
<<<<<<< HEAD
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-md sm:left-auto sm:right-6 sm:bottom-6"
=======
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 sm:left-auto sm:right-6 sm:bottom-6"
>>>>>>> da54b2619b70e470b9504727e59a54d4eb34e98c
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
<<<<<<< HEAD
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
=======
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>>>>>>> da54b2619b70e470b9504727e59a54d4eb34e98c
            aria-label="Dismiss cookie notice"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={acceptCookies}
<<<<<<< HEAD
            className="dense inline-flex h-10 items-center justify-center rounded-lg bg-sky px-4 text-sm font-semibold text-white hover:bg-sky/90"
=======
            className="dense inline-flex h-10 items-center justify-center rounded-lg bg-sky px-4 text-sm font-semibold text-white transition-colors hover:bg-sky/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>>>>>>> da54b2619b70e470b9504727e59a54d4eb34e98c
          >
            Accept & Continue
          </button>
          <button
            type="button"
            onClick={declineCookies}
<<<<<<< HEAD
            className="dense inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-secondary/30 px-4 text-sm font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
=======
            className="dense inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-secondary/30 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>>>>>>> da54b2619b70e470b9504727e59a54d4eb34e98c
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
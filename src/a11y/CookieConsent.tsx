import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_STORAGE_KEY = "digicon-cookie-consent";

type CookieConsentValue = "accepted" | "declined";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(
      COOKIE_CONSENT_STORAGE_KEY,
    ) as CookieConsentValue | null;

    if (!storedConsent) {
      setVisible(true);
    }
  }, []);

  const saveConsent = (value: CookieConsentValue) => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 sm:bottom-6 sm:left-auto sm:right-6"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
      data-testid="cookie-consent"
    >
      <div className="glass rounded-2xl border border-border/70 p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 rounded-lg bg-sky/10 p-2 text-sky">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-heading text-base font-bold text-foreground">
                Cookies & privacy
              </h2>

              <button
                type="button"
                onClick={() => saveConsent("declined")}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close cookie notice"
                title="Close"
                data-testid="cookie-consent-close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p
              id="cookie-consent-description"
              className="dense mt-2 text-sm leading-6 text-muted-foreground"
            >
              DigiCon uses essential local storage and cookies to keep the
              application secure, remember your preferences, and improve your
              experience. Read our{" "}
              <Link
                to="/cookies"
                className="text-sky underline underline-offset-2 hover:text-sky/80"
              >
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-sky underline underline-offset-2 hover:text-sky/80"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveConsent("accepted")}
                className="dense inline-flex h-10 items-center justify-center rounded-lg bg-sky px-4 text-sm font-semibold text-white transition-colors hover:bg-sky/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="cookie-consent-accept"
              >
                Accept
              </button>

              <button
                type="button"
                onClick={() => saveConsent("declined")}
                className="dense inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-secondary/30 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="cookie-consent-decline"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

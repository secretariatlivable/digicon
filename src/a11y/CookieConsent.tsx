// Import the React state hook used to manage the accessibility panel state.
import { useEffect, useState } from "react";
// Import navigation links used to connect accessibility controls with legal policies.
import { Link } from "react-router-dom";
// Import icons used by the accessibility controls.
import {
  Accessibility,
  Contrast,
  Cookie,
  Eye,
  EyeOff,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Type,
  Underline,
  X,
} from "lucide-react";
// Import the shared class-name utility used throughout DigiCon.
import { cn } from "@/lib/utils";

// Define the local-storage key used to persist accessibility preferences.
const ACCESSIBILITY_STORAGE_KEY = "digicon-accessibility-preferences";

// Define the available text-size levels.
type TextSizeLevel = "normal" | "large" | "larger";

// Define the persisted accessibility preference model.
type AccessibilityPreferences = {
  textSize: TextSizeLevel;
  highContrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
};

// Define the default accessibility preferences.
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  textSize: "normal",
  highContrast: false,
  grayscale: false,
  underlineLinks: false,
  reduceMotion: false,
};

// Export the accessibility bar used globally by the application.
export default function AccessibilityBar() {
  // Store whether the expanded accessibility controls are visible.
  const [isExpanded, setIsExpanded] = useState(false);
  // Store the user's current accessibility preferences.
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  // Load saved accessibility preferences after the component mounts.
  useEffect(() => {
    // Read the persisted accessibility preferences from browser storage.
    const storedPreferences = window.localStorage.getItem(
      ACCESSIBILITY_STORAGE_KEY,
    );
    // Stop when no saved preferences exist.
    if (!storedPreferences) return;
    // Parse the saved preferences defensively.
    try {
      // Merge saved values with defaults so future settings remain backwards compatible.
      const parsedPreferences = JSON.parse(
        storedPreferences,
      ) as Partial<AccessibilityPreferences>;
      // Update the current preference state.
      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...parsedPreferences,
      });
    } catch {
      // Remove malformed preference data rather than breaking the application.
      window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    }
  }, []);

  // Apply accessibility preferences whenever they change.
  useEffect(() => {
    // Get the document root element.
    const rootElement = document.documentElement;
    // Apply the selected text-size class.
    rootElement.dataset.accessibilityTextSize = preferences.textSize;
    // Apply the high-contrast state.
    rootElement.dataset.accessibilityHighContrast = String(
      preferences.highContrast,
    );
    // Apply the grayscale state.
    rootElement.dataset.accessibilityGrayscale = String(preferences.grayscale);
    // Apply the link-underlining state.
    rootElement.dataset.accessibilityUnderlineLinks = String(
      preferences.underlineLinks,
    );
    // Apply the reduced-motion state.
    rootElement.dataset.accessibilityReduceMotion = String(
      preferences.reduceMotion,
    );
    // Persist the complete preference set.
    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  }, [preferences]);

  // Update one accessibility preference without replacing unrelated preferences.
  const updatePreference = <Key extends keyof AccessibilityPreferences>(
    preferenceName: Key,
    preferenceValue: AccessibilityPreferences[Key],
  ) => {
    // Merge the requested value into the existing preference object.
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [preferenceName]: preferenceValue,
    }));
  };

  // Cycle through the available text-size levels.
  const cycleTextSize = (direction: "increase" | "decrease") => {
    // Define the ordered text-size levels.
    const levels: TextSizeLevel[] = ["normal", "large", "larger"];
    // Find the current text-size position.
    const currentIndex = levels.indexOf(preferences.textSize);
    // Calculate the requested next position.
    const nextIndex =
      direction === "increase"
        ? Math.min(currentIndex + 1, levels.length - 1)
        : Math.max(currentIndex - 1, 0);
    // Apply the new text-size level.
    updatePreference("textSize", levels[nextIndex]);
  };

  // Restore every accessibility setting to its default value.
  const resetPreferences = () => {
    // Reset the React state.
    setPreferences(DEFAULT_PREFERENCES);
    // Remove the persisted accessibility preferences.
    window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
  };

  // Render the persistent accessibility interface.
  return (
    <>
      {/* Render the compact accessibility bar at the bottom of every page. */}
      <aside
        className="fixed inset-x-0 bottom-0 z-[70] border-t border-border/80 bg-[#050b1c]/95 shadow-[0_-18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        aria-label="Accessibility tools"
        data-testid="accessibility-bar"
      >
        {/* Keep the accessibility content aligned with the application's maximum width. */}
        <div className="mx-auto max-w-7xl px-3 py-2">
          {/* Render the compact controls row. */}
          <div className="flex min-h-10 items-center justify-between gap-2">
            {/* Render the accessibility identity and expandable-controls button. */}
            <button
              type="button"
              onClick={() => setIsExpanded((currentValue) => !currentValue)}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={isExpanded}
              aria-controls="digicon-accessibility-panel"
              data-testid="accessibility-toggle"
            >
              {/* Render the accessibility icon. */}
              <Accessibility className="h-5 w-5 text-sky" aria-hidden="true" />
              {/* Render the visible accessibility label. */}
              <span className="dense hidden sm:inline">Accessibility</span>
              {/* Render the settings icon. */}
              <Settings2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </button>

            {/* Render the most important quick controls. */}
            <div className="flex items-center gap-1">
              {/* Render the decrease-text button. */}
              <button
                type="button"
                onClick={() => cycleTextSize("decrease")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Decrease text size"
                title="Decrease text size"
                data-testid="accessibility-text-decrease"
              >
                {/* Render the minus icon. */}
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Render the text-size indicator. */}
              <span
                className="dense hidden min-w-12 text-center text-xs text-muted-foreground md:inline"
                aria-live="polite"
              >
                {/* Display the current text-size setting. */}
                {preferences.textSize === "normal"
                  ? "100%"
                  : preferences.textSize === "large"
                    ? "115%"
                    : "130%"}
              </span>

              {/* Render the increase-text button. */}
              <button
                type="button"
                onClick={() => cycleTextSize("increase")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Increase text size"
                title="Increase text size"
                data-testid="accessibility-text-increase"
              >
                {/* Render the plus icon. */}
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Render the legal-policy shortcuts. */}
            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Accessibility and privacy policies"
            >
              {/* Link directly to the accessibility statement. */}
              <Link
                to="/accessibility"
                className="dense rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="accessibility-policy-link"
              >
                Accessibility
              </Link>
              {/* Link directly to the privacy policy. */}
              <Link
                to="/privacy"
                className="dense rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="privacy-policy-link"
              >
                Privacy
              </Link>
              {/* Link directly to the cookie policy. */}
              <Link
                to="/cookies"
                className="dense rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="cookie-policy-link"
              >
                Cookies
              </Link>
            </nav>
          </div>

          {/* Render the complete accessibility settings panel when requested. */}
          {isExpanded && (
            <div
              id="digicon-accessibility-panel"
              className="border-t border-border/60 py-3"
              data-testid="accessibility-panel"
            >
              {/* Render the accessibility control grid. */}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {/* Render the high-contrast control. */}
                <button
                  type="button"
                  onClick={() =>
                    updatePreference(
                      "highContrast",
                      !preferences.highContrast,
                    )
                  }
                  aria-pressed={preferences.highContrast}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    preferences.highContrast
                      ? "border-sky/60 bg-sky/10 text-sky"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground",
                  )}
                  data-testid="accessibility-high-contrast"
                >
                  {/* Render the contrast icon. */}
                  <Contrast className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {/* Describe the setting. */}
                  <span className="dense">High contrast</span>
                </button>

                {/* Render the grayscale control. */}
                <button
                  type="button"
                  onClick={() =>
                    updatePreference("grayscale", !preferences.grayscale)
                  }
                  aria-pressed={preferences.grayscale}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    preferences.grayscale
                      ? "border-sky/60 bg-sky/10 text-sky"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground",
                  )}
                  data-testid="accessibility-grayscale"
                >
                  {/* Render the visual icon. */}
                  <EyeOff className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {/* Describe the setting. */}
                  <span className="dense">Grayscale</span>
                </button>

                {/* Render the link-underlining control. */}
                <button
                  type="button"
                  onClick={() =>
                    updatePreference(
                      "underlineLinks",
                      !preferences.underlineLinks,
                    )
                  }
                  aria-pressed={preferences.underlineLinks}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    preferences.underlineLinks
                      ? "border-sky/60 bg-sky/10 text-sky"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground",
                  )}
                  data-testid="accessibility-underline-links"
                >
                  {/* Render the underline icon. */}
                  <Underline className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {/* Describe the setting. */}
                  <span className="dense">Underline links</span>
                </button>

                {/* Render the reduced-motion control. */}
                <button
                  type="button"
                  onClick={() =>
                    updatePreference(
                      "reduceMotion",
                      !preferences.reduceMotion,
                    )
                  }
                  aria-pressed={preferences.reduceMotion}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    preferences.reduceMotion
                      ? "border-sky/60 bg-sky/10 text-sky"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground",
                  )}
                  data-testid="accessibility-reduce-motion"
                >
                  {/* Render the motion icon. */}
                  <Eye className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {/* Describe the setting. */}
                  <span className="dense">Reduce motion</span>
                </button>

                {/* Render the reset control. */}
                <button
                  type="button"
                  onClick={resetPreferences}
                  className="flex min-h-12 items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 px-3 text-left text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="accessibility-reset"
                >
                  {/* Render the reset icon. */}
                  <RotateCcw className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {/* Describe the reset action. */}
                  <span className="dense">Reset settings</span>
                </button>
              </div>

              {/* Render a secondary legal navigation row. */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {/* Explain the purpose of the controls. */}
                <p className="dense text-xs text-muted-foreground">
                  Accessibility preferences are stored locally on this device and are not sent to DigiCon.
                </p>
                {/* Render mobile legal-policy links. */}
                <nav
                  className="flex flex-wrap gap-x-3 gap-y-1"
                  aria-label="Legal policies"
                >
                  {/* Link to the privacy policy. */}
                  <Link
                    to="/privacy"
                    className="dense inline-flex min-h-8 items-center text-xs text-sky underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Privacy Policy
                  </Link>
                  {/* Link to the cookie policy. */}
                  <Link
                    to="/cookies"
                    className="dense inline-flex min-h-8 items-center text-xs text-sky underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Cookie Policy
                  </Link>
                  {/* Link to the accessibility statement. */}
                  <Link
                    to="/accessibility"
                    className="dense inline-flex min-h-8 items-center text-xs text-sky underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Accessibility Statement
                  </Link>
                </nav>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

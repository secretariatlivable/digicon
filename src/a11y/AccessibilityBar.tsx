import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Underline,
  Sliders,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCESSIBILITY_STORAGE_KEY = "digicon-accessibility-preferences";

type TextSizeLevel = "normal" | "large" | "larger";

type AccessibilityPreferences = {
  textSize: TextSizeLevel;
  highContrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
};

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  textSize: "normal",
  highContrast: false,
  grayscale: false,
  underlineLinks: false,
  reduceMotion: false,
};

export default function AccessibilityBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const storedPreferences = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!storedPreferences) return;
    try {
      const parsedPreferences = JSON.parse(storedPreferences) as Partial<AccessibilityPreferences>;
      setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPreferences });
    } catch {
      window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.dataset.accessibilityTextSize = preferences.textSize;
    rootElement.dataset.accessibilityHighContrast = String(preferences.highContrast);
    rootElement.dataset.accessibilityGrayscale = String(preferences.grayscale);
    rootElement.dataset.accessibilityUnderlineLinks = String(preferences.underlineLinks);
    rootElement.dataset.accessibilityReduceMotion = String(preferences.reduceMotion);
    window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <Key extends keyof AccessibilityPreferences>(
    preferenceName: Key,
    preferenceValue: AccessibilityPreferences[Key],
  ) => {
    setPreferences((current) => ({ ...current, [preferenceName]: preferenceValue }));
  };

  const cycleTextSize = (direction: "increase" | "decrease") => {
    const levels: TextSizeLevel[] = ["normal", "large", "larger"];
    const currentIndex = levels.indexOf(preferences.textSize);
    const nextIndex =
      direction === "increase"
        ? Math.min(currentIndex + 1, levels.length - 1)
        : Math.max(currentIndex - 1, 0);
    updatePreference("textSize", levels[nextIndex]);
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    window.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
  };

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-border/80 bg-[#050b1c]/95 shadow-[0_-18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      aria-label="Accessibility tools"
      data-testid="accessibility-bar"
    >
      <div className="mx-auto max-w-7xl px-3 py-2">
        <div className="flex min-h-10 items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
            aria-expanded={isExpanded}
            data-testid="accessibility-toggle"
          >
            <Sliders className="h-5 w-5 text-sky" aria-hidden="true" />
            <span className="dense hidden sm:inline">Accessibility</span>
            <Settings2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => cycleTextSize("decrease")} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/70" aria-label="Decrease text size"><Minus className="h-4 w-4" /></button>
            <span className="dense hidden min-w-12 text-center text-xs text-muted-foreground md:inline">
              {preferences.textSize === "normal" ? "100%" : preferences.textSize === "large" ? "115%" : "130%"}
            </span>
            <button type="button" onClick={() => cycleTextSize("increase")} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/70" aria-label="Increase text size"><Plus className="h-4 w-4" /></button>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link to="/accessibility" className="dense rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/70">Accessibility</Link>
            <Link to="/privacy" className="dense rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/70">Privacy</Link>
            <Link to="/cookies" className="dense rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/70">Cookies</Link>
          </nav>
        </div>

        {isExpanded && (
          <div className="border-t border-border/60 py-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <button type="button" onClick={() => updatePreference("highContrast", !preferences.highContrast)} className={cn("flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm", preferences.highContrast ? "border-sky/60 bg-sky/10 text-sky" : "border-border/60 bg-secondary/30 text-muted-foreground")}>
                <Palette className="h-5 w-5 shrink-0" />
                <span className="dense">High contrast</span>
              </button>
              <button type="button" onClick={() => updatePreference("grayscale", !preferences.grayscale)} className={cn("flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm", preferences.grayscale ? "border-sky/60 bg-sky/10 text-sky" : "border-border/60 bg-secondary/30 text-muted-foreground")}>
                <EyeOff className="h-5 w-5 shrink-0" />
                <span className="dense">Grayscale</span>
              </button>
              <button type="button" onClick={() => updatePreference("underlineLinks", !preferences.underlineLinks)} className={cn("flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm", preferences.underlineLinks ? "border-sky/60 bg-sky/10 text-sky" : "border-border/60 bg-secondary/30 text-muted-foreground")}>
                <Underline className="h-5 w-5 shrink-0" />
                <span className="dense">Underline links</span>
              </button>
              <button type="button" onClick={() => updatePreference("reduceMotion", !preferences.reduceMotion)} className={cn("flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm", preferences.reduceMotion ? "border-sky/60 bg-sky/10 text-sky" : "border-border/60 bg-secondary/30 text-muted-foreground")}>
                <Eye className="h-5 w-5 shrink-0" />
                <span className="dense">Reduce motion</span>
              </button>
              <button type="button" onClick={resetPreferences} className="flex min-h-12 items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 px-3 text-left text-sm text-muted-foreground">
                <RotateCcw className="h-5 w-5 shrink-0" />
                <span className="dense">Reset settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Official DigiCon circular mark — the authoritative brand asset, never redrawn. */
export function DigiConMark({
  className,
  glow = false,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <img
      src="/icon-192.png"
      alt=""
      aria-hidden
      width={40}
      height={40}
      className={cn(
        "h-9 w-9 shrink-0 select-none",
        glow && "drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]",
        className,
      )}
      data-testid="digicon-mark"
    />
  );
}

export function DigiConLogo({
  to = "/",
  compact = false,
  size = "md",
  showText,
  className,
  markClassName,
}: {
  to?: string;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  markClassName?: string;
}) {
  const displayText = showText ?? !compact;
  const markSize =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : undefined;
  const textSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <Link
      to={to}
      aria-label="DigiCon home"
      className={cn(
        "flex items-center gap-2.5 rounded-lg transition-opacity duration-200 hover:opacity-85",
        className,
      )}
      data-testid="digicon-logo-link"
    >
      <DigiConMark className={cn(markSize, markClassName)} />
      {displayText && (
        <span className={cn("font-heading font-extrabold tracking-tight text-foreground", textSize)}>
          Digi<span className="text-sky">Con</span>
        </span>
      )}
    </Link>
  );
}

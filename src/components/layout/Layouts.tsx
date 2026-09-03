// Import the React node type used by layout component properties.
import type { ReactNode } from "react";
// Import the routing components used by the layouts.
import { Link, Navigate, NavLink, useLocation } from "react-router-dom";
// Import the icons used by navigation.
import {
  BookOpen,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  Tag,
  Users,
} from "lucide-react";
// Import the DigiCon brand mark.
import { DigiConLogo } from "@/components/brand/DigiConLogo";
// Import shared loading UI.
import { LoadingState } from "@/components/kit";
// Import shared button primitives.
import { Button, buttonVariants } from "@/components/ui/button";
// Import the mobile navigation sheet primitives.
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// Import the authentication session hook.
import { useAuth } from "@/lib/session";
// Import the shared class-name utility.
import { cn } from "@/lib/utils";
// Import the authenticated application shell.
import AppShell from "@/components/layout/AppShell";

// Define the primary public navigation links.
const PUBLIC_LINKS = [
  { to: "/pricing", label: "Pricing" },
  { to: "/use-cases", label: "Use Cases" },
  { to: "/blog", label: "Blog" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
];

// Define the legal and support navigation links.
const FOOTER_LINKS = [
  { to: "/support", label: "Support" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/accessibility", label: "Accessibility" },
];

// Define the mobile public navigation.
const PUBLIC_BOTTOM_NAV = [
  { to: "/", label: "Home", icon: Home, testId: "public-bottom-home" },
  { to: "/pricing", label: "Pricing", icon: Tag, testId: "public-bottom-pricing" },
  { to: "/use-cases", label: "Use Cases", icon: Users, testId: "public-bottom-use-cases" },
  { to: "/blog", label: "Blog", icon: BookOpen, testId: "public-bottom-blog" },
];

// Render the persistent public mobile navigation.
function PublicBottomNav() {
  // Retrieve the current authentication state.
  const { user } = useAuth();

  // Add either the workspace or sign-in action to the mobile navigation.
  const items = [
    ...PUBLIC_BOTTOM_NAV,
    user
      ? {
          to: "/dashboard",
          label: "Workspace",
          icon: LayoutDashboard,
          testId: "public-bottom-workspace",
        }
      : {
          to: "/login",
          label: "Sign in",
          icon: LogIn,
          testId: "public-bottom-signin",
        },
  ];

  // Render the five-item mobile navigation.
  return (
    <nav
      className="glass fixed inset-x-0 bottom-[4.5rem] z-40 grid grid-cols-5 gap-1 border-t border-border/70 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      aria-label="Primary navigation"
      data-testid="public-bottom-navigation"
    >
      {/* Render every public navigation item. */}
      {items.map(({ to, label, icon: Icon, testId }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          aria-label={label}
          data-testid={testId}
          className={({ isActive }) =>
            cn(
              "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg text-[0.68rem] transition-colors duration-200",
              isActive
                ? "bg-primary/15 text-sky"
                : "text-muted-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              {/* Render the navigation icon. */}
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive &&
                    "drop-shadow-[0_0_6px_rgba(56,189,248,0.55)]",
                )}
                aria-hidden
              />
              {/* Render the navigation label. */}
              <span className="dense font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// Render the shared public layout.
export function PublicLayout({ children }: { children: ReactNode }) {
  // Retrieve the authentication state.
  const { user } = useAuth();

  // Render the public application surface.
  return (
    <div className="min-h-screen pb-[4.5rem] md:pb-[3.75rem]">
      {/* Render the sticky public header. */}
      <header className="glass-soft sticky top-0 z-40 border-b border-border/60">
        {/* Keep header contents within the application width. */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Render the DigiCon brand logo. */}
          <DigiConLogo />

          {/* Render the desktop navigation. */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Site navigation"
          >
            {/* Render every primary public navigation link. */}
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="dense rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-secondary/60 hover:text-foreground"
                data-testid={`public-nav-${link.label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {/* Render the link label. */}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Render the account actions and mobile menu. */}
          <div className="flex items-center gap-2">
            {/* Render the dashboard or sign-in action. */}
            <Link
              to={user ? "/dashboard" : "/login"}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
              data-testid="public-nav-login"
            >
              {/* Render the contextual action label. */}
              {user ? "Dashboard" : "Sign in"}
            </Link>

            {/* Render the primary conversion action. */}
            <Link
              to={user ? "/dashboard" : "/signup"}
              className={buttonVariants({ size: "sm" })}
              data-testid="public-nav-cta"
            >
              {/* Render the contextual call-to-action. */}
              Create Your DigiCon
            </Link>

            {/* Render the mobile navigation trigger. */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    aria-label="Open menu"
                    data-testid="public-menu-trigger"
                  >
                    {/* Render the menu icon. */}
                    <Menu className="h-5 w-5" aria-hidden />
                  </Button>
                }
              />
              {/* Render the mobile navigation panel. */}
              <SheetContent
                side="right"
                className="w-[84vw] max-w-xs bg-[#07132a] px-4"
              >
                {/* Render the mobile menu heading. */}
                <SheetHeader>
                  <SheetTitle className="font-heading">DigiCon</SheetTitle>
                </SheetHeader>

                {/* Render all public and legal navigation links. */}
                <nav
                  className="mt-4 space-y-1"
                  aria-label="Mobile site navigation"
                >
                  {/* Render each mobile link. */}
                  {[...PUBLIC_LINKS, ...FOOTER_LINKS].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="dense flex min-h-[44px] items-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-testid={`mobile-nav-${link.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {/* Render the link label. */}
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Render the requested public page. */}
      <main>{children}</main>

      {/* Render the mobile navigation above the global accessibility bar. */}
      <PublicBottomNav />

      {/* Render the public footer above the global accessibility bar. */}
      <footer className="mt-16 border-t border-border/60 bg-[#040a18]/80 pb-6">
        {/* Keep footer contents within the application width. */}
        <div className="mx-auto max-w-6xl px-4 py-10">
          {/* Arrange footer content responsively. */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Render the DigiCon identity block. */}
            <div className="max-w-sm">
              {/* Render the DigiCon logo. */}
              <DigiConLogo />
              {/* Render the DigiCon positioning statement. */}
              <p className="dense mt-3 text-sm text-muted-foreground">
                Your professional identity. Your connections. Your network. Create. Share. Connect. Remember. Follow Up. Grow.
              </p>
            </div>

            {/* Render the desktop footer links. */}
            <nav
              className="hidden grid-cols-2 gap-x-8 gap-y-2 sm:grid"
              aria-label="Legal and support"
            >
              {/* Render every public and legal footer link. */}
              {[...PUBLIC_LINKS, ...FOOTER_LINKS].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="dense text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid={`footer-${link.label
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {/* Render the link label. */}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Render the compact mobile legal navigation. */}
            <nav
              className="flex flex-wrap gap-x-4 gap-y-2 sm:hidden"
              aria-label="Legal and support"
            >
              {/* Render every legal footer link. */}
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="dense text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid={`footer-mobile-${link.label
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {/* Render the link label. */}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Render the copyright notice. */}
          <p className="dense mt-8 text-xs text-muted-foreground">
            © {new Date().getFullYear()} DigiCon. Built for people who meet people.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Export the protected application wrapper.
export function Protected({
  children,
  adminOnly = false,
  bare = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
  bare?: boolean;
}) {
  // Retrieve authentication state and administrator status.
  const { user, isLoading, isAdmin } = useAuth();
  // Retrieve the current route.
  const location = useLocation();

  // Render the authentication loading state.
  if (isLoading) {
    // Keep loading content away from the fixed global controls.
    return (
      <div className="min-h-screen px-4 pb-24 pt-24">
        {/* Render the existing loading component. */}
        <div className="mx-auto max-w-md">
          <LoadingState
            label="Checking your session…"
            testId="auth-loading"
          />
        </div>
      </div>
    );
  }

  // Redirect unauthenticated visitors to the sign-in page.
  if (!user) {
    // Preserve the route that originally required authentication.
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Redirect users who have not completed onboarding.
  if (!user.onboarded && location.pathname !== "/onboarding") {
    // Send incomplete accounts to onboarding.
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect unauthorized users away from administrator functionality.
  if (adminOnly && !isAdmin) {
    // Send unauthorized users to their dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  // Render bare protected content without the main application shell.
  if (bare) {
    // Preserve the existing onboarding behavior.
    return <>{children}</>;
  }

  // Render normal protected content inside the application shell.
  return <AppShell>{children}</AppShell>;
}

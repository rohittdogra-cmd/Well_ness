"use client";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Notifications } from "./Notifications";
import { VerificationBanner } from "./VerificationBanner";
import { AuthGate } from "./AuthGate";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  Heart,
  House,
  MessageCircle,
  Users,
  LogOut,
  ArrowRight,
  UserRound,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { Mascot } from "./Mascot";
import { useLocalProfile } from "../hooks/useLocalProfile";
const nav = [
  { label: "Home", href: "/", icon: House },
  { label: "Conversations", href: "/discuss", icon: MessageCircle },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "People", href: "/people", icon: Users },
  { label: "Activities", href: "/book-activities", icon: Compass },
  { label: "My calendar", href: "/my-sessions", icon: CalendarDays },
];
export function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const profile = useLocalProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const pageTitle =
    nav.find(
      (item) =>
        path === item.href ||
        (item.href !== "/" && path.startsWith(item.href + "/")),
    )?.label ||
    {
      "/profile": "My profile",
      "/account": "Account",
      "/verify": "Verification",
      "/dashboard": "Dashboard",
    }[path] ||
    "Your wellness hub";
  const PageIcon =
    nav.find((item) => item.label === pageTitle)?.icon || UserRound;
  const isActive = (href: string) =>
    path === href || (href !== "/" && path.startsWith(href + "/"));
  if (path === "/signin" || path.startsWith("/auth/"))
    return (
      <MotionConfig reducedMotion="user">
        <div className="wellness-shell">
          <AuthGate>{children}</AuthGate>
        </div>
      </MotionConfig>
    );
  return (
    <MotionConfig reducedMotion="user">
      <AuthGate>
        <div className="wellness-shell">
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <aside className="wellness-sidebar">
            <Link href="/" className="wellness-logo">
              <span>
                <Heart size={23} />
              </span>
              wellness<span className="logo-dot">.</span>
            </Link>
            <nav aria-label="Main navigation">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`side-link ${isActive(item.href) ? "active" : ""}`}
                >
                  <item.icon size={19} />
                  {item.label}
                  {isActive(item.href) && <span className="nav-dot" />}
                </Link>
              ))}
            </nav>

            <Link href="/profile" className="sidebar-profile">
              <Mascot variant={profile?.avatar ?? 0} />
              <span>
                <strong>{profile?.name || "Smash Scorer"}</strong>
                <small>
                  {profile ? "View / Edit profile" : "Create your profile"}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </Link>
          </aside>
          <div className="wellness-content">
            <header className="wellness-topbar">
              <div className="topbar-location">
                <span className="topbar-page-icon">
                  <PageIcon size={18} />
                </span>
                <div>
                  <span className="topbar-breadcrumb">YOUR DAILY SPACE</span>
                  <strong>{pageTitle}</strong>
                </div>
              </div>
              <div className="account-actions">
                <Notifications />
                <span className="topbar-divider" aria-hidden="true" />
                <Link
                  href="/profile"
                  className="topbar-profile-pill"
                  title="My profile"
                >
                  <Mascot variant={profile?.avatar ?? 0} />
                  <span>
                    <strong>{profile?.name || "Your profile"}</strong>
                    <small>My profile</small>
                  </span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  className="signout-button"
                  type="button"
                  disabled={signingOut}
                  title={signingOut ? "Signing out…" : "Sign out"}
                  aria-label={signingOut ? "Signing out…" : "Sign out"}
                  onClick={async () => {
                    setSigningOut(true);
                    try {
                      await clear();
                      queryClient.clear();
                    } catch {
                      toast.error("Could not sign out. Please try again.");
                    } finally {
                      setSigningOut(false);
                    }
                  }}
                >
                  <LogOut size={17} />
                </button>
              </div>
            </header>
            <main id="main-content" key={path}>
              {path !== "/" && path !== "/verify" && <VerificationBanner />}
              {children}
            </main>
            <footer className="wellness-footer">
              <span>Make time for yourself.</span>
              <div className="footer-links">
                <Link href="/psychologists">Support</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/dashboard">Dashboard</Link>
              </div>
            </footer>
          </div>
          <nav className="wellness-mobile-nav" aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                <item.icon size={20} />
                <span>
                  {item.label === "Conversations"
                    ? "Chat"
                    : item.label === "My calendar"
                      ? "Calendar"
                      : item.label}
                </span>
              </Link>
            ))}
          </nav>
          <Toaster richColors position="top-center" />
        </div>
      </AuthGate>
    </MotionConfig>
  );
}

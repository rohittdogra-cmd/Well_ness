"use client";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Notifications } from "./Notifications";
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
  User,
  Shield,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { Mascot } from "./Mascot";
import { useLocalProfile } from "../hooks/useLocalProfile";
import { isAuthPath, isPublicPath } from "../lib/routes";
import { isAdminEmail } from "../lib/authAccounts";
const publicNav = [
  { label: "Activities & Calendar", href: "/book-activities" },
  { label: "Community & Posts", href: "/community" },
  { label: "Groups", href: "/groups" },
  { label: "Therapy", href: "/therapy" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Trust links shown to everyone: a stranger judging the service should be able
 *  to read the rules before creating an account. */
const trustNav = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Safety", href: "/safety" },
  { label: "Privacy", href: "/privacy" },
  { label: "Take a moment", href: "/take-a-moment" },
];

const nav = [
  { label: "Home", href: "/", icon: House },
  { label: "Activities & Calendar", href: "/book-activities", icon: CalendarDays },
  { label: "Community & Posts", href: "/community", icon: MessageCircle },
  { label: "Groups & Circles", href: "/groups", icon: Users },
  { label: "Therapy & Support", href: "/therapy", icon: Heart },
  { label: "My Profile", href: "/dashboard", icon: User },
];
export function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const profile = useLocalProfile();
  const { clear, user, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        path === "/dashboard" ||
        path.startsWith("/dashboard/") ||
        path === "/account" ||
        path === "/onboarding" ||
        path === "/my-sessions" ||
        path === "/profile"
      );
    }
    return path === href || (href !== "/" && path.startsWith(href + "/"));
  };
  // Auth pages render their own minimal shell.
  if (isAuthPath(path) || path === "/signin")
    return (
      <MotionConfig reducedMotion="user">
        <div className="wellness-shell">
          <AuthGate>{children}</AuthGate>
        </div>
      </MotionConfig>
    );
  // Public marketing pages get the public chrome for signed-out visitors, and
  // the member chrome once a session exists. The server render is always the
  // public shell so crawlers and link previews receive real content; the swap
  // happens once on hydration.
  if (isPublicPath(path) && !(user && !isInitializing))
    return (
      <MotionConfig reducedMotion="user">
        <AuthGate>
          <div className="wellness-shell public-shell">
            <a className="skip-link" href="#main-content">
              Skip to content
            </a>
            <header className="public-header">
              <Link href="/" className="wellness-logo">
                <span>
                  <Heart size={23} />
                </span>
                stress-unwind<span className="logo-dot">.</span>
              </Link>
              <nav aria-label="Public navigation" className="public-nav">
                {publicNav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      className="topbar-account"
                      href="/dashboard"
                      title="Your dashboard"
                    >
                      {profile ? `Hey, ${profile.name}` : "Create an account"}
                    </Link>
                    <Link className="wellness-button" href="/dashboard">
                      Go to your hub
                    </Link>
                  </>
                ) : (
                  <Link className="wellness-button" href="/signin">
                    Sign in
                  </Link>
                )}
              </nav>
            </header>
            <main id="main-content">{children}</main>
            <footer className="public-footer">
              <span>Make time for yourself.</span>
              <div className="footer-links">
                {trustNav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
                <Link href="/about">About</Link>
                <Link href="/membership">Membership</Link>
                <Link href="/careers">Careers</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </footer>
          </div>
        </AuthGate>
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
              stress-unwind<span className="logo-dot">.</span>
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

              {/* Admin Panel link for designated admins */}
              {isAdminEmail(user?.email) && (
                <Link
                  href="/admin"
                  className={`side-link ${path.startsWith("/admin") ? "active" : ""}`}
                  style={{ color: "var(--teal-700)", fontWeight: 600 }}
                >
                  <Shield size={19} />
                  Admin Panel
                  <span
                    style={{
                      fontSize: "9px",
                      background: "var(--teal-600)",
                      color: "white",
                      padding: "1px 5px",
                      borderRadius: "6px",
                      marginLeft: "auto",
                    }}
                  >
                    LIVE
                  </span>
                </Link>
              )}
            </nav>

            <Link href="/dashboard" className="sidebar-profile">
              <Mascot variant={profile?.avatar ?? 0} />
              <span>
                <strong>{profile?.name || "Your space awaits"}</strong>
                <small>
                  {profile ? "View your profile" : "Create your profile"}
                </small>
              </span>
              <ArrowUpRight size={17} />
            </Link>
          </aside>
          <div className="wellness-content">
            <header className="wellness-topbar">
              <span className="topbar-label">
                {path.startsWith("/admin")
                  ? "Admin Dashboard"
                  : nav.find((item) => isActive(item.href))?.label ||
                    "stress unwind"}
                <small>
                  {path.startsWith("/admin")
                    ? "Live Website Control Center"
                    : "Make room for connection & stress relief"}
                </small>
              </span>
              <div className="account-actions">
                {isAdminEmail(user?.email) && (
                  <Link
                    href="/admin"
                    className="wellness-button"
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      gap: "6px",
                      background: "rgba(20, 184, 166, 0.15)",
                      color: "var(--teal-800)",
                      border: "1px solid rgba(20, 184, 166, 0.3)",
                    }}
                  >
                    <Shield size={14} /> Admin Controls
                  </Link>
                )}
                <Notifications />
                <button
                  className="signout-button"
                  type="button"
                  disabled={signingOut}
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
                  <LogOut size={16} />{" "}
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
                <Link
                  href="/dashboard"
                  className="topbar-account"
                  title="My Profile"
                >
                  {profile ? `Hey, ${profile.name}` : "Create an account"}
                  <Mascot variant={profile?.avatar ?? 0} />
                </Link>
              </div>
            </header>
            <main id="main-content" key={path}>
              {children}
            </main>
            <footer className="wellness-footer">
              <span>Make time for yourself.</span>
              <div className="footer-links">
                <Link href="/take-a-moment">Take a moment</Link>
                <Link href="/how-it-works">How it works</Link>
                <Link href="/safety">Safety</Link>
                <Link href="/privacy">Privacy</Link>
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
                aria-label={item.label}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <Toaster richColors position="top-center" />
        </div>
      </AuthGate>
    </MotionConfig>
  );
}

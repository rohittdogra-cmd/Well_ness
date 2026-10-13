"use client";
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
  Menu,
  X,
  Sparkles,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <header className="public-header modern-glass-header">
              <div className="public-header-inner">
                <Link href="/" className="wellness-logo">
                  <span className="logo-icon-wrap">
                    <Heart size={21} className="heart-pulse" />
                  </span>
                  stress-unwind<span className="logo-dot">.</span>
                </Link>

                <nav aria-label="Public navigation" className="public-nav desktop-nav">
                  {publicNav.map((item) => {
                    const active =
                      path === item.href ||
                      (item.href !== "/" && path.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`public-nav-link ${active ? "active" : ""}`}
                      >
                        {item.label}
                        {active && <span className="active-glow-pill" />}
                      </Link>
                    );
                  })}
                </nav>

                <div className="public-header-actions">
                  <div className="live-status-pill hidden md:inline-flex">
                    <span className="live-status-dot" />
                    <span>Live Hub</span>
                  </div>

                  {user ? (
                    <>
                      <Link
                        className="topbar-account"
                        href="/dashboard"
                        title="Your dashboard"
                      >
                        {profile ? `Hey, ${profile.name}` : "Create an account"}
                      </Link>
                      <Link className="wellness-button shine-btn" href="/dashboard">
                        Go to your hub
                      </Link>
                    </>
                  ) : (
                    <Link className="wellness-button shine-btn" href="/signin">
                      Sign in
                    </Link>
                  )}

                  <button
                    type="button"
                    className="mobile-hamburger-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileMenuOpen}
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              </div>

              {/* Mobile Drawer */}
              {mobileMenuOpen && (
                <div className="public-mobile-drawer">
                  <div className="public-mobile-links">
                    {publicNav.map((item) => {
                      const active =
                        path === item.href ||
                        (item.href !== "/" && path.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`mobile-nav-item ${active ? "active" : ""}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                    <div className="mobile-drawer-cta">
                      {user ? (
                        <Link
                          href="/dashboard"
                          className="wellness-button w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Go to your hub
                        </Link>
                      ) : (
                        <Link
                          href="/signin"
                          className="wellness-button w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign in
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
          <aside className="wellness-sidebar modern-sidebar">
            <div className="sidebar-brand-wrapper">
              <Link href="/" className="wellness-logo">
                <span className="logo-icon-wrap">
                  <Heart size={21} className="heart-pulse" />
                </span>
                stress-unwind<span className="logo-dot">.</span>
              </Link>
            </div>

            <nav aria-label="Main navigation" className="sidebar-nav-container">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`side-link ${isActive(item.href) ? "active" : ""}`}
                >
                  <item.icon size={19} className="nav-icon" />
                  <span>{item.label}</span>
                  {isActive(item.href) && <span className="nav-dot" />}
                </Link>
              ))}

              {/* Admin Panel link for designated admins */}
              {isAdminEmail(user?.email) && (
                <Link
                  href="/admin"
                  className={`side-link admin-side-link ${path.startsWith("/admin") ? "active" : ""}`}
                >
                  <Shield size={19} />
                  <span>Admin Panel</span>
                  <span className="admin-live-tag">LIVE</span>
                </Link>
              )}
            </nav>

            <div className="sidebar-bottom-zone">
              <Link href="/dashboard" className="sidebar-profile-card">
                <div className="profile-mascot-wrap">
                  <Mascot variant={profile?.avatar ?? 0} />
                  <span className="online-indicator-dot" />
                </div>
                <div className="profile-info-text">
                  <strong>{profile?.name || "Your space awaits"}</strong>
                  <small>
                    {profile ? "Member Space" : "Create your profile"}
                  </small>
                </div>
                <ArrowUpRight size={16} className="profile-chevron" />
              </Link>
            </div>
          </aside>

          <div className="wellness-content">
            <header className="wellness-topbar modern-topbar">
              <div className="topbar-left">
                <span className="topbar-label">
                  {path.startsWith("/admin")
                    ? "Admin Dashboard"
                    : nav.find((item) => isActive(item.href))?.label ||
                      "stress unwind"}
                  <small>
                    {path.startsWith("/admin")
                      ? "Live Website Control Center & Moderation"
                      : "Make room for connection & stress relief"}
                  </small>
                </span>
              </div>
              <div className="account-actions">
                {isAdminEmail(user?.email) && (
                  <Link
                    href="/admin"
                    className="admin-badge-btn"
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
                <Link href="/terms">Terms</Link>
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
        </div>
      </AuthGate>
    </MotionConfig>
  );
}

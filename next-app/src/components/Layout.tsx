"use client";
import { localAccess } from "@/lib/localAccess";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { AuthGate } from "./AuthGate";
import { HubHeader } from "./HubHeader";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
export function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const publicPage = path === "/signin" || path.startsWith("/auth/");
  return (
    <MotionConfig reducedMotion="user">
      <div className={`wellness-shell ${publicPage ? "" : "hub-shell-v2"}`}>
        <AuthGate>
          {publicPage ? (
            children
          ) : (
            <>
              <a className="skip-link" href="#main-content">
                Skip to content
              </a>
              {localAccess && (
                <div className="local-preview-note">
                  Local preview · Sample data. No real emails or appointments
                  are sent.
                </div>
              )}
              <HubHeader />
              <div className="wellness-content">
                <main id="main-content" key={path}>
                  {children}
                </main>
                <footer className="wellness-footer">
                  <div className="footer-brand-summary">
                    <strong>Stress Unwind</strong>
                    <span>Corporate & Community Wellness Platform</span>
                    <small>© {new Date().getFullYear()} Stress Unwind. All rights reserved.</small>
                  </div>
                  <div className="footer-links">
                    <Link href="/groups">Wellness Circles</Link>
                    <Link href="/book-activities">Book Activities</Link>
                    <Link href="/psychologists">Find Care</Link>
                    <Link href="/community">Stories</Link>
                    <Link href="/discuss">Forum</Link>
                    <Link href="/about">About</Link>
                    <Link href="/membership">Pricing</Link>
                    <Link href="/careers">Careers</Link>
                    <Link href="/apply-provider">For Providers</Link>
                    <Link href="/contact">Contact</Link>
                  </div>
                </footer>
              </div>
            </>
          )}
          <Toaster richColors position="top-center" />
        </AuthGate>
      </div>
    </MotionConfig>
  );
}

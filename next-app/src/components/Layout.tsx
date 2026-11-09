"use client";
import { localAccess } from "@/lib/localAccess";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { VerificationBanner } from "./VerificationBanner";
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
                  {!["/verify", "/admin", "/dashboard"].includes(path) && (
                    <VerificationBanner />
                  )}
                  {children}
                </main>
                <footer className="wellness-footer">
                  <span>Make time for yourself. Make room for connection.</span>
                  <div className="footer-links">
                    <Link href="/psychologists">Find care</Link>
                    <Link href="/contact">Contact</Link>
                    <Link href="/provider">For providers</Link>
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

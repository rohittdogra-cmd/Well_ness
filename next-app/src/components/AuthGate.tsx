"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfileQuery } from "../hooks/useLocalProfile";
import { RowSkeleton, Skeleton } from "./Skeleton";
import { isPublicPath } from "../lib/routes";
import { describeDatabaseError } from "../lib/dbErrors";

/**
 * Sign-in and profile gating.
 *
 * Public pages render immediately — including before the session has been
 * restored — so a crawler or a signed-out visitor sees real content instead of a
 * redirect. Everything else waits for the session, then routes to `/signin` or
 * `/onboarding`. The route lists come from `lib/routes.ts`, which the proxy and
 * robots.txt share.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useInternetIdentity();
  const profile = useProfileQuery();
  const path = usePathname() ?? "/";
  const router = useRouter();
  const publicPage = isPublicPath(path);
  const loading = isInitializing || (!!user && profile.isPending);
  const needsProfile =
    !!user && !profile.data?.name.trim() && path !== "/onboarding";
  const settled = !loading && !profile.error;

  useEffect(() => {
    if (!settled) return;
    // A signed-in member without a profile is nudged to onboarding from every
    // page, including the public ones.
    if (user && needsProfile) {
      router.replace("/onboarding");
      return;
    }
    // Only private routes send a signed-out visitor to sign-in.
    if (!publicPage && !user) router.replace("/signin");
  }, [publicPage, settled, user, needsProfile, profile.error, router]);

  // Checked before the public-page shortcut: a signed-in member hitting a
  // database problem must be told, even on a marketing page. A signed-out
  // visitor never gets here because the profile query is disabled without a
  // session, so public pages still render cleanly for crawlers and guests.
  if (profile.error)
    return (
      <div className="auth-loading" role="alert">
        <div>
          <h2>We couldn&apos;t load your profile.</h2>
          <p>{describeDatabaseError(profile.error)}</p>
          <button className="wellness-button" onClick={() => profile.refetch()}>
            Try again
          </button>
        </div>
      </div>
    );

  if (publicPage) return children;

  if (loading || !user || needsProfile)
    return (
      <div className="auth-loading" role="status" aria-label="Loading">
        <div style={{ width: "100%", maxWidth: 500, padding: "0 24px" }}>
          <Skeleton style={{ height: 28, width: "50%", marginBottom: 16 }} />
          <Skeleton style={{ height: 14, width: "80%", marginBottom: 24 }} />
          <RowSkeleton count={3} />
        </div>
      </div>
    );

  return children;
}
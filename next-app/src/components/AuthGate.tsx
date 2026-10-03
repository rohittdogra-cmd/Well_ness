"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfileQuery } from "../hooks/useLocalProfile";
import { RowSkeleton, Skeleton } from "./Skeleton";
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useInternetIdentity();
  const profile = useProfileQuery();
  const path = usePathname();
  const router = useRouter();
  const publicPage = path === "/signin" || path.startsWith("/auth/");
  const loading = isInitializing || (!!user && profile.isPending);
  const needsProfile =
    !!user && !profile.data?.name.trim() && path !== "/onboarding";
  useEffect(() => {
    if (publicPage || loading || profile.error) return;
    if (!user) router.replace("/signin");
    else if (needsProfile) router.replace("/onboarding");
  }, [publicPage, loading, user, needsProfile, profile.error, router]);
  if (publicPage) return children;
  if (profile.error)
    return (
      <div className="auth-loading" role="alert">
        <div>
          <h2>We couldn't load your profile.</h2>
          <p>{profile.error.message}</p>
          <button className="wellness-button" onClick={() => profile.refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
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

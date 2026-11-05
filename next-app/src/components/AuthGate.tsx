"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfileQuery } from "../hooks/useLocalProfile";
import { localAccess } from "@/lib/localAccess";
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isInitializing } = useInternetIdentity();
  const profile = useProfileQuery();
  const path = usePathname();
  const router = useRouter();
  const publicPage =
    path === "/signin" ||
    path.startsWith("/auth/") ||
    ["/psychologists", "/appointments/guest"].includes(path);
  const loading = isInitializing || (!!user && profile.isPending);
  const needsProfile =
    !!user &&
    !profile.data?.name.trim() &&
    !["/onboarding", "/account"].includes(path);
  useEffect(() => {
    if (localAccess && path === "/signin") {
      router.replace("/");
      return;
    }
    if (publicPage || loading || profile.error) return;
    if (!user)
      router.replace(
        "/signin?next=" +
          encodeURIComponent(window.location.pathname + window.location.search),
      );
    else if (needsProfile) router.replace("/onboarding");
  }, [publicPage, loading, user, needsProfile, profile.error, router, path]);
  if (publicPage) return children;
  if (profile.error)
    return (
      <div className="auth-loading" role="alert">
        <div>
          <h2>We couldn’t load your profile.</h2>
          <p>{profile.error.message}</p>
          <button className="wellness-button" onClick={() => profile.refetch()}>
            Try again
          </button>
        </div>
      </div>
    );
  if (loading || !user || needsProfile)
    return (
      <div className="auth-loading" role="status">
        Loading your space…
      </div>
    );
  return children;
}

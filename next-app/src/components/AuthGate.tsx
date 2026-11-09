"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfileQuery } from "../hooks/useLocalProfile";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { profileIsComplete } from "@/lib/profileCompletion";
import { localAccess } from "@/lib/localAccess";
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isInitializing, clear } = useInternetIdentity();
  const profile = useProfileQuery();
  const access = useQuery({
    queryKey: ["account-access", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("account_access");
      if (error) throw new Error(error.message);
      if (
        !data ||
        typeof data.active !== "boolean" ||
        typeof data.profile_complete !== "boolean"
      )
        throw new Error(
          "Account access could not be verified. Please try again.",
        );
      return data as { active: boolean; profile_complete: boolean };
    },
  });
  const path = usePathname();
  const router = useRouter();
  const authPage = path === "/signin" || path.startsWith("/auth/");
  const publicPage =
    authPage || ["/psychologists", "/appointments/guest"].includes(path);
  const visitorPage =
    [
      "/",
      "/groups",
      "/discuss",
      "/community",
      "/people",
      "/book-activities",
    ].includes(path) ||
    path.startsWith("/groups/") ||
    path.startsWith("/sessions/") ||
    path.startsWith("/programs/");
  const loading =
    isInitializing || (!!user && (profile.isPending || access.isPending));
  const needsProfile =
    !!user &&
    !profileIsComplete(profile.data) &&
    !["/onboarding", "/account", "/admin", "/dashboard"].includes(path);
  useEffect(() => {
    if (localAccess && path === "/signin") {
      router.replace("/");
      return;
    }
    if (
      authPage ||
      loading ||
      profile.error ||
      access.error ||
      access.data?.active === false
    )
      return;
    if (!user && !visitorPage && !publicPage)
      router.replace(
        "/signin?next=" +
          encodeURIComponent(window.location.pathname + window.location.search),
      );
    else if (user && needsProfile) router.replace("/onboarding");
  }, [
    publicPage,
    authPage,
    access.error,
    access.data?.active,
    loading,
    user,
    needsProfile,
    profile.error,
    router,
    path,
    visitorPage,
  ]);
  if (authPage || (!user && (publicPage || visitorPage))) return children;
  if (user && access.data?.active === false && path !== "/account")
    return (
      <section className="hub-page">
        <h1>Your account is suspended</h1>
        <p>
          Community access has been paused by an administrator. Contact the
          platform owner if you believe this is a mistake.
        </p>
        <button className="wellness-button" onClick={() => void clear()}>
          Log out
        </button>
        <p>
          <a href="/account">Account and deletion options</a>
        </p>
      </section>
    );
  if (user && access.error)
    return (
      <section className="hub-page" role="alert">
        <h1>Couldn’t check account access</h1>
        <p>{access.error.message}</p>
        <button
          className="wellness-button"
          onClick={() => void access.refetch()}
        >
          Try again
        </button>
        <button onClick={() => void clear()}>Log out</button>
      </section>
    );
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

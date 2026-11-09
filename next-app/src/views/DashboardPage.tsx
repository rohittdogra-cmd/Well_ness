"use client";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { AdminDashboardView } from "./AdminDashboardPage";

export function DashboardPage() {
  const { user, isInitializing } = useInternetIdentity();
  const admin = useIsAdmin();
  if (isInitializing || (user && admin.isPending))
    return (
      <div className="hub-page" role="status">
        Checking administrator access…
      </div>
    );
  if (admin.error)
    return (
      <section className="hub-page" role="alert">
        <h1>Couldn’t check admin access</h1>
        <p>Please try again.</p>
        <button className="wellness-button" onClick={() => admin.refetch()}>
          Try again
        </button>
      </section>
    );
  if (!user || admin.data !== true)
    return (
      <section className="hub-page admin-access-notice">
        <ShieldCheck size={32} />
        <h1>Administrator access required</h1>
        <p>This panel is reserved for platform administrators.</p>
        <p>
          Your groups, appointments and plans are available in your profile and
          calendar.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="wellness-button" href="/profile">
            My profile
          </Link>
          <Link className="wellness-button secondary" href="/my-sessions">
            My calendar
          </Link>
        </div>
      </section>
    );
  return <AdminDashboardView />;
}

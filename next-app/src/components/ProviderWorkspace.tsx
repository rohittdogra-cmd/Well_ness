"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { rpc } from "@/lib/backend";
import { toast } from "sonner";
type Appointment = {
  id: string;
  kind: "guest" | "member";
  provider_id: number;
  provider: string;
  client: string;
  email: string | null;
  booking_time: string;
  status: "pending" | "confirmed" | "cancelled";
};
export function ProviderWorkspace() {
  const { user } = useInternetIdentity();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const applications = useQuery({
    queryKey: ["provider-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("providers")
        .select("id,name,status,description")
        .eq("applicant", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const appointments = useQuery({
    queryKey: ["provider-appointments", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("provider_appointments");
      if (error) throw error;
      return data as Appointment[];
    },
  });
  const [filter, setFilter] = useState("pending");
  async function confirm(item: Appointment) {
    setBusy(item.kind + item.id);
    try {
      await rpc(
        item.kind === "guest" ? "confirm_guest_appointment" : "confirm_booking",
        { p_booking: item.id },
      );
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["provider-appointments"] }),
        qc.invalidateQueries({ queryKey: ["bookings"] }),
        qc.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      toast.success("Appointment confirmed");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not confirm appointment",
      );
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="hub-page provider-workspace">
      <header className="page-heading">
        <span className="eyebrow">
          <Stethoscope size={16} /> FOR CARE PROVIDERS
        </span>
        <h1>Your practice, in one place.</h1>
        <p>
          Track your application, review private appointment requests and
          confirm your upcoming sessions.
        </p>
        <Link className="text-action" href="/apply-provider">
          Submit an application <ArrowUpRight size={17} />
        </Link>
      </header>
      <section className="care-workspace-section">
        <h2>Application status</h2>
        {applications.isPending ? (
          <p role="status">Loading applications…</p>
        ) : applications.error ? (
          <p role="alert">
            Couldn’t load applications.{" "}
            <button onClick={() => applications.refetch()}>Try again</button>
          </p>
        ) : !applications.data?.length ? (
          <p>
            No applications yet. Sign in with the account you’ll use to manage
            your practice, then apply.
          </p>
        ) : (
          applications.data.map((p) => (
            <article className="application-status" key={p.id}>
              <span className="return-icon">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h3>{p.name}</h3>
                <p>
                  {p.status === "approved"
                    ? "Approved · Your listing is visible in the care directory."
                    : p.status === "rejected"
                      ? "Not approved · Contact the community team before reapplying."
                      : "Awaiting administrator review · Your listing is not public yet."}
                </p>
              </div>
              <span className={`care-status ${p.status}`}>{p.status}</span>
            </article>
          ))
        )}
      </section>
      <section className="care-workspace-section">
        <header className="workspace-section-heading">
          <div>
            <h2>Private appointment requests</h2>
            <p>
              Updates appear here and in your notification bell. This list
              refreshes every 30 seconds.
            </p>
          </div>
          <CalendarDays size={22} />
        </header>
        <label className="care-filter">
          Show{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">Awaiting confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All requests</option>
          </select>
        </label>
        {appointments.isPending ? (
          <p role="status">Loading requests…</p>
        ) : appointments.error ? (
          <div role="alert">
            Couldn’t load appointment requests.{" "}
            <button onClick={() => appointments.refetch()}>Try again</button>
          </div>
        ) : !appointments.data?.filter(
            (a) => filter === "all" || a.status === filter,
          ).length ? (
          <p className="activity-empty">
            No {filter === "all" ? "appointment" : filter} requests.
          </p>
        ) : (
          <div className="provider-request-list">
            {appointments.data
              .filter((a) => filter === "all" || a.status === filter)
              .map((a) => (
                <article className="provider-request" key={a.kind + a.id}>
                  <div>
                    <span className="eyebrow">
                      {a.kind === "guest"
                        ? "GUEST REQUEST"
                        : "PRIVATE MEMBER REQUEST"}
                    </span>
                    <h3>{a.provider}</h3>
                    <p>
                      {new Date(a.booking_time).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {a.email && (
                      <p className="private-contact">Contact: {a.email}</p>
                    )}
                    <small>
                      {a.kind === "guest"
                        ? "The guest sees status changes through their private appointment link."
                        : "Confirmation appears in the member’s calendar and notifications."}
                    </small>
                  </div>
                  <div>
                    <span className={`care-status ${a.status}`}>
                      {a.status}
                    </span>
                    {a.status === "pending" && (
                      <button
                        className="wellness-button"
                        disabled={busy !== null}
                        onClick={() => confirm(a)}
                      >
                        {busy === a.kind + a.id
                          ? "Confirming…"
                          : "Confirm appointment"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

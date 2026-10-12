"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { rpc } from "@/lib/backend";
import { toast } from "sonner";

/** A conversation a moderator hid, with the report that led to it. */
type HiddenPost = {
  id: number;
  body: string;
  created_at: string;
  report_id: number | null;
  reason: string | null;
};

export function OperationsPanel() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["operations"],
    queryFn: async () => {
      let reportsData: {
        id: number;
        reason: string;
        body: string;
        author_id: string;
        created_at: string;
      }[] = [];
      let contactsData: any[] = [];
      let bookingsData: any[] = [];
      let hiddenData: HiddenPost[] = [];

      try {
        const res = await getSupabase().rpc("get_reports");
        if (!res.error && res.data) reportsData = res.data as typeof reportsData;
      } catch {
        // Fallback gracefully if RPC does not exist
      }

      try {
        const res = await getSupabase()
          .from("contact_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!res.error && res.data) contactsData = res.data;
      } catch {
        // Fallback gracefully if table does not exist
      }

      try {
        const res = await getSupabase()
          .from("provider_bookings")
          .select("id,booking_time,confirmed,providers(name)")
          .eq("confirmed", false)
          .order("booking_time", { ascending: true })
          .limit(200);
        if (!res.error && res.data) bookingsData = res.data;
      } catch {
        // Fallback gracefully
      }

      try {
        const res = await getSupabase().rpc("get_hidden_posts");
        if (!res.error && res.data) hiddenData = (res.data ?? []) as HiddenPost[];
      } catch {
        // Fallback gracefully
      }

      return {
        reports: reportsData,
        contacts: contactsData,
        bookings: bookingsData,
        hidden: hiddenData,
      };
    },
  });
  async function act(name: string, args: Record<string, unknown>) {
    setBusy(true);
    try {
      await rpc(name, args);
      await qc.invalidateQueries({ queryKey: ["operations"] });
      await qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="hub-page">
      <h2 className="text-2xl mb-6">Community operations</h2>
      {query.error ? (
        <p role="alert">{query.error.message}</p>
      ) : query.isPending ? (
        <p>Loading…</p>
      ) : (
        <>
          <h3 className="text-xl my-4">Reported conversations</h3>
          {!query.data.reports.length ? (
            <p>No unresolved reports.</p>
          ) : (
            query.data.reports.map((r) => (
              <article className="provider-card mb-3" key={r.id}>
                <p>
                  <strong>Report:</strong> {r.reason}
                </p>
                <p>
                  <strong>Content:</strong> {r.body}
                </p>
                <small>Author account: {r.author_id}</small>
                <div className="composer-actions">
                  <button
                    className="wellness-button"
                    disabled={busy}
                    onClick={() =>
                      act("moderate_post", { p_report: r.id, p_hide: true })
                    }
                  >
                    Hide content
                  </button>
                  <button
                    className="text-action"
                    disabled={busy}
                    onClick={() =>
                      act("moderate_post", { p_report: r.id, p_hide: false })
                    }
                  >
                    Dismiss report
                  </button>
                </div>
              </article>
            ))
          )}

          {/* Hiding a post resolved its report, so it left the queue above and
              became unreachable. This is the way back. */}
          <h3 className="text-xl my-4">Hidden content</h3>
          {!query.data.hidden.length ? (
            <p>Nothing is currently hidden.</p>
          ) : (
            query.data.hidden.map((p) => (
              <article className="provider-card mb-3" key={p.id}>
                <p>{p.body}</p>
                {p.reason && (
                  <small>Original report: {p.reason}</small>
                )}
                <div className="composer-actions">
                  <button
                    className="wellness-button"
                    disabled={busy}
                    onClick={() => act("restore_post", { p_post: p.id })}
                  >
                    Restore this conversation
                  </button>
                </div>
              </article>
            ))
          )}

          <h3 className="text-xl my-4">Appointment requests</h3>
          {!query.data.bookings.length ? (
            <p>No pending appointments.</p>
          ) : (
            query.data.bookings.map((b) => (
              <article className="provider-card mb-3" key={b.id}>
                <p>
                  {new Date(b.booking_time).toLocaleString()} ·{" "}
                  {(b.providers as unknown as { name: string })?.name}
                </p>
                <button
                  className="wellness-button"
                  disabled={busy}
                  onClick={() => act("confirm_booking", { p_booking: b.id })}
                >
                  Confirm appointment
                </button>
              </article>
            ))
          )}
          <h3 className="text-xl my-4">Contact inbox</h3>
          {!query.data.contacts.length ? (
            <p>No messages yet.</p>
          ) : (
            query.data.contacts.map((c) => (
              <article className="provider-card mb-3" key={c.id}>
                <h3>{c.subject}</h3>
                <p>{c.message}</p>
                <small>
                  Account: {c.user_id} ·{" "}
                  {new Date(c.created_at).toLocaleString()}
                </small>
              </article>
            ))
          )}
        </>
      )}
    </section>
  );
}

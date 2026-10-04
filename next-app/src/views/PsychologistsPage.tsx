"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { rpc } from "@/lib/backend";
import { toast } from "sonner";
export function PsychologistsPage() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["provider-directory"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("providers")
        .select("id,name,description")
        .eq("status", "approved")
        .eq("provider_type", "psychologist")
        .order("name", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data as { id: number; name: string; description: string }[];
    },
  });
  return (
    <div className="hub-page">
      <header className="page-heading">
        <span className="eyebrow">MAKE SPACE TO TALK</span>
        <h1>Support, on your terms.</h1>
        <p>
          Explore approved providers and request a one-hour appointment. Your
          request becomes confirmed when the provider accepts it.
        </p>
        <div className="page-links">
          <Link href="/my-sessions">Your appointments ↗</Link>
          <Link href="/apply-provider">Apply as a provider ↗</Link>
        </div>
      </header>
      {query.isPending ? (
        <p role="status">Loading providers…</p>
      ) : query.error ? (
        <div role="alert">
          <p>{query.error.message}</p>
          <button onClick={() => query.refetch()}>Retry</button>
        </div>
      ) : !query.data?.length ? (
        <div className="empty-state">
          <h2>Our provider community is growing.</h2>
          <p>
            Approved providers will appear here. You can still connect with your
            community while we get things ready.
          </p>
        </div>
      ) : (
        <div className="booking-list">
          {query.data.map((p) => (
            <article className="provider-card" key={p.id}>
              <span className="eyebrow">APPROVED PROVIDER</span>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const date = new FormData(e.currentTarget).get(
                    "date",
                  ) as string;
                  setBusy(p.id);
                  try {
                    await rpc("book_provider", {
                      p_provider: p.id,
                      p_time: new Date(date).toISOString(),
                    });
                    await qc.invalidateQueries({ queryKey: ["bookings"] });
                    toast.success(
                      "Appointment requested. Track confirmation in your calendar.",
                    );
                  } catch (e) {
                    toast.error(
                      e instanceof Error
                        ? e.message
                        : "Could not request appointment",
                    );
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                <label className="field-label">
                  Preferred date and time
                  <input type="datetime-local" name="date" required />
                </label>
                <button className="wellness-button" disabled={busy !== null}>
                  {busy === p.id ? "Requesting…" : "Request appointment"}
                </button>
              </form>
              <small className="privacy-note">
                Times are shown in your device’s timezone. Requests are subject
                to the provider’s availability.
              </small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

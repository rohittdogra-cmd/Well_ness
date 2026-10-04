"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { rpc } from "@/lib/backend";
import { toast } from "sonner";
export function AppointmentList() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["bookings", "calendar"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("provider_bookings")
        .select("id,booking_time,confirmed,providers(name)")
        .order("booking_time", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">My appointments</h2>
      {query.isPending ? (
        <p>Loading…</p>
      ) : query.error ? (
        <p role="alert">{query.error.message}</p>
      ) : !query.data?.length ? (
        <p className="text-muted-foreground">
          Your appointment requests will appear here.
        </p>
      ) : (
        query.data.map((b) => (
          <article className="provider-card mb-3" key={b.id}>
            <h3>
              {(b.providers as unknown as { name: string })?.name ??
                "Provider appointment"}
            </h3>
            <p>
              {new Date(b.booking_time).toLocaleString()} ·{" "}
              {b.confirmed ? "Confirmed" : "Awaiting confirmation"}
            </p>
            <button
              className="text-action"
              disabled={busy !== null}
              onClick={async () => {
                if (!window.confirm("Cancel this appointment request?")) return;
                setBusy(b.id);
                try {
                  await rpc("cancel_booking", { p_booking: b.id });
                  await qc.invalidateQueries({ queryKey: ["bookings"] });
                  toast.success("Appointment cancelled");
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Could not cancel",
                  );
                } finally {
                  setBusy(null);
                }
              }}
            >
              Cancel appointment
            </button>
          </article>
        ))
      )}
    </section>
  );
}

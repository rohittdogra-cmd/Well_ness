"use client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useRouter } from "next/navigation";
import { useVerification } from "@/hooks/useVerification";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { rpc } from "@/lib/backend";
import { toast } from "sonner";
export function PsychologistsPage() {
  const qc = useQueryClient();
  const { user, isInitializing } = useInternetIdentity();
  const router = useRouter();
  const [error, setError] = useState("");
  const verification = useVerification();
  const [busy, setBusy] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["provider-directory"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("providers")
        .select("id,name,description")
        .eq("status", "approved")
        .eq("provider_type", "psychologist");
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
          {user && (
            <Link href="/profile?view=bookings">Your appointments ↗</Link>
          )}
          <Link href="/apply-provider">Apply as a provider ↗</Link>
        </div>
      </header>
      {!user && (
        <aside className="guest-care-note">
          <strong>Private care, without a community account.</strong>
          <p>
            Request a preferred time as a guest. Your contact email is shared
            only with the provider and authorised administrators. Save your
            private status link to see confirmation; we do not send booking
            emails.
          </p>
        </aside>
      )}
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
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
                  setError("");
                  try {
                    if (!user) {
                      const contact = new FormData(e.currentTarget).get(
                        "email",
                      ) as string;
                      const response = await fetch("/api/guest-appointments", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          provider: p.id,
                          time: new Date(date).toISOString(),
                          email: contact,
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok)
                        throw new Error(
                          data.message || "Could not request appointment",
                        );
                      router.push("/appointments/guest#" + data.receipt);
                      return;
                    }
                    await rpc("book_provider", {
                      p_provider: p.id,
                      p_time: new Date(date).toISOString(),
                    });
                    await qc.invalidateQueries({ queryKey: ["bookings"] });
                    toast.success(
                      "Appointment requested. Track confirmation in your calendar.",
                    );
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Could not request appointment",
                    );
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
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    min={new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)}
                  />
                </label>
                {!user && (
                  <>
                    <label className="field-label">
                      Contact email
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        maxLength={254}
                        required
                        placeholder="you@example.com"
                      />
                    </label>
                    <label className="guest-consent">
                      <input type="checkbox" required />I agree to share this
                      email with the provider and authorised administrators for
                      this request.
                    </label>
                  </>
                )}
                <button
                  type={
                    !user || verification.data?.verified ? "submit" : "button"
                  }
                  onClick={() => {
                    if (user && !verification.data?.verified)
                      window.location.assign("/verify");
                  }}
                  className="wellness-button"
                  disabled={
                    busy !== null ||
                    isInitializing ||
                    (!!user && verification.isPending)
                  }
                >
                  {busy === p.id
                    ? "Requesting…"
                    : !user || verification.data?.verified
                      ? "Request appointment"
                      : "Verify to book"}
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

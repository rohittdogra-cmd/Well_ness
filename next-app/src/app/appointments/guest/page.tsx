"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { getSupabase } from "@/lib/supabase/client";
import Link from "next/link";
import { LockKeyhole, Copy, ArrowLeft } from "lucide-react";
type Receipt = {
  id: string;
  provider: string;
  booking_time: string;
  status: string;
};
export default function GuestAppointmentPage() {
  const { isInitializing } = useInternetIdentity();
  const [receipt, setReceipt] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const readLink = () => {
      setReceipt(window.location.hash.slice(1));
      setReady(true);
    };
    readLink();
    window.addEventListener("hashchange", readLink);
    return () => window.removeEventListener("hashchange", readLink);
  }, []);
  const query = useQuery({
    queryKey: ["guest-appointment", receipt],
    enabled: !isInitializing && receipt.length === 72,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc(
        "guest_appointment_status",
        { p_receipt: receipt },
      );
      if (error) throw error;
      return data as Receipt;
    },
  });
  async function cancel() {
    if (!window.confirm("Cancel this appointment request?")) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await getSupabase().rpc("cancel_guest_appointment", {
        p_receipt: receipt,
      });
      if (error) throw error;
      await query.refetch();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hub-page guest-receipt">
      <Link href="/psychologists" className="text-action">
        <ArrowLeft size={16} />
        Find care
      </Link>
      <header className="page-heading">
        <span className="eyebrow">
          <LockKeyhole size={16} /> YOUR PRIVATE APPOINTMENT
        </span>
        <h1>A little space, just for you.</h1>
        <p>
          No community profile is needed. This private link is your way back to
          your request.
        </p>
      </header>
      {!ready || (receipt.length === 72 && query.isPending) ? (
        <p role="status">Loading your request…</p>
      ) : receipt.length !== 72 ? (
        <p role="alert">
          Open the full private link saved when you requested your appointment.
        </p>
      ) : query.isError ? (
        <div role="alert">
          We couldn’t open this appointment link.{" "}
          <button onClick={() => query.refetch()}>Try again</button>
        </div>
      ) : (
        query.data && (
          <section className="guest-receipt-card">
            <span className={`care-status ${query.data.status}`}>
              {query.data.status === "pending"
                ? "Awaiting provider confirmation"
                : query.data.status}
            </span>
            <h2>{query.data.provider}</h2>
            <p>
              {new Date(query.data.booking_time).toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
            <p>
              {query.data.status === "pending"
                ? "Your preferred time has been requested. It is not confirmed until the provider accepts."
                : query.data.status === "confirmed"
                  ? "Your appointment has been accepted by the provider."
                  : "This request has been cancelled."}
            </p>
            <div className="guest-receipt-actions">
              <button
                className="wellness-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                  } catch {
                    setError(
                      "Copy the full address from your browser to save your link.",
                    );
                  }
                }}
              >
                <Copy size={16} />
                {copied ? "Private link copied" : "Copy private status link"}
              </button>
              {query.data.status !== "cancelled" && (
                <button
                  className="text-action"
                  disabled={busy}
                  onClick={cancel}
                >
                  {busy ? "Cancelling…" : "Cancel request"}
                </button>
              )}
            </div>
            <small>
              Keep this link private: anyone with it can view or cancel this
              request. Status updates appear here; an email confirmation is not
              sent. Check back before your preferred time.
            </small>
          </section>
        )
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

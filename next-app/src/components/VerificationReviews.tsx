"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
type Request = {
  id: number;
  user_id: string;
  method: string;
  evidence: string;
  created_at: string;
};
export function VerificationReviews() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requests = useQuery({
    queryKey: ["verification-reviews"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("verification_requests")
        .select("id,user_id,method,evidence,created_at")
        .eq("status", "pending")
        .order("created_at")
        .limit(20);
      if (error) throw error;
      return data as Request[];
    },
  });
  async function review(id: number, approve: boolean, reason: string) {
    setBusy(true);
    setError("");
    try {
      const { error } = await getSupabase().rpc("review_verification", {
        p_request: id,
        p_approve: approve,
        p_reason: reason,
      });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["verification-reviews"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="verification-reviews">
      <h3>Verification requests</h3>
      <p>
        Check the person’s name and organisation before approving. Proof is
        removed after review.
      </p>
      {requests.isPending ? (
        <p>Loading requests…</p>
      ) : requests.error ? (
        <p role="alert">{requests.error.message}</p>
      ) : requests.data?.length ? (
        requests.data.map((r) => (
          <article key={r.id} className="verify-card">
            <strong>{r.method.replaceAll("_", " ")}</strong>
            <p>Member: {r.user_id}</p>
            {r.method === "linkedin" ? (
              <a href={r.evidence} target="_blank" rel="noopener noreferrer">
                Open LinkedIn profile ↗
              </a>
            ) : (
              <img
                src={r.evidence}
                alt="Private verification proof"
                style={{
                  maxWidth: "100%",
                  maxHeight: 280,
                  objectFit: "contain",
                }}
              />
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void review(r.id, false, String(form.get("reason") || ""));
              }}
            >
              <label className="field-label">
                Reason if rejected
                <input name="reason" maxLength={500} required />
              </label>
              <div className="page-links">
                <button
                  type="button"
                  className="wellness-button"
                  disabled={busy}
                  onClick={() => review(r.id, true, "")}
                >
                  Approve
                </button>
                <button className="text-action" disabled={busy}>
                  Reject with reason
                </button>
              </div>
            </form>
          </article>
        ))
      ) : (
        <p>No requests waiting for review.</p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

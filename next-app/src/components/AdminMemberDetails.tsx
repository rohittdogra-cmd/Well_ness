"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { memberDetails, activityLabels } from "@/lib/adminMembers";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { profileIsComplete } from "@/lib/profileCompletion";
export function AdminMemberDetails({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { user } = useInternetIdentity();
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["admin-member", id],
    enabled: !!id,
    queryFn: () => memberDetails(id!),
  });
  const d = query.data;
  async function change() {
    setError("");
    setBusy(true);
    try {
      const { error } = await getSupabase().rpc("admin_set_suspension", {
        p_user: id,
        p_suspend: !d?.suspension,
        p_reason: reason,
      });
      if (error) throw error;
      setReason("");
      setConfirmation("");
      await qc.invalidateQueries({ queryKey: ["admin-member", id] });
      await qc.invalidateQueries({ queryKey: ["admin-metrics"] });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not update this account",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={!!id}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="admin-detail-dialog">
        <DialogHeader>
          <DialogTitle>{d?.profile.name || "Member details"}</DialogTitle>
          <DialogDescription>
            Profile choices and community participation. Private conversations
            and anonymous post identities are not included.
          </DialogDescription>
        </DialogHeader>
        {query.isPending ? (
          <p role="status">Loading member…</p>
        ) : query.error ? (
          <p role="alert">{query.error.message}</p>
        ) : (
          d && (
            <>
              <dl>
                <dt>Account</dt>
                <dd>{d.profile.id}</dd>
                <dt>Registered</dt>
                <dd>{new Date(d.profile.created_at).toLocaleDateString()}</dd>
                <dt>Profile</dt>
                <dd>
                  {profileIsComplete(d.profile)
                    ? "Complete"
                    : "Incomplete — setup required"}
                </dd>
                <dt>Status</dt>
                <dd>{d.suspension ? "Suspended" : "Active account"}</dd>
                <dt>About</dt>
                <dd>{d.profile.bio || "Not provided"}</dd>
                <dt>Interests</dt>
                <dd>{d.profile.interests.join(", ") || "Not chosen"}</dd>
                <dt>Availability</dt>
                <dd>{d.profile.availability.join(", ") || "Not chosen"}</dd>
                <dt>Goal</dt>
                <dd>{d.profile.goal || "Not chosen"}</dd>
              </dl>
              <h3>Joined groups</h3>
              <ul>
                {d.groups.map((g) => (
                  <li key={g.group_id}>
                    <Link href={`/groups/${g.groups.slug}`}>
                      {g.groups.name} ↗
                    </Link>
                  </li>
                ))}
              </ul>
              {!d.groups.length && <p>No groups joined.</p>}
              <small>Up to 100 memberships.</small>
              <h3>Activities created</h3>
              <ul>
                {d.created.map((s) => (
                  <li key={s.id}>
                    <Link href={`/sessions/${s.id}`}>{s.title} ↗</Link>
                    <small>{new Date(s.date_time).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
              {!d.created.length && <p>No activities created.</p>}
              <h3>Activities joined</h3>
              <ul>
                {d.joined
                  .filter((j) => j.sessions)
                  .map((j) => (
                    <li key={j.sessions.id}>
                      <Link href={`/sessions/${j.sessions.id}`}>
                        {j.sessions.title} ↗
                      </Link>
                      <small>
                        {new Date(j.sessions.date_time).toLocaleString()}
                      </small>
                    </li>
                  ))}
              </ul>
              {!d.joined.length && <p>No current activity memberships.</p>}
              <small>
                Up to 50 created activities and 50 current activity memberships.
              </small>
              <h3>Recent participation</h3>
              <ul>
                {d.logs.map((l) => (
                  <li key={l.id}>
                    {activityLabels[l.activity_type] || l.activity_type} ·
                    reference #{l.related_id}
                    <small>{new Date(l.created_at).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
              {!d.logs.length && <p>No participation recorded.</p>}
              <small>Latest 50 records.</small>
              {user?.id !== id && (
                <form
                  className="admin-management-card admin-danger"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void change();
                  }}
                >
                  <h3>
                    {d.suspension
                      ? "Restore account access"
                      : "Suspend account"}
                  </h3>
                  <p>
                    {d.suspension
                      ? `Reason: ${d.suspension.reason}`
                      : "Suspension blocks protected community access and can be reversed. Administrator accounts are protected."}
                  </p>
                  {!d.suspension && (
                    <>
                      <label htmlFor="suspend-reason">Reason</label>
                      <textarea
                        id="suspend-reason"
                        disabled={busy}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        minLength={5}
                        maxLength={500}
                      />
                    </>
                  )}
                  <label htmlFor="suspend-confirm">
                    Type {d.suspension ? "RESTORE" : "SUSPEND"} to confirm
                  </label>
                  <input
                    id="suspend-confirm"
                    disabled={busy}
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    required
                  />
                  {error && <p role="alert">{error}</p>}
                  <button
                    className="wellness-button"
                    disabled={
                      busy ||
                      confirmation !== (d.suspension ? "RESTORE" : "SUSPEND")
                    }
                  >
                    {busy
                      ? "Updating…"
                      : d.suspension
                        ? "Restore access"
                        : "Suspend account"}
                  </button>
                </form>
              )}
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

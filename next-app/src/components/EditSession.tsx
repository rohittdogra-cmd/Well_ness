"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@/backend.types";
import { participantCount } from "@/lib/session";
import { rpc } from "@/lib/backend";
import { toast } from "sonner";
export function EditSession({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const d = new Date(Number(session.dateTime / 1_000_000n));
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  return (
    <div className="session-editor">
      <button
        className="text-action"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Edit session
      </button>
      {open && (
        <form
          className="composer mt-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setBusy(true);
            try {
              await rpc("update_session", {
                p_session: session.id.toString(),
                p_title: String(f.get("title")).trim(),
                p_description: String(f.get("description")),
                p_date: new Date(String(f.get("date"))).toISOString(),
                p_capacity: Number(f.get("capacity")),
                p_location: String(f.get("location")),
              });
              await Promise.all([
                qc.invalidateQueries({ queryKey: ["session"] }),
                qc.invalidateQueries({ queryKey: ["sessions"] }),
                qc.invalidateQueries({ queryKey: ["my-sessions"] }),
              ]);
              setOpen(false);
              toast.success(
                "Session updated. Participants will see an update in their notifications.",
              );
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Could not update session",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field-label">
            Title
            <input
              name="title"
              defaultValue={session.title}
              minLength={3}
              maxLength={100}
              required
            />
          </label>
          <label className="field-label">
            Description
            <textarea
              name="description"
              defaultValue={session.description}
              maxLength={3000}
            />
          </label>
          <label className="field-label">
            Date and time
            <input
              type="datetime-local"
              name="date"
              defaultValue={local}
              required
            />
          </label>
          <label className="field-label">
            Capacity, including you
            <input
              type="number"
              name="capacity"
              min={Math.max(1, participantCount(session))}
              max={200}
              defaultValue={Number(session.maxParticipants)}
              required
            />
          </label>
          <label className="field-label">
            Location
            <input
              name="location"
              defaultValue={session.location}
              maxLength={200}
            />
          </label>
          <div className="composer-actions">
            <button
              type="button"
              className="text-action"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button className="wellness-button" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

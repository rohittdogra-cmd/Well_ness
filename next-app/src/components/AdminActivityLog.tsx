"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminActivityLog, activityLabels } from "@/lib/adminMembers";
export function AdminActivityLog({
  onMember,
}: {
  onMember: (id: string) => void;
}) {
  const q = useQuery({
    queryKey: ["admin-activity-details"],
    queryFn: adminActivityLog,
  });
  const [filter, setFilter] = useState("all");
  return (
    <section className="admin-members-card">
      <h2 className="text-2xl">Activity history</h2>
      <p>
        Latest 200 records. Select a member to see their profile and
        participation.
      </p>
      <label>
        Activity type{" "}
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All activities</option>
          {Object.entries(activityLabels).map(([k, v]) => (
            <option value={k} key={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      {q.isPending ? (
        <p>Loading activity…</p>
      ) : q.error ? (
        <p role="alert">{q.error.message}</p>
      ) : (
        <div className="admin-member-table-wrap">
          <table className="admin-member-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Member</th>
                <th>Related activity</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {q.data
                .filter((l) => filter === "all" || l.activity_type === filter)
                .map((l) => (
                  <tr key={l.id}>
                    <td>
                      {activityLabels[l.activity_type] || l.activity_type}
                    </td>
                    <td>
                      <button
                        className="admin-member-link"
                        onClick={() => onMember(l.user_id)}
                      >
                        {l.name}
                      </button>
                      <small className="block">{l.user_id.slice(0, 8)}…</small>
                    </td>
                    <td>
                      {l.activity_type.startsWith("session") &&
                      !l.related.startsWith("Deleted") ? (
                        <Link href={`/sessions/${l.related_id}`}>
                          {l.related} ↗
                        </Link>
                      ) : (
                        l.related
                      )}
                    </td>
                    <td>{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!q.data.length && <p>No activity recorded.</p>}
        </div>
      )}
    </section>
  );
}

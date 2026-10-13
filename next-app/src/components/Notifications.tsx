"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { toast } from "sonner";
export function Notifications() {
  const { user } = useInternetIdentity();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id || "anon"],
    refetchInterval: 10000,
    queryFn: async () => {
      const { isConfigured, getSupabase } = await import("@/lib/supabase/client");
      const { getStoredNotifications } = await import("@/lib/liveDataManager");
      if (!isConfigured()) {
        return getStoredNotifications();
      }
      try {
        const { data, error } = await getSupabase()
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30);
        if (!error && Array.isArray(data)) return data;
      } catch {
        // fallback
      }
      return getStoredNotifications();
    },
  });

  const unreadCount = useQuery({
    queryKey: ["notifications", "unread", user?.id || "anon"],
    refetchInterval: 10000,
    queryFn: async () => {
      const { isConfigured, getSupabase } = await import("@/lib/supabase/client");
      const { getStoredNotifications } = await import("@/lib/liveDataManager");
      if (!isConfigured()) {
        return getStoredNotifications().filter((n) => !n.read).length;
      }
      try {
        const { count, error } = await getSupabase()
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("read", false);
        if (!error && typeof count === "number") return count;
      } catch {
        // fallback
      }
      return getStoredNotifications().filter((n) => !n.read).length;
    },
  });

  const unread = unreadCount.data ?? 0;

  return (
    <div className="notifications">
      <button
        className="notification-toggle"
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} />
        {unread > 0 && <span>{unread}</span>}
      </button>
      {open && (
        <section className="notification-panel" aria-label="Notifications">
          <div className="feed-heading" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2>Updates for you</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {unread > 0 && (
                <button
                  type="button"
                  className="text-action"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                  onClick={async () => {
                    const { markAllNotificationsRead } = await import("@/lib/liveDataManager");
                    markAllNotificationsRead();
                    void qc.invalidateQueries({ queryKey: ["notifications"] });
                    toast.success("All marked as read");
                  }}
                >
                  Mark all read
                </button>
              )}
              <button
                aria-label="Close notifications"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          {query.error ? (
            <p role="alert">Could not load updates.</p>
          ) : query.isPending ? (
            <p>Loading…</p>
          ) : !query.data?.length ? (
            <p>
              You’re all caught up. Circle enrollments and conversations will appear
              here.
            </p>
          ) : (
            query.data.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                className={n.read ? "" : "unread"}
                onClick={async () => {
                  setOpen(false);
                  const { isConfigured, getSupabase } = await import("@/lib/supabase/client");
                  const { markNotificationRead } = await import("@/lib/liveDataManager");
                  markNotificationRead(n.id);
                  if (isConfigured()) {
                    try {
                      await getSupabase()
                        .from("notifications")
                        .update({ read: true })
                        .eq("id", n.id);
                    } catch {}
                  }
                  void qc.invalidateQueries({ queryKey: ["notifications"] });
                }}
              >
                {n.message}
              </Link>
            ))
          )}
        </section>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Bell } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { toast } from "sonner";
export function Notifications() {
  const { user } = useInternetIdentity();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as {
        id: number;
        message: string;
        href: string;
        read: boolean;
      }[];
    },
  });
  const unread = query.data?.filter((n) => !n.read).length ?? 0;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="notifications">
        <PopoverTrigger asChild>
          <button
            className="notification-toggle"
            aria-label={`Notifications, ${unread} unread`}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Bell size={20} />
            {unread > 0 && <span>{unread}</span>}
          </button>
        </PopoverTrigger>
        {open && (
          <PopoverContent align="end" className="notification-popover">
            <section className="notification-panel" aria-label="Notifications">
              <div className="feed-heading">
                <h2>Updates for you</h2>
                <button
                  aria-label="Close notifications"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              {query.error ? (
                <p role="alert">Could not load updates.</p>
              ) : query.isPending ? (
                <p>Loading…</p>
              ) : !query.data?.length ? (
                <p>
                  You’re all caught up. Replies and session changes will appear
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
                      const { error } = await getSupabase()
                        .from("notifications")
                        .update({ read: true })
                        .eq("id", n.id);
                      if (error) toast.error(error.message);
                      else
                        void qc.invalidateQueries({
                          queryKey: ["notifications"],
                        });
                    }}
                  >
                    {n.message}
                  </Link>
                ))
              )}
            </section>
          </PopoverContent>
        )}
      </div>
    </Popover>
  );
}

"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Users,
  CalendarDays,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useLocalProfile } from "@/hooks/useLocalProfile";
export function HomeReturnPanel() {
  const { user } = useInternetIdentity();
  const profile = useLocalProfile();
  const query = useQuery({
    queryKey: ["member-overview", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [groups, sessions, bookings] = await Promise.all([
        getSupabase()
          .from("groups")
          .select("id,name,slug,group_members(user_id)"),
        getSupabase()
          .from("sessions")
          .select("id,title,date_time,creator,session_members(user_id)")
          .gte("date_time", new Date().toISOString())
          .order("date_time"),
        getSupabase()
          .from("provider_bookings")
          .select("id,booking_time,confirmed,providers(name)")
          .eq("user_id", user!.id)
          .gte("booking_time", new Date().toISOString())
          .order("booking_time"),
      ]);
      for (const result of [groups, sessions, bookings])
        if (result.error) throw new Error(result.error.message);
      return {
        groups: (groups.data ?? []).filter((g) =>
          g.group_members.some((m) => m.user_id === user!.id),
        ),
        sessions: (sessions.data ?? []).filter(
          (s) =>
            s.creator === user!.id ||
            s.session_members.some((m) => m.user_id === user!.id),
        ),
        bookings: bookings.data ?? [],
      };
    },
  });
  const data = query.data;
  const group = data?.groups[0];
  const session = data?.sessions[0];
  const booking = data?.bookings[0];
  const when = (time: string) =>
    new Date(time).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  return (
    <section className="return-panel" aria-labelledby="return-title">
      <header>
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> YOUR LITTLE CORNER
          </span>
          <h2 id="return-title">
            Good to have you back
            {profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}.
          </h2>
          <p>Less searching. More of what you came for.</p>
        </div>
        <Link href="/profile" className="text-action">
          Your hub at a glance <ArrowUpRight size={17} />
        </Link>
      </header>
      {query.isError ? (
        <div role="alert" className="return-error">
          Your plans couldn’t load.{" "}
          <button className="text-action" onClick={() => query.refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="return-grid" aria-busy={query.isPending}>
          <Link href={group ? `/groups/${group.slug}` : "/groups"}>
            <span className="return-icon">
              <Users size={21} />
            </span>
            <small>YOUR CIRCLES</small>
            <h3>
              {query.isPending
                ? "Loading your groups…"
                : group?.name || "Find your first circle"}
            </h3>
            <p>
              {group
                ? `${data!.groups.length} joined ${data!.groups.length === 1 ? "group" : "groups"} · Jump back into the conversation`
                : "A shared interest is a lovely place to start."}
            </p>
            <span className="return-link">
              {group ? "Open your group" : "Explore groups"}
              <ArrowUpRight size={17} />
            </span>
          </Link>
          <Link href={session ? `/sessions/${session.id}` : "/book-activities"}>
            <span className="return-icon peach">
              <CalendarDays size={21} />
            </span>
            <small>YOUR NEXT GOOD THING</small>
            <h3>
              {query.isPending
                ? "Loading your plans…"
                : session?.title || "Make a little plan"}
            </h3>
            <p>
              {session
                ? when(session.date_time)
                : "A walk, a game, or a moment away from your desk."}
            </p>
            <span className="return-link">
              {session ? "View your activity" : "Find an activity"}
              <ArrowUpRight size={17} />
            </span>
          </Link>
          <Link href={booking ? "/profile?view=bookings" : "/psychologists"}>
            <span className="return-icon lilac">
              <HeartHandshake size={21} />
            </span>
            <small>SPACE TO TALK</small>
            <h3>
              {query.isPending
                ? "Loading your appointments…"
                : booking
                  ? "Your next appointment"
                  : "Support, on your terms"}
            </h3>
            <p>
              {booking
                ? `${when(booking.booking_time)} · ${booking.confirmed ? "Confirmed" : "Awaiting confirmation"}`
                : "Private appointment requests with approved care providers."}
            </p>
            <span className="return-link">
              {booking ? "Manage appointment" : "Explore private care"}
              <ArrowUpRight size={17} />
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}

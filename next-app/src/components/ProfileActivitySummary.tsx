"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  MessageCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Mascot } from "./Mascot";

type SessionRow = {
  id: number;
  title: string;
  creator: string;
  date_time: string;
  location?: string;
  session_members: { user_id: string }[];
};
type GroupRow = {
  id: number;
  name: string;
  slug: string;
  group_members: { user_id: string }[];
};
type Connection = { id: number; status: string; name: string; avatar: number };
type Booking = {
  id: number;
  user_id: string;
  provider_id: number;
  booking_time: string;
  confirmed: boolean;
};
type View = "activities" | "past" | "groups" | "people" | "bookings";
const views = [
  { id: "activities", name: "Activities", icon: CalendarDays },
  { id: "past", name: "Past events", icon: Clock },
  { id: "groups", name: "Groups", icon: Users },
  { id: "people", name: "Connections", icon: MessageCircle },
  { id: "bookings", name: "Bookings", icon: CalendarDays },
] as const;
export function ProfileActivitySummary() {
  const { user } = useInternetIdentity();
  const [view, setView] = useState<View>("activities");
  const [sort, setSort] = useState("date");
  const sessions = useQuery({
    queryKey: ["sessions", "profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("sessions")
        .select("id,title,creator,date_time,location,session_members(user_id)")
        .order("date_time");
      if (error) throw error;
      return (data as SessionRow[]).filter(
        (s) =>
          s.creator === user!.id ||
          s.session_members.some((m) => m.user_id === user!.id),
      );
    },
  });
  const groups = useQuery({
    queryKey: ["groups", "profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("groups")
        .select("id,name,slug,group_members(user_id)")
        .order("name");
      if (error) throw error;
      return (data as GroupRow[]).filter((g) =>
        g.group_members.some((m) => m.user_id === user!.id),
      );
    },
  });
  const people = useQuery({
    queryKey: ["connections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("list_connections");
      if (error) throw error;
      return data as Connection[];
    },
  });
  const bookings = useQuery({
    queryKey: ["bookings", "profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("provider_bookings")
        .select("id,user_id,provider_id,booking_time,confirmed")
        .eq("user_id", user!.id)
        .order("booking_time");
      if (error) throw error;
      return (data as Booking[]).filter((b) => b.user_id === user!.id);
    },
  });
  const [now] = useState(() => Date.now());
  const upcoming = (sessions.data ?? []).filter(
    (s) => new Date(s.date_time).getTime() >= now,
  );
  const past = (sessions.data ?? []).filter(
    (s) => new Date(s.date_time).getTime() < now,
  );
  const accepted = (people.data ?? []).filter((p) => p.status === "accepted");
  const counts = {
    activities: sessions.isSuccess ? upcoming.length : null,
    past: sessions.isSuccess ? past.length : null,
    groups: groups.isSuccess ? groups.data.length : null,
    people: people.isSuccess ? accepted.length : null,
    bookings: bookings.isSuccess ? bookings.data.length : null,
  };
  const query =
    view === "groups"
      ? groups
      : view === "people"
        ? people
        : view === "bookings"
          ? bookings
          : sessions;
  const date = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const rows =
    view === "groups"
      ? (groups.data ?? []).map((g) => ({
          id: g.id,
          title: g.name,
          detail: "Joined group",
          href: `/groups/${g.slug}`,
          time: 0,
          avatar: undefined as number | undefined,
        }))
      : view === "people"
        ? accepted.map((p) => ({
            id: p.id,
            title: p.name || "Community member",
            detail: "Connected · Open your conversations",
            href: `/people?connection=${p.id}`,
            time: 0,
            avatar: p.avatar,
          }))
        : view === "bookings"
          ? (bookings.data ?? []).map((b) => ({
              id: b.id,
              title: `Appointment #${b.id}`,
              detail: `${date(b.booking_time)} · ${b.confirmed ? "Confirmed" : "Awaiting confirmation"}`,
              href: "/psychologists",
              time: new Date(b.booking_time).getTime(),
              avatar: undefined as number | undefined,
            }))
          : (view === "past" ? past : upcoming).map((s) => ({
              id: s.id,
              title: s.title,
              detail: `${date(s.date_time)}${s.location ? ` · ${s.location}` : ""} · ${s.creator === user?.id ? "Hosting" : "Enrolled"}`,
              href: `/sessions/${s.id}`,
              time: new Date(s.date_time).getTime(),
              avatar: undefined as number | undefined,
            }));
  rows.sort((a, b) =>
    sort === "name"
      ? a.title.localeCompare(b.title)
      : view === "past"
        ? b.time - a.time
        : a.time - b.time,
  );
  const empty = {
    activities: [
      "No upcoming activities yet.",
      "Find an activity",
      "/book-activities",
    ],
    past: [
      "Your past enrolled events will appear here.",
      "Explore activities",
      "/book-activities",
    ],
    groups: [
      "Your circle starts with one shared interest.",
      "Explore groups",
      "/groups",
    ],
    people: [
      "Your accepted connections will appear here.",
      "Meet people",
      "/people",
    ],
    bookings: [
      "No appointment bookings yet.",
      "Explore care providers",
      "/psychologists",
    ],
  };
  return (
    <section
      className="profile-activity"
      aria-labelledby="activity-summary-title"
    >
      <div className="compact-heading">
        <div>
          <span className="eyebrow">ALL IN ONE PLACE</span>
          <h2 id="activity-summary-title">Your hub, at a glance</h2>
        </div>
      </div>
      <div
        className="activity-summary-tabs"
        role="group"
        aria-label="Activity categories"
      >
        {views.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={view === item.id}
            onClick={() => {
              setView(item.id);
              setSort(
                item.id === "groups" || item.id === "people" ? "name" : "date",
              );
            }}
          >
            <item.icon size={17} />
            <strong>{counts[item.id] ?? "—"}</strong>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div className="activity-list-heading">
        <h3>{views.find((v) => v.id === view)?.name}</h3>
        <label>
          Sort{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {view !== "groups" && view !== "people" && (
              <option value="date">
                {view === "past" ? "Most recent" : "Soonest first"}
              </option>
            )}
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>
      {view === "past" && (
        <p className="activity-note">
          Your past registrations and hosted events. Attendance is not tracked.
        </p>
      )}
      {query.isPending ? (
        <p role="status" className="activity-empty">
          Loading your {view}…
        </p>
      ) : query.isError ? (
        <div role="alert" className="activity-empty">
          Couldn’t load this list.{" "}
          <button className="text-action" onClick={() => query.refetch()}>
            Try again
          </button>
        </div>
      ) : rows.length ? (
        <ul className="member-activity-list">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={row.href}>
                {row.avatar !== undefined && (
                  <span className="connection-avatar">
                    <Mascot variant={row.avatar} />
                  </span>
                )}
                <span>
                  <strong>{row.title}</strong>
                  <small>{row.detail}</small>
                </span>
                <ArrowUpRight size={17} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="activity-empty">
          <p>{empty[view][0]}</p>
          <Link className="text-action" href={empty[view][2]}>
            {empty[view][1]} →
          </Link>
        </div>
      )}
    </section>
  );
}

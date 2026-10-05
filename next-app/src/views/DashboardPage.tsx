"use client";

import { OperationsPanel } from "../components/OperationsPanel";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart2,
  BookMarked,
  CalendarDays,
  Clock,
  Loader2,
  LogIn,
  MessageCircle,
  Pencil,
  Save,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { SessionCard, SessionCardSkeleton } from "../components/SessionCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  ActivityLogType,
  useActivityLogsForUser,
  useIsAdmin,
  useMyBookings,
  useMySessions,
  useSaveUserProfile,
  useUserProfile,
} from "../hooks/useQueries";
import {
  acceptedConnections,
  pendingForYou,
  pendingFromYou,
  useMyConnections,
  useRespondToConnection,
} from "../hooks/useConnections";
import { useGroups } from "../hooks/useCommunity";
import { moodLabel, moodWeight, useMoodWeek } from "../hooks/useMood";
import { AdminDashboardView } from "./AdminDashboardPage";

const LOADING_SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d"];

const ACTIVITY_LOG_LABELS: Record<ActivityLogType, string> = {
  [ActivityLogType.sessionCreated]: "Session Created",
  [ActivityLogType.sessionJoined]: "Session Joined",
  [ActivityLogType.sessionLeft]: "Session Left",
  [ActivityLogType.taskCreated]: "Task Created",
  [ActivityLogType.taskCompleted]: "Task Completed",
  [ActivityLogType.providerBooked]: "Provider Booked",
};

const ACTIVITY_LOG_COLORS: Record<ActivityLogType, string> = {
  [ActivityLogType.sessionCreated]:
    "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  [ActivityLogType.sessionJoined]:
    "bg-blue-500/15 text-blue-700 border-blue-200",
  [ActivityLogType.sessionLeft]:
    "bg-orange-500/15 text-orange-700 border-orange-200",
  [ActivityLogType.taskCreated]:
    "bg-purple-500/15 text-purple-700 border-purple-200",
  [ActivityLogType.taskCompleted]:
    "bg-teal-500/15 text-teal-700 border-teal-200",
  [ActivityLogType.providerBooked]:
    "bg-rose-500/15 text-rose-700 border-rose-200",
};

function formatTs(ns: bigint) {
  return new Date(Number(ns / 1_000_000n)).toLocaleString();
}

type QuickAction = {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  ocid: string;
} & (
  | { kind: "programs"; type: string }
  | {
      kind: "link";
      href:
        | "/psychologists"
        | "/membership"
        | "/my-sessions"
        | "/dashboard"
        | "/about"
        | "/contact"
        | "/careers"
        | "/coming-soon"
        | "/signin";
    }
);

const quickActions: QuickAction[] = [
  {
    icon: Users,
    label: "Browse Programs",
    description: "Explore all wellness programs",
    kind: "programs",
    type: "meetup",
    color: "bg-emerald-500/10 text-emerald-600",
    ocid: "dashboard.programs_link",
  },
  {
    icon: Stethoscope,
    label: "Book Psychologist",
    description: "Schedule a confidential session",
    kind: "link",
    href: "/psychologists",
    color: "bg-blue-500/10 text-blue-600",
    ocid: "dashboard.psychologists_link",
  },
  {
    icon: MessageCircle,
    label: "Join Discussion",
    description: "Anonymous peer conversations",
    kind: "link",
    href: "/my-sessions",
    color: "bg-purple-500/10 text-purple-600",
    ocid: "dashboard.discuss_link",
  },
  {
    icon: Zap,
    label: "View Membership",
    description: "Manage your plan and billing",
    kind: "link",
    href: "/membership",
    color: "bg-amber-500/10 text-amber-600",
    ocid: "dashboard.membership_link",
  },
];

function QuickActionLink({ action }: { action: QuickAction }) {
  const inner = (
    <>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.color}`}
      >
        <action.icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
          {action.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {action.description}
        </p>
      </div>
    </>
  );
  const cls =
    "flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group";
  if (action.kind === "programs") {
    return (
      <Link
        href={`/programs/${action.type}`}
        data-ocid={action.ocid}
        className={cls}
      >
        {inner}
      </Link>
    );
  }
  return (
    <Link href={action.href} data-ocid={action.ocid} className={cls}>
      {inner}
    </Link>
  );
}

export function DashboardPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: mySessions, isLoading: sessionsLoading } = useMySessions();
  const memberId = isAuthenticated
    ? identity.getPrincipal().toString()
    : undefined;
  const { data: activityLogs, isLoading: logsLoading } = useActivityLogsForUser(
    isAuthenticated ? identity.getPrincipal() : null,
  );
  const { data: connections, isLoading: connectionsLoading } =
    useMyConnections();
  const respond = useRespondToConnection();
  const { data: myGroups } = useGroups({ joinedOnly: true });
  const { data: moodWeek } = useMoodWeek(memberId);
  const { data: myBookings, isLoading: bookingsLoading } = useMyBookings(
    isAuthenticated ? identity.getPrincipal() : null,
  );
  const saveProfileMutation = useSaveUserProfile();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
          data-ocid="dashboard.error_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-3">
            Sign in to view your dashboard
          </h2>
          <p className="text-muted-foreground mb-6">
            Your personal wellness dashboard tracks sessions, progress, and
            bookings. Sign in to get started.
          </p>
          <Button
            size="lg"
            className="rounded-xl"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="dashboard.primary_button"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            Sign In
          </Button>
        </motion.div>
      </main>
    );
  }

  if (adminLoading) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="space-y-6" data-ocid="dashboard.loading_state">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LOADING_SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (isAdmin === true) {
    return <><AdminDashboardView /><OperationsPanel /></>;
  }

  const createdSessions = mySessions?.[0] ?? [];
  const joinedSessions = mySessions?.[1] ?? [];
  const allMySessions = [
    ...new Map(
      [...createdSessions, ...joinedSessions].map((s) => [s.id.toString(), s]),
    ).values(),
  ].sort((a, b) => Number(a.dateTime - b.dateTime));

  // Split by now, then take what is actually next. Taking the first three of an
  // ascending list showed the oldest sessions, which is the opposite of useful
  // on a "what is next" dashboard.
  const now = Date.now();
  const upcomingSessions = allMySessions
    .filter((s) => Number(s.dateTime / 1_000_000n) > now)
    .slice(0, 3);

  const incoming = pendingForYou(connections, memberId);
  const outgoing = pendingFromYou(connections, memberId);
  const openThreads = acceptedConnections(connections, memberId);

  const recentLogs = [...(activityLogs ?? [])]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 10);

  const recentBookings = [...(myBookings ?? [])]
    .sort((a, b) => Number(b.bookingTime - a.bookingTime))
    .slice(0, 5);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await saveProfileMutation.mutateAsync({ name: nameInput.trim() });
      toast.success("Profile updated!");
      setEditingName(false);
      setNameInput("");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <main
      className="min-h-screen bg-background pt-24 pb-16 px-4"
      data-ocid="dashboard.page"
    >
      <div className="container max-w-5xl mx-auto">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/20">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                {profileLoading ? (
                  <Skeleton className="h-9 w-64 mb-2" />
                ) : (
                  <h1 className="text-3xl font-display font-bold text-foreground mb-1">
                    Welcome back,{" "}
                    <span className="text-primary">
                      {profile?.name || "Wellness Member"}
                    </span>{" "}
                    👋
                  </h1>
                )}
                <p className="text-muted-foreground">
                  Here’s your wellness activity at a glance.
                </p>
              </div>
              {!profile?.name && !editingName && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setEditingName(true)}
                  data-ocid="dashboard.edit_button"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Set your name
                </Button>
              )}
              {profile?.name && !editingName && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-muted-foreground"
                  onClick={() => {
                    setNameInput(profile.name);
                    setEditingName(true);
                  }}
                  data-ocid="dashboard.edit_button"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
            {editingName && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 flex items-center gap-2 max-w-sm"
                data-ocid="dashboard.panel"
              >
                <Input
                  placeholder="Your display name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="rounded-xl"
                  autoFocus
                  data-ocid="dashboard.input"
                />
                <Button
                  size="sm"
                  className="rounded-xl flex-shrink-0"
                  onClick={handleSaveName}
                  disabled={saveProfileMutation.isPending || !nameInput.trim()}
                  data-ocid="dashboard.save_button"
                >
                  {saveProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setEditingName(false)}
                  data-ocid="dashboard.cancel_button"
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Sessions Created",
              value: sessionsLoading ? "—" : createdSessions.length,
              icon: CalendarDays,
            },
            {
              label: "Sessions Joined",
              value: sessionsLoading ? "—" : joinedSessions.length,
              icon: Users,
            },
            {
              label: "Total Wellness Hours",
              value: sessionsLoading ? "—" : allMySessions.length,
              icon: BarChart2,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              <Card data-ocid="dashboard.card">
                <CardContent className="p-4">
                  <stat.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.33 }}
          >
            <Link href="/psychologists" data-ocid="dashboard.psychologists_link">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <Stethoscope className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Quick Link</p>
                  <p className="text-lg font-bold text-foreground">
                    Psychologists
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        {/* Your people: pending requests and open conversations.
            This used to live only on the people page, so a request to talk was
            invisible until you went looking for it. */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Your people</CardTitle>
                <Link
                  href="/people"
                  className="text-xs text-primary hover:underline"
                  data-ocid="dashboard.link"
                >
                  Find more
                </Link>
              </CardHeader>
              <CardContent>
                {connectionsLoading ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    Loading who you are talking to…
                  </p>
                ) : (
                  <div className="space-y-5">
                    {incoming.length > 0 && (
                      <section aria-labelledby="dash-incoming">
                        <h2
                          id="dash-incoming"
                          className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"
                        >
                          Asked to talk to you
                          <Badge className="rounded-full">
                            {incoming.length}
                          </Badge>
                        </h2>
                        <ul className="space-y-2">
                          {incoming.map((c) => (
                            <li
                              key={c.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
                            >
                              <span className="font-medium text-sm">
                                {c.name} would like to connect
                              </span>
                              <span className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="rounded-xl"
                                  disabled={respond.isPending}
                                  onClick={() =>
                                    respond.mutate({
                                      connectionId: c.id,
                                      accept: true,
                                    })
                                  }
                                  data-ocid="dashboard.accept_connection"
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-xl"
                                  disabled={respond.isPending}
                                  onClick={() =>
                                    respond.mutate({
                                      connectionId: c.id,
                                      accept: false,
                                    })
                                  }
                                >
                                  Decline
                                </Button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {openThreads.length > 0 ? (
                      <section aria-labelledby="dash-threads">
                        <h2
                          id="dash-threads"
                          className="text-sm font-semibold text-foreground mb-2"
                        >
                          Conversations you can open
                        </h2>
                        <ul className="space-y-2">
                          {openThreads.slice(0, 4).map((c) => (
                            <li key={c.id}>
                              <Link
                                href="/people"
                                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 hover:border-primary transition-colors"
                              >
                                <span className="font-medium text-sm">
                                  {c.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Open chat →
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {incoming.length === 0 && openThreads.length === 0 && (
                      <div
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="dashboard.empty_state"
                      >
                        <MessageCircle className="w-9 h-9 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">
                          No one waiting on you
                        </p>
                        <p className="text-xs mt-1">
                          When someone asks to talk, it shows up here first.
                        </p>
                      </div>
                    )}

                    {outgoing.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {outgoing.length}{" "}
                        {outgoing.length === 1
                          ? "request still waiting"
                          : "requests still waiting"}
                        .
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Private mood trend */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your week</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-end gap-1.5 h-24"
                  role="img"
                  aria-label={
                    moodWeek
                      ? `Mood over the last seven days: ${moodWeek
                          .map((d) => `${d.day.slice(5)} ${moodLabel(d.mood)}`)
                          .join(", ")}`
                      : "Mood over the last seven days"
                  }
                >
                  {(moodWeek ?? []).map((d) => {
                    const weight = moodWeight(d.mood);
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <span
                          className={
                            weight === 0
                              ? "w-full rounded-full bg-muted/30"
                              : "w-full rounded-full bg-primary"
                          }
                          style={{
                            height: `${Math.max(8, weight * 18)}px`,
                            opacity: weight === 0 ? 1 : 0.35 + weight * 0.13,
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {d.day.slice(8)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Only you can see this.{" "}
                  <Link href="/take-a-moment" className="text-primary hover:underline">
                    Take a moment
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Your groups */}
        {(myGroups?.pages.flat().length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                Your groups
              </h2>
              <Link
                href="/groups"
                className="text-xs text-primary hover:underline"
              >
                Browse all
              </Link>
            </div>
            <ul className="flex flex-wrap gap-2">
              {myGroups!.pages
                .flat()
                .slice(0, 6)
                .map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/groups/${g.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary transition-colors min-h-9"
                    >
                      {g.name}
                      <span className="text-xs text-muted-foreground">
                        {g.member_count}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action) => (
                  <QuickActionLink key={action.label} action={action} />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent sessions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">What you have coming up</CardTitle>
                <Link
                  href="/my-sessions"
                  className="text-xs text-primary hover:underline"
                  data-ocid="dashboard.link"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div
                    className="space-y-3"
                    data-ocid="dashboard.loading_state"
                  >
                    {["s1", "s2", "s3"].map((k) => (
                      <SessionCardSkeleton key={k} />
                    ))}
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="dashboard.empty_state"
                  >
                    <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      Nothing planned yet
                    </p>
                    <p className="text-xs mt-1">
                      Join or plan something to get started
                    </p>
                    <Link
                      href="/programs/meetup"
                     
                      data-ocid="dashboard.primary_button"
                    >
                      <Button size="sm" className="mt-4 rounded-xl">
                        Browse Programs
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((session, i) => (
                      <SessionCard
                        key={session.id.toString()}
                        session={session}
                        index={i}
                        showJoinLeave={false}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* My Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookMarked className="w-4 h-4 text-primary" />
                My Bookings
                {!bookingsLoading && recentBookings.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {myBookings?.length ?? 0} total
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-3" data-ocid="dashboard.loading_state">
                  {["b1", "b2", "b3"].map((k) => (
                    <Skeleton key={k} className="h-10 w-full" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="dashboard.empty_state"
                >
                  <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No bookings yet</p>
                  <p className="text-xs mt-1 mb-3">
                    Visit the Psychologists page to book a session.
                  </p>
                  <Link href="/psychologists" data-ocid="dashboard.link">
                    <Button size="sm" variant="outline" className="rounded-xl">
                      <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                      Book a Psychologist
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentBookings.map((booking, i) => (
                    <motion.div
                      key={booking.id.toString()}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/50 transition-colors"
                      data-ocid={`dashboard.item.${i + 1}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 flex-shrink-0" />
                      <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                        Provider #{booking.providerId.toString()}
                      </span>
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        {formatTs(booking.bookingTime)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${
                          booking.isConfirmed
                            ? "bg-emerald-500/15 text-emerald-700 border-emerald-200"
                            : "bg-amber-500/15 text-amber-700 border-amber-200"
                        }`}
                      >
                        {booking.isConfirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-primary" />
                My Activity
                {!logsLoading && recentLogs.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {recentLogs.length} recent
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3" data-ocid="dashboard.loading_state">
                  {["l1", "l2", "l3"].map((k) => (
                    <Skeleton key={k} className="h-10 w-full" />
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground"
                  data-ocid="dashboard.empty_state"
                >
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No activity recorded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log, i) => (
                    <motion.div
                      key={log.id.toString()}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-3 py-2"
                      data-ocid={`dashboard.item.${i + 1}`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${ACTIVITY_LOG_COLORS[log.activityType]}`}
                      >
                        {ACTIVITY_LOG_LABELS[log.activityType]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        ID #{log.relatedId.toString()}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTs(log.createdAt)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}



"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Shield,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Trophy,
  Users,
  X,
  Phone,
  PhoneCall,
  Building2,
  CalendarCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLiveAppointments } from "@/lib/liveDataManager";
import { csvDocument, downloadCsv } from "@/lib/csv";
import {
  getTurfBookings,
  verifyTurfBooking,
  type TurfBookingRequest,
} from "@/lib/turfVenues";
import { ActivityLogType, ProviderType } from "../backend.types";
import {
  useAdminStats,
  useAllActivityLogs,
  useAllBookings,
  useAllProviders,
  useAllUserProfilesAdmin,
  useApproveProvider,
  useRejectProvider,
} from "../hooks/useQueries";
import type {
  ProviderApplication,
  ProviderBooking,
  UserProfileEntry,
} from "../hooks/useQueries";
import {
  AuthorizedAdminsBanner,
  OffersManagementTab,
  DoctorManagementTab,
  GroupsFormationTab,
} from "./AdminLiveManagement";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { isAdminEmail } from "@/lib/authAccounts";

const PROGRAM_COLORS: Record<string, string> = {
  meetup: "bg-emerald-500",
  socialGathering: "bg-blue-500",
  exercise: "bg-orange-500",
  taskAllocation: "bg-purple-500",
  boxCricket: "bg-yellow-500",
  badminton: "bg-pink-500",
  tennis: "bg-cyan-500",
  pickleball: "bg-red-500",
};

const PROGRAM_LABELS: Record<string, string> = {
  meetup: "Mindfully Meetup",
  socialGathering: "Social Gathering",
  exercise: "Movement & Exercise",
  taskAllocation: "Task Allocation",
  boxCricket: "Box Cricket",
  badminton: "Badminton",
  tennis: "Tennis",
  pickleball: "Pickleball",
};

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

const STAT_SKELETON_KEYS = ["sk-stat-1", "sk-stat-2", "sk-stat-3", "sk-stat-4"];
const CHART_SKELETON_KEYS = [
  "sk-chart-1",
  "sk-chart-2",
  "sk-chart-3",
  "sk-chart-4",
];
const TABLE_SKELETON_KEYS = [
  "sk-row-1",
  "sk-row-2",
  "sk-row-3",
  "sk-row-4",
  "sk-row-5",
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="overflow-hidden border border-border/60 hover:shadow-md transition-all rounded-2xl bg-gradient-to-br from-card to-background shadow-xs">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-bold mb-1.5 uppercase tracking-wider">
                {label}
              </p>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium">{sub}</p>
              )}
            </div>
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs ${color}`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAllUserProfilesAdmin();

  const totalUsers = stats ? Number(stats.totalUsers) : 0;
  const totalSessions = stats ? Number(stats.totalSessions) : 0;
  const totalTasks = stats ? Number(stats.totalTasks) : 0;
  const completedTasks = stats ? Number(stats.completedTasks) : 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const sessionsByType = stats?.sessionsByType ?? [];
  const maxCount = sessionsByType.reduce(
    (m, [, c]) => Math.max(m, Number(c)),
    1,
  );

  const sortedUsers: UserProfileEntry[] = [...(users ?? [])].sort((a, b) => {
    const aTotal = Number(a.sessionsCreated) + Number(a.sessionsJoined);
    const bTotal = Number(b.sessionsCreated) + Number(b.sessionsJoined);
    return bTotal - aTotal;
  });

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          STAT_SKELETON_KEYS.map((k) => (
            <Card key={k}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Employees"
              value={totalUsers}
              sub="Registered users"
              color="bg-emerald-500/15 text-emerald-600"
              delay={0.1}
            />
            <StatCard
              icon={Activity}
              label="Total Sessions"
              value={totalSessions}
              sub="Across all programs"
              color="bg-blue-500/15 text-blue-600"
              delay={0.15}
            />
            <StatCard
              icon={ClipboardList}
              label="Total Tasks"
              value={totalTasks}
              sub={`${completedTasks} completed`}
              color="bg-purple-500/15 text-purple-600"
              delay={0.2}
            />
            <StatCard
              icon={CheckCircle2}
              label="Task Completion"
              value={`${completionRate}%`}
              sub={`${completedTasks} of ${totalTasks} tasks`}
              color="bg-amber-500/15 text-amber-600"
              delay={0.25}
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              Sessions by Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              CHART_SKELETON_KEYS.map((k) => (
                <div key={k} className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))
            ) : sessionsByType.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-6"
                data-ocid="admin.empty_state"
              >
                No session data yet
              </p>
            ) : (
              sessionsByType.map(([type, count]) => {
                const label = PROGRAM_LABELS[type] ?? type;
                const color = PROGRAM_COLORS[type] ?? "bg-gray-500";
                const pct = Math.round((Number(count) / maxCount) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {label}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {count.toString()}
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          delay: 0.4,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                icon: Activity,
                label: "View All Sessions",
                href: "/programs/meetup",
                color: "bg-emerald-500/10 text-emerald-600",
                ocid: "admin.sessions_link",
              },
              {
                icon: CreditCard,
                label: "Manage Memberships",
                href: "/membership",
                color: "bg-amber-500/10 text-amber-600",
                ocid: "admin.membership_link",
              },
              {
                icon: Stethoscope,
                label: "View Psychologists",
                href: "/psychologists",
                color: "bg-blue-500/10 text-blue-600",
                ocid: "admin.psychologists_link",
              },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                data-ocid={action.ocid}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.color}`}
                >
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1">
                  {action.label}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Employee Activity Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-primary" />
            Employee Activity
            {!usersLoading && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {sortedUsers.length} registered
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="p-6 space-y-3" data-ocid="admin.loading_state">
              {TABLE_SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : sortedUsers.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="admin.empty_state"
            >
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No employees registered yet</p>
              <p className="text-xs mt-1">
                Users will appear here once they sign in
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Employee</TableHead>
                    <TableHead className="text-center">
                      Sessions Created
                    </TableHead>
                    <TableHead className="text-center">
                      Sessions Joined
                    </TableHead>
                    <TableHead className="text-center pr-6">
                      Total Participation
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user, i) => {
                    const total =
                      Number(user.sessionsCreated) +
                      Number(user.sessionsJoined);
                    const userInitials = user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "?";
                    return (
                      <TableRow
                        key={user.principal.toString()}
                        data-ocid={`admin.row.${i + 1}`}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                              {userInitials}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {user.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                                {user.principal.toString().slice(0, 12)}…
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {user.sessionsCreated.toString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {user.sessionsJoined.toString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <Badge
                            className={`text-xs ${
                              total > 5
                                ? "bg-emerald-500/15 text-emerald-700 border-emerald-200"
                                : total > 2
                                  ? "bg-blue-500/15 text-blue-700 border-blue-200"
                                  : "bg-muted text-muted-foreground"
                            }`}
                            variant="outline"
                          >
                            {total}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Provider Review Tab ─────────────────────────────────────────
function ProviderCard({
  provider,
  onApprove,
  onReject,
  approvePending,
  rejectPending,
}: {
  provider: ProviderApplication;
  onApprove: (id: bigint) => void;
  onReject: (id: bigint) => void;
  approvePending: boolean;
  rejectPending: boolean;
}) {
  const isPsych = provider.providerType === ProviderType.psychologist;
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isPsych ? "bg-blue-500/10" : "bg-amber-500/10"
        }`}
      >
        {isPsych ? (
          <Stethoscope className="w-5 h-5 text-blue-600" />
        ) : (
          <Trophy className="w-5 h-5 text-amber-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-medium text-sm text-foreground">{provider.name}</p>
          <Badge
            variant="outline"
            className={`text-xs ${
              isPsych
                ? "border-blue-200 text-blue-700"
                : "border-amber-200 text-amber-700"
            }`}
          >
            {isPsych ? "Psychologist" : "Sports Company"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
          {provider.description}
        </p>
        <p className="text-xs text-muted-foreground">
          Submitted: {formatTs(provider.submittedAt)}
        </p>
      </div>
      {!provider.isApproved && !provider.isRejected && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            onClick={() => onApprove(provider.id)}
            disabled={approvePending}
            data-ocid="admin.confirm_button"
          >
            {approvePending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ThumbsUp className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => onReject(provider.id)}
            disabled={rejectPending}
            data-ocid="admin.delete_button"
          >
            {rejectPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      )}
      {provider.isApproved && (
        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 flex-shrink-0">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      )}
      {provider.isRejected && (
        <Badge
          variant="outline"
          className="text-destructive border-destructive/30 flex-shrink-0"
        >
          <X className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )}
    </div>
  );
}

function ProviderReviewTab() {
  const {
    providers: allProviders,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAllProviders();
  const approveMutation = useApproveProvider();
  const rejectMutation = useRejectProvider();

  const pending = allProviders.filter((p) => !p.isApproved && !p.isRejected);
  const approved = allProviders.filter((p) => p.isApproved);
  const rejected = allProviders.filter((p) => p.isRejected);

  const handleApprove = async (id: bigint) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Provider approved!");
    } catch {
      toast.error("Failed to approve provider");
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success("Provider rejected");
    } catch {
      toast.error("Failed to reject provider");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-amber-600">
              {isLoading ? "—" : pending.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Approved</p>
            <p className="text-3xl font-bold text-emerald-600">
              {isLoading ? "—" : approved.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Rejected</p>
            <p className="text-3xl font-bold text-destructive">
              {isLoading ? "—" : rejected.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="w-4 h-4 text-amber-600" />
            Pending Applications
            <Badge
              variant="outline"
              className="ml-auto text-amber-700 border-amber-200"
            >
              {pending.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" data-ocid="admin.loading_state">
              {["p1", "p2"].map((k) => (
                <Skeleton key={k} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="admin.empty_state"
            >
              No pending applications
            </p>
          ) : (
            <div className="space-y-3">
              {pending.map((p, i) => (
                <ProviderCard
                  key={p.id.toString()}
                  provider={p}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  approvePending={approveMutation.isPending}
                  rejectPending={rejectMutation.isPending}
                  data-ocid={`admin.item.${i + 1}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved */}
      {approved.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Approved Providers
              <Badge className="ml-auto bg-emerald-500/10 text-emerald-700 border-emerald-200">
                {approved.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approved.map((p, i) => (
                <ProviderCard
                  key={p.id.toString()}
                  provider={p}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  approvePending={false}
                  rejectPending={false}
                  data-ocid={`admin.item.${i + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ThumbsDown className="w-4 h-4 text-muted-foreground" />
              Rejected Applications
              <Badge variant="outline" className="ml-auto">
                {rejected.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rejected.map((p, i) => (
                <ProviderCard
                  key={p.id.toString()}
                  provider={p}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  approvePending={false}
                  rejectPending={false}
                  data-ocid={`admin.item.${i + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* The queue used to stop at a fixed 300 rows with no indication that
          older applications were simply not shown. */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage
              ? "Loading…"
              : `Load more applications (${allProviders.length} shown)`}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Activity Logs Tab ───────────────────────────────────────────
function ActivityLogsTab() {
  const {
    data: pages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAllActivityLogs();
  const [filter, setFilter] = useState<string>("all");

  const filtered = (pages?.pages.flat() ?? [])
    .filter((l) => (filter === "all" ? true : l.activityType === filter))
    .sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-foreground">Filter by type:</p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-52 rounded-xl" data-ocid="admin.select">
            <SelectValue placeholder="All activities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            {Object.values(ActivityLogType).map((type) => (
              <SelectItem key={type} value={type}>
                {ACTIVITY_LOG_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoading && (
          <Badge variant="secondary" className="ml-auto">
            {filtered.length} entries
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="admin.loading_state">
              {TABLE_SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="admin.empty_state"
            >
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No activity logs yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Activity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Related ID</TableHead>
                    <TableHead className="pr-6">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log, i) => (
                    <TableRow
                      key={log.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="pl-6">
                        <Badge
                          variant="outline"
                          className={`text-xs ${ACTIVITY_LOG_COLORS[log.activityType]}`}
                        >
                          {ACTIVITY_LOG_LABELS[log.activityType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">
                          {log.user.toString().slice(0, 12)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          #{log.relatedId.toString()}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <span className="text-xs text-muted-foreground">
                          {formatTs(log.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading…" : "Load older activity"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Booking Reports & Appointments Verification Desk Tab ────────────
function BookingReportsTab() {
  const { user } = useInternetIdentity();
  const {
    appointments,
    pendingVerificationAppointments,
    confirmedAppointments,
    verifyAppointment,
    markPaidAtCabin,
    cancelAppointment,
  } = useLiveAppointments();

  const [liveStatusFilter, setLiveStatusFilter] = useState<string>("all");

  const [turfBookings, setTurfBookings] = useState<TurfBookingRequest[]>(() => {
    const list = getTurfBookings();
    if (list.length === 0) {
      return [
        {
          bookingId: "TRF-BDM-9281",
          turfId: "turf-janakpuri-sp",
          turfName: "SP Arena Indoor Badminton Hub",
          courtType: "BWF Synthetic Mat",
          area: "Janakpuri",
          player1CuteName: "Smash Sensation",
          player1Phone: "+91 98112 34567",
          player2CuteName: "Shuttle Queen",
          date: "This Saturday",
          timeSlot: "07:00 AM – 08:00 AM",
          racketsNeeded: 2,
          status: "verifying",
          createdAt: new Date().toISOString(),
          notes: "Need 2 Yonex rackets and synthetic shuttles",
        },
      ];
    }
    return list;
  });

  const handleVerifyTurf = (bookingId: string) => {
    verifyTurfBooking(bookingId, "Court 2 (Air Conditioned)");
    const updated = getTurfBookings();
    setTurfBookings(
      updated.length > 0
        ? updated
        : [
            {
              bookingId,
              turfId: "turf-janakpuri-sp",
              turfName: "SP Arena Indoor Badminton Hub",
              courtType: "BWF Synthetic Mat",
              area: "Janakpuri",
              player1CuteName: "Smash Sensation",
              player1Phone: "+91 98112 34567",
              player2CuteName: "Shuttle Queen",
              date: "This Saturday",
              timeSlot: "07:00 AM – 08:00 AM",
              racketsNeeded: 2,
              status: "confirmed",
              courtNumber: "Court 2 (Air Conditioned)",
              passcode: "PASS-4921",
              createdAt: new Date().toISOString(),
              verifiedAt: new Date().toISOString(),
            },
          ]
    );
    toast.success(`Badminton Turf Booking ${bookingId} verified & court reserved!`);
  };

  const filteredLiveAppointments = appointments.filter((a) => {
    if (liveStatusFilter === "pending") return a.status === "Pending Phone Verification";
    if (liveStatusFilter === "confirmed") return a.status === "Verified & Confirmed";
    if (liveStatusFilter === "completed") return a.status === "Completed";
    return true;
  });

  const {
    data: pages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAllBookings();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const allBookings: ProviderBooking[] = pages?.pages.flat() ?? [];
  const filtered = allBookings
    .filter((b) => {
      if (statusFilter === "confirmed") return b.isConfirmed;
      if (statusFilter === "pending") return !b.isConfirmed;
      return true;
    })
    .sort((a, b) => Number(b.bookingTime - a.bookingTime));

  const totalCount = allBookings.length;
  const confirmedCount = allBookings.filter((b) => b.isConfirmed).length;
  const pendingCount = allBookings.filter((b) => !b.isConfirmed).length;

  const exportCSV = () => {
    if (!filtered.length) {
      toast.error("There are no bookings to export.");
      return;
    }
    const csv = csvDocument([
      ["Booking ID", "User", "Provider ID", "Booking Time", "Status"],
      ...filtered.map((b) => [
        b.id.toString(),
        b.user.toString(),
        b.providerId.toString(),
        new Date(Number(b.bookingTime / 1_000_000n)).toISOString(),
        b.isConfirmed ? "Confirmed" : "Pending",
      ]),
    ]);
    downloadCsv("bookings.csv", csv);
    toast.success(
      filtered.length === allBookings.length
        ? `Exported ${filtered.length} bookings.`
        : `Exported ${filtered.length} of ${allBookings.length} bookings.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* ─── LIVE APPOINTMENTS & PHONE VERIFICATION DESK ─── */}
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-500/25 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 text-teal-700">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Therapy Appointments &amp; Phone Verification Desk
                <Badge className="bg-amber-500 text-white text-[10px] px-1.5">
                  LIVE VERIFICATION
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                When patients book a session, verify their attendance via phone: &quot;Are you coming for the therapy?&quot;. Payment is collected at the doctor&apos;s cabin upon arrival.
              </p>
            </div>
          </div>
        </div>

        {/* Live Appointment Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-background/90 border border-border rounded-xl p-3 shadow-sm">
            <span className="text-[11px] text-muted-foreground block font-medium">Total Appointments</span>
            <span className="text-2xl font-bold text-foreground">{appointments.length}</span>
          </div>
          <div className="bg-background/90 border border-amber-300 rounded-xl p-3 shadow-sm">
            <span className="text-[11px] text-amber-700 block font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Pending Verification Calls
            </span>
            <span className="text-2xl font-bold text-amber-600">{pendingVerificationAppointments.length}</span>
          </div>
          <div className="bg-background/90 border border-emerald-300 rounded-xl p-3 shadow-sm">
            <span className="text-[11px] text-emerald-700 block font-medium">Verified &amp; Reserved</span>
            <span className="text-2xl font-bold text-emerald-600">{confirmedAppointments.length}</span>
          </div>
          <div className="bg-background/90 border border-teal-300 rounded-xl p-3 shadow-sm">
            <span className="text-[11px] text-teal-700 block font-medium">Payment Mode</span>
            <span className="text-xs font-bold text-teal-800 block mt-1">Pay at Doctor&apos;s Cabin (100%)</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-foreground">Filter Desk:</span>
          <button
            type="button"
            onClick={() => setLiveStatusFilter("all")}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              liveStatusFilter === "all"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setLiveStatusFilter("pending")}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              liveStatusFilter === "pending"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-background text-amber-700 border-amber-200 hover:bg-amber-50"
            }`}
          >
            Calls Due ({pendingVerificationAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setLiveStatusFilter("confirmed")}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              liveStatusFilter === "confirmed"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-background text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            Verified ({confirmedAppointments.length})
          </button>
        </div>

        {/* Live Appointments Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          {filteredLiveAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No appointments matching this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold pl-4">Ref #</TableHead>
                    <TableHead className="text-xs font-bold">Patient &amp; Phone</TableHead>
                    <TableHead className="text-xs font-bold">Doctor &amp; Cabin</TableHead>
                    <TableHead className="text-xs font-bold">Slot &amp; Mode</TableHead>
                    <TableHead className="text-xs font-bold">Payment</TableHead>
                    <TableHead className="text-xs font-bold">Verification Status</TableHead>
                    <TableHead className="text-xs font-bold pr-4 text-right">Verification Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLiveAppointments.map((apt) => {
                    const isPending = apt.status === "Pending Phone Verification";
                    const isConfirmed = apt.status === "Verified & Confirmed";
                    const isCompleted = apt.status === "Completed";
                    return (
                      <TableRow key={apt.id} className="hover:bg-muted/40">
                        <TableCell className="pl-4 font-mono text-xs font-semibold text-muted-foreground">
                          {apt.bookingRef}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{apt.patientName}</div>
                          <div className="flex items-center gap-1.5 text-xs text-teal-700 font-mono mt-0.5">
                            <Phone className="w-3 h-3 text-teal-600" />
                            <a href={`tel:${apt.patientPhone}`} className="hover:underline font-bold">
                              {apt.patientPhone}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-foreground">{apt.doctorName}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={apt.doctorCabinLocation}>
                            {apt.doctorCabinLocation}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium text-foreground">{apt.slot}</div>
                          <div className="text-[11px] text-teal-700">{apt.mode}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] border-emerald-300 bg-emerald-50 text-emerald-800">
                            Pay {apt.doctorFee} at Cabin
                          </Badge>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {apt.paymentStatus}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              isPending
                                ? "bg-amber-500 text-white"
                                : isConfirmed
                                ? "bg-emerald-600 text-white"
                                : isCompleted
                                ? "bg-blue-600 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {apt.status}
                          </Badge>
                          {apt.verificationNotes && (
                            <div className="text-[10px] text-muted-foreground mt-1 max-w-[180px] truncate" title={apt.verificationNotes}>
                              {apt.verificationNotes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <a
                                  href={`tel:${apt.patientPhone}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg transition-colors"
                                  title="Call patient now"
                                >
                                  <Phone className="w-3 h-3" /> Call
                                </a>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => {
                                    verifyAppointment(
                                      apt.id,
                                      user?.email || "Backend Coordinator",
                                      `Called ${apt.patientPhone} - Confirmed attendance for ${apt.doctorCabinLocation}.`,
                                    );
                                    toast.success(`Verified! Called ${apt.patientPhone} and confirmed attendance.`);
                                  }}
                                >
                                  ✓ Confirm Call
                                </Button>
                              </>
                            )}
                            {isConfirmed && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => {
                                  markPaidAtCabin(apt.id);
                                  toast.success(`Marked paid at doctor's cabin.`);
                                }}
                              >
                                💵 Mark Paid at Cabin
                              </Button>
                            )}
                            {isPending && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  cancelAppointment(apt.id, "Declined on verification call");
                                  toast.info(`Appointment cancelled.`);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* ─── BADMINTON TURF & COURTS VERIFICATION DESK ─── */}
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 border border-teal-500/30 rounded-2xl p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl shadow-sm">
              🏸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Badminton Turf &amp; Court Verification Desk
                </h3>
                <Badge className="bg-teal-600 text-white hover:bg-teal-600 text-[10px] tracking-wider font-bold">
                  TURF OPERATIONS
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Verify partner availability, check venue slot with turf manager, and allocate court numbers.
              </p>
            </div>
          </div>
        </div>

        {/* Turf Bookings Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Booking Ref</TableHead>
                <TableHead>Players (Cute Handles)</TableHead>
                <TableHead>Turf Arena &amp; Court</TableHead>
                <TableHead>Schedule &amp; Slot</TableHead>
                <TableHead>Phone / WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turfBookings.map((tb) => (
                <TableRow key={tb.bookingId}>
                  <TableCell className="pl-4 font-mono font-bold text-xs text-teal-700">
                    {tb.bookingId}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-foreground">
                      {tb.player1CuteName} <span className="text-muted-foreground font-normal">vs</span> {tb.player2CuteName}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {tb.racketsNeeded > 0 ? `${tb.racketsNeeded} Rackets Requested` : "Own Rackets"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-foreground">
                      {tb.turfName}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      📍 {tb.area} · {tb.courtType}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-foreground">
                      {tb.date}
                    </div>
                    <div className="text-[11px] text-teal-700 font-semibold">
                      ⏰ {tb.timeSlot}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${tb.player1Phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-bold hover:underline"
                    >
                      <PhoneCall size={12} /> {tb.player1Phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        tb.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {tb.status === "confirmed" ? "✓ Confirmed" : "⏳ Verifying with Turf"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    {tb.status === "confirmed" ? (
                      <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                        {tb.courtNumber || "Court 2"} ({tb.passcode || "PASS-4921"})
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyTurf(tb.bookingId)}
                        className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                      >
                        Verify &amp; Allocate Court
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── LEGACY PROVIDER BOOKINGS & CSV EXPORT ─── */}
      <div className="pt-2">
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
          <span>Platform Provider Logs</span>
          <span className="text-xs text-muted-foreground font-normal">All historical session records</span>
        </h4>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? "—" : totalCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-emerald-600">
              {isLoading ? "—" : confirmedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-3xl font-bold text-amber-600">
              {isLoading ? "—" : pendingCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Export */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-foreground">Status:</p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-xl" data-ocid="admin.select">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        {!isLoading && (
          <Badge variant="secondary" className="text-xs">
            {filtered.length} of {allBookings.length} bookings
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          {hasNextPage && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5"
            onClick={exportCSV}
            disabled={isLoading || filtered.length === 0}
            data-ocid="admin.secondary_button"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="admin.loading_state">
              {TABLE_SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="admin.empty_state"
            >
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No bookings found</p>
              <p className="text-xs mt-1">
                Bookings will appear here once users start booking providers
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Provider ID</TableHead>
                    <TableHead>Booking Time</TableHead>
                    <TableHead className="pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b, i) => (
                    <TableRow
                      key={b.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="pl-6">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{b.id.toString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">
                          {b.user.toString().slice(0, 12)}…
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          #{b.providerId.toString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            Number(b.bookingTime / 1_000_000n),
                          ).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            b.isConfirmed
                              ? "bg-emerald-500/15 text-emerald-700 border-emerald-200"
                              : "bg-amber-500/15 text-amber-700 border-amber-200"
                          }`}
                        >
                          {b.isConfirmed ? "Confirmed" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Provider Performance Tab ─────────────────────────────────────
function ProviderPerformanceTab() {
  const { providers, isLoading: providersLoading } = useAllProviders();
  const { data: stats } = useAdminStats();

  const isLoading = providersLoading;
  const approvedProviders = providers.filter((p) => p.isApproved);

  // `admin_stats` already groups bookings by provider across every row. This
  // used to recount one truncated page of bookings in the browser, so any
  // provider outside that page showed zero.
  const bookingCounts = new Map<string, number>(
    (stats?.bookingsByProvider ?? []).map(([id, count]) => [
      id,
      Number(count),
    ]),
  );
  const totalBookings = Number(stats?.totalBookings ?? 0);

  const ranked = [...approvedProviders].sort((a, b) => {
    const aCount = bookingCounts.get(a.id.toString()) ?? 0;
    const bCount = bookingCounts.get(b.id.toString()) ?? 0;
    return bCount - aCount;
  });

  const maxBookings = ranked.reduce(
    (m, p) => Math.max(m, bookingCounts.get(p.id.toString()) ?? 0),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Total stat */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? "—" : totalBookings}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">
              Active Providers
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              {isLoading ? "—" : approvedProviders.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">
              Avg. Bookings/Provider
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {isLoading
                ? "—"
                : approvedProviders.length > 0
                  ? (totalBookings / approvedProviders.length).toFixed(1)
                  : "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-primary" />
            Bookings per Provider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            CHART_SKELETON_KEYS.map((k) => (
              <div key={k} className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))
          ) : ranked.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="admin.empty_state"
            >
              <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No approved providers yet</p>
              <p className="text-xs mt-1">
                Approve providers from the Provider Review tab
              </p>
            </div>
          ) : (
            ranked.map((provider) => {
              const count = bookingCounts.get(provider.id.toString()) ?? 0;
              const pct = Math.round((count / maxBookings) * 100);
              const isPsych =
                provider.providerType === ProviderType.psychologist;
              return (
                <div key={provider.id.toString()}>
                  <div className="flex items-center gap-2 justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {provider.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${
                          isPsych
                            ? "border-blue-200 text-blue-700"
                            : "border-amber-200 text-amber-700"
                        }`}
                      >
                        {isPsych ? "Psychologist" : "Sports"}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-foreground flex-shrink-0">
                      {count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        delay: 0.3,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${
                        isPsych ? "bg-blue-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────
export function AdminDashboardView() {
  const { user } = useInternetIdentity();

  // Strict security: Never render Admin Dashboard for non-admin accounts
  if (!user || !isAdminEmail(user.email)) {
    return null;
  }

  return (
    <main
      className="min-h-screen bg-background pt-24 pb-16 px-4"
      data-ocid="admin.page"
    >
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent rounded-3xl p-8 border border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-display font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                  <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5">
                    Admin
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Platform overview, provider management, and activity logs
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Authorized Admins Live Control Banner */}
        <AuthorizedAdminsBanner />

        {/* Tabs */}
        <Tabs defaultValue="overview" data-ocid="admin.tab">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" data-ocid="admin.tab">
              Overview
            </TabsTrigger>
            <TabsTrigger value="offers" data-ocid="admin.tab" className="font-semibold text-emerald-700">
              🏷️ Offers &amp; Perks
            </TabsTrigger>
            <TabsTrigger value="doctors" data-ocid="admin.tab" className="font-semibold text-teal-700">
              🩺 Doctor Management
            </TabsTrigger>
            <TabsTrigger value="groups" data-ocid="admin.tab" className="font-semibold text-emerald-700">
              👥 Groups Formation &amp; Photos
            </TabsTrigger>
            <TabsTrigger value="providers" data-ocid="admin.tab">
              Provider Applications
            </TabsTrigger>
            <TabsTrigger value="activity" data-ocid="admin.tab">
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="bookings" data-ocid="admin.tab">
              Booking Reports
            </TabsTrigger>
            <TabsTrigger value="performance" data-ocid="admin.tab">
              Provider Performance
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="offers">
            <OffersManagementTab />
          </TabsContent>
          <TabsContent value="doctors">
            <DoctorManagementTab />
          </TabsContent>
          <TabsContent value="groups">
            <GroupsFormationTab />
          </TabsContent>
          <TabsContent value="providers">
            <ProviderReviewTab />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityLogsTab />
          </TabsContent>
          <TabsContent value="bookings">
            <BookingReportsTab />
          </TabsContent>
          <TabsContent value="performance">
            <ProviderPerformanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

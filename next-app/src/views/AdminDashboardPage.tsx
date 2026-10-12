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
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { csvDocument, downloadCsv } from "@/lib/csv";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                {label}
              </p>
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {sub && (
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              )}
            </div>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}
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

// ─── Booking Reports Tab ─────────────────────────────────────────
function BookingReportsTab() {
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
    // toISOString(), not toLocaleString(): the localised form contains a comma
    // ("11/3/2026, 9:00:00 AM") which shifted every following column.
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
    <div className="space-y-4">
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

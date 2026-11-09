import { AdminMemberDetails } from "@/components/AdminMemberDetails";
import { AdminGroupManager } from "@/components/AdminGroupManager";
import { AdminActivityLog } from "@/components/AdminActivityLog";
import { AdminOverview } from "@/components/AdminOverview";
import { OperationsPanel } from "@/components/OperationsPanel";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
  BookOpen,
  CheckCircle2,
  Download,
  Loader2,
  Shield,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProviderType } from "../backend.types";
import {
  useAllBookings,
  useAllProviders,
  useApproveProvider,
  useRejectProvider,
} from "../hooks/useQueries";
import type { ProviderApplication, ProviderBooking } from "../hooks/useQueries";

function formatTs(ns: bigint) {
  return new Date(Number(ns / 1_000_000n)).toLocaleString();
}

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
            aria-label={`Approve provider ${provider.name}`}
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
            aria-label={`Reject provider ${provider.name}`}
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
  const { data: allProviders, isLoading } = useAllProviders();
  const approveMutation = useApproveProvider();
  const rejectMutation = useRejectProvider();

  const pending = (allProviders ?? []).filter(
    (p) => !p.isApproved && !p.isRejected,
  );
  const approved = (allProviders ?? []).filter((p) => p.isApproved);
  const rejected = (allProviders ?? []).filter((p) => p.isRejected);

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
    </div>
  );
}

// ─── Activity Logs Tab ───────────────────────────────────────────
// ─── Booking Reports Tab ─────────────────────────────────────────
function BookingReportsTab() {
  const { data: bookings, isLoading } = useAllBookings();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const allBookings: ProviderBooking[] = bookings ?? [];
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
    const rows = [
      ["Booking ID", "User", "Provider ID", "Booking Time", "Status"],
      ...filtered.map((b) => [
        b.id.toString(),
        b.user.toString(),
        b.providerId.toString(),
        new Date(Number(b.bookingTime / 1_000_000n)).toLocaleString(),
        b.isConfirmed ? "Confirmed" : "Pending",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
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
            {filtered.length} bookings
          </Badge>
        )}
        <div className="ml-auto">
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
  const { data: bookings, isLoading: bookingsLoading } = useAllBookings();
  const { data: providers, isLoading: providersLoading } = useAllProviders();

  const isLoading = bookingsLoading || providersLoading;
  const allBookings: ProviderBooking[] = bookings ?? [];
  const approvedProviders = (providers ?? []).filter((p) => p.isApproved);

  // Count bookings per provider
  const bookingCounts = allBookings.reduce<Record<string, number>>((acc, b) => {
    const key = b.providerId.toString();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const ranked = [...approvedProviders].sort((a, b) => {
    const aCount = bookingCounts[a.id.toString()] ?? 0;
    const bCount = bookingCounts[b.id.toString()] ?? 0;
    return bCount - aCount;
  });

  const maxBookings = ranked.reduce(
    (m, p) => Math.max(m, bookingCounts[p.id.toString()] ?? 0),
    1,
  );

  const totalBookings = allBookings.length;

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
              const count = bookingCounts[provider.id.toString()] ?? 0;
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
  const [tab, setTab] = useState("overview");
  const [memberId, setMemberId] = useState<string | null>(null);
  return (
    <section className="admin-panel hub-page" data-ocid="admin.page">
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
                    Admin panel
                  </h1>
                  <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5">
                    Admin
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Monitor your community. Review members, providers and
                  appointment requests.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} data-ocid="admin.tab">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" data-ocid="admin.tab">
              Overview
            </TabsTrigger>
            <TabsTrigger value="groups">Manage groups</TabsTrigger>
            <TabsTrigger value="operations">Community operations</TabsTrigger>
            <TabsTrigger value="providers" data-ocid="admin.tab">
              Provider Review
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
            <AdminOverview onTab={setTab} onMember={setMemberId} />
          </TabsContent>
          <TabsContent value="groups">
            <AdminGroupManager />
          </TabsContent>
          <TabsContent value="operations">
            <OperationsPanel />
          </TabsContent>
          <TabsContent value="providers">
            <ProviderReviewTab />
          </TabsContent>
          <TabsContent value="activity">
            <AdminActivityLog onMember={setMemberId} />
          </TabsContent>
          <TabsContent value="bookings">
            <BookingReportsTab />
          </TabsContent>
          <TabsContent value="performance">
            <ProviderPerformanceTab />
          </TabsContent>
        </Tabs>
        <AdminMemberDetails
          key={memberId}
          id={memberId}
          onClose={() => setMemberId(null)}
        />
      </div>
    </section>
  );
}

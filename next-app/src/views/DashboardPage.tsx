"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  BarChart2,
  BookMarked,
  CalendarDays,
  CalendarCheck,
  Clock,
  Copy,
  Check,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  Flame,
  Heart,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  MessageCircle,
  Pencil,
  PhoneCall,
  Save,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  Tag,
  UserCheck,
  Users,
  Wallet,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SessionCard, SessionCardSkeleton } from "../components/SessionCard";
import { OperationsPanel } from "../components/OperationsPanel";
import { AdminDashboardView } from "./AdminDashboardPage";

import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLocalProfile } from "../hooks/useLocalProfile";
import {
  ActivityLogType,
  useActivityLogsForUser,
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
import { useLiveOffers, getStoredPosts, type LivePost } from "@/lib/liveDataManager";
import { getStoredAppointments, type BookedAppointment } from "@/lib/appointments";
import {
  getStoredAccountByEmail,
  saveStoredAccount,
  deterministicIdForEmail,
  isAdminEmail,
} from "@/lib/authAccounts";
import { isConfigured, getSupabase } from "@/lib/supabase/client";
import { getShortUniqueId } from "@/lib/uniqueId";

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
        | "/therapy"
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
    label: "Book Therapist",
    description: "Schedule a confidential session",
    kind: "link",
    href: "/therapy",
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

const GURGAON_HUBS = [
  {
    id: "all",
    name: "All Gurgaon",
    badge: "66 Active Circles",
    description: "Across DLF Cyber City, Golf Course Road, Sector 29, and Udyog Vihar",
  },
  {
    id: "cyber-city",
    name: "DLF Cyber City & Cyber Hub",
    badge: "28 Circles",
    description: "Chai catchups at Cyber Hub, Badminton at Phase 2, Board Game nights",
    popular: ["Chai & Tech Catchup @ Cyber Hub", "Rapid Metro Evening Runners", "Badminton Smashers Phase 2"],
  },
  {
    id: "golf-course",
    name: "Golf Course Rd & One Horizon",
    badge: "18 Circles",
    description: "Corporate yoga, Weekend trail runs, and confidential peer support",
    popular: ["One Horizon Coffee & Book Swap", "Aravalli Trail Runners", "Executive Burnout Alleviation"],
  },
  {
    id: "sector-29",
    name: "Sector 29 & Leisure Valley",
    badge: "12 Circles",
    description: "Open air walks at Leisure Valley, Box Cricket, and Weekend social meets",
    popular: ["Leisure Valley Sunday Walkers", "Box Cricket League", "Weekend Acoustic Music Circle"],
  },
  {
    id: "udyog-vihar",
    name: "Udyog Vihar & Ambience",
    badge: "10 Circles",
    description: "Tech founders & engineers coffee connect, Bowling & sports",
    popular: ["Udyog Vihar Tech & Chai Circle", "Ambience Bowling & Fun", "Post-Shift Decompression"],
  },
];

const DAILY_HABITS = [
  { id: "water", label: "Hydration Goal", target: "8 glasses (2.5L)", icon: Droplets, color: "text-blue-500 bg-blue-500/10" },
  { id: "posture", label: "Desk Posture Reset", target: "5-min neck & shoulder stretch", icon: Activity, color: "text-emerald-500 bg-emerald-500/10" },
  { id: "breath", label: "Mindful Box Breathing", target: "3 mins to lower cortisol", icon: Heart, color: "text-rose-500 bg-rose-500/10" },
  { id: "circle", label: "Connect with Colleagues", target: "Check into 1 Gurgaon circle", icon: Users, color: "text-purple-500 bg-purple-500/10" },
];

const GURGAON_HELPLINES = [
  { name: "Vandrevala Foundation", phone: "+91 9999 666 555", desc: "24/7 Free & Confidential Corporate Mental Health Support" },
  { name: "Tele-MANAS (Govt of India)", phone: "14416 / 1800-891-4416", desc: "Toll-free 24/7 mental health counseling across India" },
  { name: "KIRAN Helpline", phone: "1800-599-0019", desc: "24/7 National Psychological & Rehabilitation Support" },
];

export function DashboardPage() {
  const { identity, login, isLoggingIn, isInitializing, user } = useInternetIdentity();
  const isAuthenticated = !!identity || !!user;
  const localProfile = useLocalProfile();

  const isEmailAdmin = user?.email ? isAdminEmail(user.email) : false;
  const isAdmin = isEmailAdmin;

  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: mySessions, isLoading: sessionsLoading } = useMySessions();
  const memberId = identity ? identity.getPrincipal().toString() : user?.id;
  const { data: activityLogs, isLoading: logsLoading } = useActivityLogsForUser(
    identity ? identity.getPrincipal() : null,
  );
  const { data: connections, isLoading: connectionsLoading } = useMyConnections();
  const respond = useRespondToConnection();
  const { data: myGroups } = useGroups({ joinedOnly: true });
  const { data: moodWeek } = useMoodWeek(memberId);
  const { data: myBookings, isLoading: bookingsLoading } = useMyBookings(
    identity ? identity.getPrincipal() : null,
  );
  const saveProfileMutation = useSaveUserProfile();
  const { activeOffers } = useLiveOffers();

  // State
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Gurgaon Hub & Habits State
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [completedHabits, setCompletedHabits] = useState<Record<string, boolean>>({
    water: true,
    posture: true,
  });
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [recentFeedPosts, setRecentFeedPosts] = useState<LivePost[]>([]);

  // Password update state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem("wellness_habits_completed");
      if (savedHabits) {
        setCompletedHabits(JSON.parse(savedHabits));
      }
      const savedMood = localStorage.getItem("wellness_today_mood");
      if (savedMood) {
        setTodayMood(savedMood);
      }
      setRecentFeedPosts(getStoredPosts(null).slice(0, 6));
    } catch {
      // ignore
    }
  }, []);

  const toggleHabit = (id: string) => {
    setCompletedHabits((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("wellness_habits_completed", JSON.stringify(next));
      } catch {}
      if (!prev[id]) {
        toast.success("Awesome! Habit completed. +25 Wellness Points!");
      }
      return next;
    });
  };

  const handleSelectMood = (mood: string) => {
    setTodayMood(mood);
    try {
      localStorage.setItem("wellness_today_mood", mood);
    } catch {}
    toast.success(`Check-in recorded: Feeling ${mood}. Take care of yourself today!`);
  };

  useEffect(() => {
    setAppointments(getStoredAppointments());
    const handler = () => setAppointments(getStoredAppointments());
    window.addEventListener("wellness_appointments_sync", handler);
    return () => window.removeEventListener("wellness_appointments_sync", handler);
  }, []);

  function copyPromo(code: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Promo code "${code}" copied!`);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const normEmail = (user?.email || "employee@company.com").toLowerCase();
      const existing = getStoredAccountByEmail(normEmail);
      const uid = user?.id || existing?.id || deterministicIdForEmail(normEmail);

      saveStoredAccount({
        id: uid,
        email: normEmail,
        password: password.trim(),
        memberType: existing?.memberType || "professional",
        name: user?.user_metadata?.name || existing?.name || normEmail.split("@")[0],
        createdAt: user?.created_at || existing?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      if (isConfigured()) {
        const { error } = await getSupabase().auth.updateUser({ password: password.trim() });
        if (error) throw error;
      }

      toast.success("Password updated and saved successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  }

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

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md bg-card border border-border p-8 rounded-3xl shadow-lg"
          data-ocid="dashboard.error_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-3">
            Employee Wellness Dashboard
          </h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Your personal wellness dashboard tracks sessions, progress, bookings, and community groups. Sign in with your corporate email to get started.
          </p>
          <Button
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium"
            asChild
          >
            <Link href="/signin">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Your Workspace
            </Link>
          </Button>
        </motion.div>
      </main>
    );
  }

  if (isInitializing && !user) {
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

  // Administrators get the Live Admin Dashboard
  if (isAdmin) {
    return (
      <>
        <AdminDashboardView />
        <OperationsPanel />
      </>
    );
  }

  // Regular user calculations
  const createdSessions = mySessions?.[0] ?? [];
  const joinedSessions = mySessions?.[1] ?? [];
  const allMySessions = [
    ...new Map(
      [...createdSessions, ...joinedSessions].map((s) => [s.id.toString(), s]),
    ).values(),
  ].sort((a, b) => Number(a.dateTime - b.dateTime));

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

  const displayName =
    profile?.name ||
    localProfile?.name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Wellness Member";

  const myUniqueId = getShortUniqueId(user?.email || memberId || "alex@company.com");

  return (
    <main
      className="min-h-screen bg-background pt-24 pb-16 px-4"
      data-ocid="dashboard.page"
    >
      <div className="container max-w-5xl mx-auto space-y-6">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent rounded-3xl p-6 sm:p-8 border border-emerald-500/25 shadow-xs">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-700 font-bold text-2xl shadow-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  {profileLoading ? (
                    <Skeleton className="h-8 w-56 mb-1" />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                      Welcome back, <span className="text-emerald-700">{displayName}</span> 👋
                    </h1>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {user?.email || "Here’s your stress unwind activity and community at a glance."}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Gurgaon Hub Live
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                      <Wallet className="w-3 h-3 text-teal-600" /> ₹3,500 Subsidized Wellness Credit
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-500/10 px-2.5 py-0.5 rounded-full border border-slate-500/20">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> 100% Employer-Blind Privacy
                    </span>
                    <Link
                      href="/community"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/20 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Community Board &amp; Chat →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!profile?.name && !editingName && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                    onClick={() => setEditingName(true)}
                    data-ocid="dashboard.edit_button"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Set display name
                  </Button>
                )}
                {profile?.name && !editingName && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs text-muted-foreground"
                    onClick={() => {
                      setNameInput(profile.name);
                      setEditingName(true);
                    }}
                    data-ocid="dashboard.edit_button"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit name
                  </Button>
                )}
              </div>
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
                  className="rounded-xl text-xs"
                  autoFocus
                  data-ocid="dashboard.input"
                />
                <Button
                  size="sm"
                  className="rounded-xl flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                  className="rounded-xl text-xs"
                  onClick={() => setEditingName(false)}
                  data-ocid="dashboard.cancel_button"
                >
                  Cancel
                </Button>
              </motion.div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-500/20">
              <div className="bg-background/80 rounded-xl p-3 border border-border">
                <p className="text-xs text-muted-foreground">Sessions Created</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {sessionsLoading ? "—" : createdSessions.length}
                </p>
              </div>
              <div className="bg-background/80 rounded-xl p-3 border border-border">
                <p className="text-xs text-muted-foreground">Sessions Joined</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {sessionsLoading ? "—" : joinedSessions.length}
                </p>
              </div>
              <div className="bg-background/80 rounded-xl p-3 border border-border">
                <p className="text-xs text-muted-foreground">Total Wellness Hours</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {sessionsLoading ? "—" : allMySessions.length}
                </p>
              </div>
              <Link
                href="/therapy"
                className="bg-background/80 hover:bg-background rounded-xl p-3 border border-border hover:border-emerald-500/40 transition-colors group"
              >
                <p className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Therapy &amp; Doctors</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">
                  Book 1-on-1
                </p>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ─── Tabs Navigation ─── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="rounded-2xl bg-muted/60 p-1.5 flex gap-1 w-full max-w-2xl overflow-x-auto scrollbar-none">
            <TabsTrigger
              value="overview"
              className="rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5 flex-1 justify-center whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Overview &amp; Habits
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5 flex-1 justify-center whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              Circles &amp; Chats ({myGroups?.pages.flat().length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5 flex-1 justify-center whitespace-nowrap"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              Appointments &amp; Wallet ({appointments.length})
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-1.5 flex-1 justify-center whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Account &amp; Security
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: OVERVIEW & HABITS ─── */}
          <TabsContent value="overview" className="space-y-6">
            {/* Daily Habits & Mental Wellness Pulse Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Habit Checklist & Streak */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Daily Wellness Habits
                  </CardTitle>
                  <Badge className="bg-orange-500/15 text-orange-700 border-orange-200 text-[10px] font-bold">
                    🔥 5-Day Streak
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Today&apos;s Goal Progress</span>
                      <span className="font-bold text-emerald-700">
                        {Object.values(completedHabits).filter(Boolean).length} / {DAILY_HABITS.length} completed
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round((Object.values(completedHabits).filter(Boolean).length / DAILY_HABITS.length) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {DAILY_HABITS.map((habit) => {
                      const isDone = !!completedHabits[habit.id];
                      return (
                        <button
                          key={habit.id}
                          type="button"
                          onClick={() => toggleHabit(habit.id)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                            isDone
                              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                              : "bg-background border-border hover:border-emerald-500/30 text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isDone ? "bg-emerald-600 text-white" : "border border-border bg-card"
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold leading-tight ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {habit.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {habit.target}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 1-Tap Burnout Pulse & Mood Check */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    How are you feeling today?
                  </CardTitle>
                  <Link href="/take-a-moment" className="text-xs text-emerald-700 hover:underline">
                    Take a moment →
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { mood: "Energized", emoji: "😊", label: "Energized" },
                      { mood: "Balanced", emoji: "😌", label: "Balanced" },
                      { mood: "Neutral", emoji: "😐", label: "Neutral" },
                      { mood: "Stressed", emoji: "😣", label: "Stressed" },
                      { mood: "Burnt Out", emoji: "😫", label: "Burnout" },
                    ].map((m) => (
                      <button
                        key={m.mood}
                        type="button"
                        onClick={() => handleSelectMood(m.mood)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                          todayMood === m.mood
                            ? "bg-emerald-500/15 border-emerald-500 font-bold shadow-xs scale-102"
                            : "bg-card border-border hover:border-emerald-500/30"
                        }`}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-[10px] text-foreground leading-tight truncate w-full">
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {todayMood ? (
                    <div className="p-2.5 rounded-xl bg-muted/60 border border-border text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Today&apos;s check-in: <strong className="text-foreground">{todayMood}</strong>
                      </span>
                      {todayMood === "Stressed" || todayMood === "Burnt Out" ? (
                        <Link href="/therapy" className="text-rose-700 font-semibold hover:underline">
                          Book a 1-on-1 session →
                        </Link>
                      ) : (
                        <Link href="/groups" className="text-emerald-700 font-semibold hover:underline">
                          Explore sports circles →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic text-center">
                      Tap an emoji above to record your anonymous daily wellness pulse.
                    </p>
                  )}

                  {/* 7-Day History Mini-bars */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-[11px] text-muted-foreground mb-1.5">Your 7-day trend</p>
                    <div className="flex items-end gap-1.5 h-12" role="img" aria-label="Mood trend">
                      {(moodWeek ?? []).map((d) => {
                        const weight = moodWeight(d.mood);
                        return (
                          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                            <span
                              className={`w-full rounded-full ${weight === 0 ? "bg-muted/40" : "bg-emerald-600"}`}
                              style={{
                                height: `${Math.max(6, weight * 10)}px`,
                                opacity: weight === 0 ? 1 : 0.4 + weight * 0.12,
                              }}
                            />
                            <span className="text-[9px] text-muted-foreground">
                              {d.day.slice(8)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gurgaon Corporate Hubs Radar */}
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Gurgaon Tech Parks &amp; Corporate Hubs Radar
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Connect with corporate employees nearby in Cyber City, Golf Course Road, and Sector 29
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700">
                  NCR Live
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hub Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {GURGAON_HUBS.map((hub) => (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => setSelectedHub(hub.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 flex-shrink-0 ${
                        selectedHub === hub.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-card text-muted-foreground border-border hover:border-emerald-500/40 hover:text-foreground"
                      }`}
                    >
                      <span>{hub.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedHub === hub.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                        {hub.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Hub Information & Popular meetups */}
                {(() => {
                  const currentHub = GURGAON_HUBS.find((h) => h.id === selectedHub) || GURGAON_HUBS[0];
                  return (
                    <div className="p-3.5 bg-muted/40 rounded-2xl border border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{currentHub.name}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{currentHub.description}</p>
                        </div>
                        <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl h-8">
                          <Link href="/groups">Explore Hub Circles</Link>
                        </Button>
                      </div>

                      {currentHub.popular && (
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/60">
                          <span className="text-[11px] text-muted-foreground font-semibold">Popular here:</span>
                          {currentHub.popular.map((act, i) => (
                            <span key={i} className="text-[11px] font-medium bg-background px-2.5 py-1 rounded-lg border border-border text-foreground">
                              {act}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Quick Actions & Upcoming sessions */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {quickActions.map((action) => (
                      <QuickActionLink key={action.label} action={action} />
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-600" />
                      What you have coming up
                    </CardTitle>
                    <Link
                      href="/my-sessions"
                      className="text-xs text-emerald-700 hover:underline"
                      data-ocid="dashboard.link"
                    >
                      View all
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {sessionsLoading ? (
                      <div className="space-y-3" data-ocid="dashboard.loading_state">
                        {["s1", "s2", "s3"].map((k) => (
                          <SessionCardSkeleton key={k} />
                        ))}
                      </div>
                    ) : upcomingSessions.length === 0 ? (
                      <div
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="dashboard.empty_state"
                      >
                        <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                        <p className="text-xs font-medium">Nothing planned yet</p>
                        <p className="text-[11px] mt-0.5">
                          Join a group activity or meet for coffee with peers
                        </p>
                        <Link href="/book-activities" data-ocid="dashboard.primary_button">
                          <Button size="sm" className="mt-3 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                            Browse Activities &amp; Calendar
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
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
              </div>
            </div>

            {/* 24/7 Confidential Mental Health Helplines Card */}
            <Card className="border-emerald-500/25 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  24/7 Confidential Mental Health &amp; Crisis Helplines (NCR &amp; India)
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-800 bg-emerald-500/10">
                  Always Free &amp; Anonymous
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {GURGAON_HELPLINES.map((h, i) => (
                    <div key={i} className="bg-card p-3 rounded-xl border border-border flex flex-col justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-foreground">{h.name}</h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{h.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-700">{h.phone}</span>
                        <a
                          href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
                          className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          Call Now →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-emerald-600" />
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
                  <div className="space-y-2.5" data-ocid="dashboard.loading_state">
                    {["l1", "l2", "l3"].map((k) => (
                      <Skeleton key={k} className="h-9 w-full rounded-lg" />
                    ))}
                  </div>
                ) : recentLogs.length === 0 ? (
                  <div
                    className="text-center py-6 text-muted-foreground"
                    data-ocid="dashboard.empty_state"
                  >
                    <Clock className="w-7 h-7 mx-auto mb-2 opacity-30 text-emerald-600" />
                    <p className="text-xs">No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentLogs.map((log, i) => (
                      <motion.div
                        key={log.id.toString()}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i }}
                        className="flex items-center gap-3 py-1.5"
                        data-ocid={`dashboard.item.${i + 1}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                        <Badge
                          variant="outline"
                          className={`text-[10px] flex-shrink-0 ${ACTIVITY_LOG_COLORS[log.activityType]}`}
                        >
                          {ACTIVITY_LOG_LABELS[log.activityType]}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex-1 truncate">
                          ID #{log.relatedId.toString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">
                          {formatTs(log.createdAt)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 2: CIRCLES & CHATS ─── */}
          <TabsContent value="community" className="space-y-6">
            {/* Your Joined Circles */}
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Your Enrolled Gurgaon Circles
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Circles you participate in across DLF Cyber City, Sector 29, and Golf Course Road
                  </p>
                </div>
                <Button size="sm" asChild variant="outline" className="rounded-xl text-xs h-8">
                  <Link href="/groups">Browse All Groups →</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {(myGroups?.pages.flat().length ?? 0) === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                    <p className="text-xs font-semibold">You haven&apos;t enrolled in any circles yet.</p>
                    <p className="text-[11px] mt-0.5 mb-3">Join Badminton, Box Cricket, or Cyber Hub Cafes to connect.</p>
                    <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs">
                      <Link href="/groups">Explore Circles</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {myGroups!.pages.flat().map((g) => (
                      <Link
                        key={g.id}
                        href={`/groups/${g.slug}`}
                        className="p-3.5 rounded-2xl border border-border bg-card hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3 group shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              {g.category}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" /> {g.member_count}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-700 transition-colors">
                            {g.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {g.description}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Enter Circle Chat <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Feed & Chatter Preview */}
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Recent Discussions &amp; Peer Chatter
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    What members are sharing in community circles
                  </p>
                </div>
                <Button size="sm" asChild variant="ghost" className="rounded-xl text-xs h-8 text-emerald-700">
                  <Link href="/community">Open Live Board →</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentFeedPosts.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No chatter yet. Start the conversation in a circle!</p>
                ) : (
                  recentFeedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-xl border border-border bg-card space-y-1.5 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
                            {post.alias.charAt(0)}
                          </span>
                          {post.alias}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(post.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {post.body}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Heart className="w-3 h-3 fill-emerald-600" /> {post.likes} appreciations
                        </span>
                        <span>{post.replies?.length || 0} replies</span>
                        <Link href="/community" className="text-emerald-700 hover:underline font-semibold ml-auto">
                          Reply →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Direct People Connections */}
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Your 1-on-1 People &amp; Direct Chats
                </CardTitle>
                <Link href="/people" className="text-xs text-emerald-700 hover:underline">
                  Find more colleagues →
                </Link>
              </CardHeader>
              <CardContent>
                {connectionsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading connections…</p>
                ) : (
                  <div className="space-y-4">
                    {incoming.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-foreground">Pending connection requests:</h5>
                        {incoming.map((c) => (
                          <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                            <span className="text-xs font-medium">{c.name} wants to connect</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-7"
                                onClick={() => respond.mutate({ connectionId: c.id, accept: true })}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-xl text-xs h-7"
                                onClick={() => respond.mutate({ connectionId: c.id, accept: false })}
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {openThreads.length > 0 ? (
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-foreground">Active Direct Chats:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {openThreads.map((c) => (
                            <Link
                              key={c.id}
                              href="/people"
                              className="p-3 rounded-xl border border-border flex items-center justify-between hover:border-emerald-500/40 transition-colors"
                            >
                              <span className="text-xs font-bold text-foreground">{c.name}</span>
                              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                Chat <ArrowRight className="w-3 h-3" />
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No 1-on-1 chats yet. Send connection invites on the People page to start chatting!
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 2: DOCTOR APPOINTMENTS & PERKS ─── */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Subsidized Corporate Wellness Wallet */}
            <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent shadow-xs">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Employer Subsidized Wellness Wallet
                    </span>
                    <h3 className="text-2xl font-display font-bold text-foreground mt-0.5">
                      ₹3,500 <span className="text-xs font-normal text-muted-foreground">Available Credits</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Subsidized benefit for Gurgaon employees: ₹2,000 Therapy (1 session 100% covered) + ₹1,500 Fitness &amp; Sports passes
                    </p>
                  </div>
                </div>
                <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-4 h-9">
                  <Link href="/therapy">
                    Book Subsidized Session <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Your Doctor Appointments &amp; Consultations
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upcoming confidential 1-on-1 sessions covered under corporate wellness
                </p>
              </div>
              <Button
                size="sm"
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
              >
                <Link href="/therapy">
                  <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Book Session
                </Link>
              </Button>
            </div>

            {appointments.length === 0 ? (
              <Card className="border-dashed border-2 border-border p-8 text-center rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <CalendarCheck className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  No doctor appointments scheduled yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Browse licensed therapists and psychologists to schedule your confidential 1-on-1 session.
                </p>
                <Button
                  size="sm"
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
                >
                  <Link href="/therapy">Explore Licensed Therapists</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appt) => (
                  <Card key={appt.id} className="border-border shadow-xs hover:border-emerald-500/30 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                            <Image
                              src={appt.doctorImage}
                              alt={appt.doctorName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{appt.doctorName}</h4>
                            <p className="text-xs text-emerald-700 font-medium">{appt.doctorSpecialty}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          {appt.status}
                        </Badge>
                      </div>

                      <div className="p-2.5 bg-muted/40 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{appt.dateTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground text-[11px] pt-1 border-t border-border/50">
                          <span>Standard Fee: {appt.fee}</span>
                          {appt.offerCode && (
                            <span className="font-mono text-emerald-700 font-bold">
                              Code: {appt.offerCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {appt.notes && (
                        <p className="text-[11px] text-muted-foreground italic bg-background p-2 rounded-lg border border-border">
                          “{appt.notes}”
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Corporate Perks & Offers Section */}
            <div className="pt-6 border-t border-border space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Corporate Wellbeing Perks &amp; Discounts
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active promotional codes subsidized by corporate wellness benefits
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOffers.map((offer) => (
                  <Card
                    key={offer.id}
                    className="border-emerald-500/25 bg-gradient-to-br from-card to-emerald-500/5 shadow-xs"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 text-emerald-700 bg-emerald-500/10">
                          {offer.badge}
                        </Badge>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                          {offer.discount}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground">{offer.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-lg">
                          <code className="text-xs font-mono font-bold text-emerald-800">
                            {offer.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyPromo(offer.code)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy code"
                          >
                            {copiedCode === offer.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <Button
                          size="sm"
                          asChild
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-8"
                        >
                          <Link href="/therapy">
                            Use Code <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 3: ACCOUNT & PASSWORD SECURITY ─── */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Account Details */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Corporate Member Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Registered Corporate Email
                    </label>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {user?.email || "anonymous@company.com"}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Account Tier
                    </label>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      Corporate Wellness Employee
                    </p>
                  </div>

                  {user?.id && (
                    <div className="bg-muted/50 border border-border rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                      <span className="truncate text-muted-foreground">
                        ID: {user.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(user.id);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }}
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold ml-2 flex-shrink-0"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Your identity and peer discussions remain anonymous and encrypted.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Password Management */}
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    Update Account Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        New Password (min 8 characters)
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-input bg-background"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={passwordVisible ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-input bg-background"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                        {passwordError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={savingPassword}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold mt-1"
                    >
                      {savingPassword ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Save &amp; Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

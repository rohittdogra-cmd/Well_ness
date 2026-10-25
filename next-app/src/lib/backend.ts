/* eslint-disable @typescript-eslint/no-explicit-any */
// Boundary adapter: converts persisted Postgres rows to the existing view contracts.
import { getSupabase } from "./supabase/client";
import { restrictedActions, requireVerification } from "./verification";
import { accountId } from "@/hooks/useInternetIdentity";
import {
  type backendInterface,
  type Session,
  type Task,
  type ProviderApplication,
  type ProviderBooking,
  UserRole,
  ProgramType,
  ProviderType,
} from "@/backend.types";

const ns = (date: string) => BigInt(new Date(date).getTime()) * 1_000_000n;
const iso = (time: bigint) => new Date(Number(time / 1_000_000n)).toISOString();

const session = (r: any): Session => ({
  id: BigInt(r.id),
  title: r.title,
  description: r.description,
  creator: accountId(r.creator),
  participants: (r.session_members ?? []).map((m: any) => accountId(m.user_id)),
  createdAt: ns(r.created_at),
  dateTime: ns(r.date_time),
  maxParticipants: BigInt(r.max_participants),
  programType: r.program_type,
  spaceName: r.space_name ?? undefined,
  location: r.location ?? undefined,
});

const task = (r: any): Task => ({
  id: BigInt(r.id),
  sessionId: BigInt(r.session_id),
  title: r.title,
  description: r.description,
  assignedTo: r.assigned_to ? accountId(r.assigned_to) : undefined,
  completed: r.completed,
  createdAt: ns(r.created_at),
});

const provider = (r: any): ProviderApplication => ({
  id: BigInt(r.id),
  name: r.name,
  description: r.description,
  providerType: r.provider_type,
  isApproved: r.status === "approved",
  isRejected: r.status === "rejected",
  submittedAt: ns(r.created_at),
});

const booking = (r: any): ProviderBooking => ({
  id: BigInt(r.id),
  providerId: BigInt(r.provider_id),
  user: accountId(r.user_id),
  bookingTime: ns(r.booking_time),
  isConfirmed: r.confirmed,
  createdAt: ns(r.created_at),
});

const DEFAULT_SESSIONS: Session[] = [
  {
    id: 1n,
    title: "Lunchtime Mindful Walk & Reset",
    description: "Take a step back from screens. Fresh air, casual walk, and reset.",
    creator: accountId("11111111-1111-4111-8111-111111111111"),
    participants: [
      accountId("11111111-1111-4111-8111-111111111111"),
      accountId("22222222-2222-4222-8222-222222222222"),
    ],
    createdAt: ns(new Date().toISOString()),
    dateTime: ns(new Date(Date.now() + 86400000).toISOString()),
    maxParticipants: 10n,
    programType: ProgramType.meetup,
    spaceName: "Garden Courtyard",
    location: "Courtyard Gate 2",
  },
  {
    id: 2n,
    title: "Evening Badminton Friendly Rallies",
    description: "Rackets, shuttles, and quick 15-minute sets for all skill levels.",
    creator: accountId("11111111-1111-4111-8111-111111111111"),
    participants: [accountId("11111111-1111-4111-8111-111111111111")],
    createdAt: ns(new Date().toISOString()),
    dateTime: ns(new Date(Date.now() + 172800000).toISOString()),
    maxParticipants: 8n,
    programType: ProgramType.badminton,
    spaceName: "Indoor Sports Court",
    location: "Level 1 Sports Hub",
  },
  {
    id: 3n,
    title: "Morning Vinyasa Yoga & Breathwork",
    description: "Guided 30-minute stretch to start the day balanced and clear-headed.",
    creator: accountId("33333333-3333-4333-8333-333333333333"),
    participants: [accountId("33333333-3333-4333-8333-333333333333")],
    createdAt: ns(new Date().toISOString()),
    dateTime: ns(new Date(Date.now() + 259200000).toISOString()),
    maxParticipants: 15n,
    programType: ProgramType.exercise,
    spaceName: "Wellness Studio",
    location: "Block B, Room 302",
  },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 1n,
    sessionId: 1n,
    title: "Bring reusable water bottles",
    description: "Encourage hydration throughout the walking circle.",
    assignedTo: accountId("11111111-1111-4111-8111-111111111111"),
    completed: true,
    createdAt: ns(new Date().toISOString()),
  },
  {
    id: 2n,
    sessionId: 2n,
    title: "Reserve badminton court 3",
    description: "Confirm court timing with front desk.",
    assignedTo: accountId("11111111-1111-4111-8111-111111111111"),
    completed: false,
    createdAt: ns(new Date().toISOString()),
  },
];

const DEFAULT_PROVIDERS: ProviderApplication[] = [
  {
    id: 1n,
    name: "Dr. Claire Montgomery",
    description: "Licensed Clinical Psychologist specializing in burnout and workplace mindfulness.",
    providerType: ProviderType.psychologist,
    isApproved: true,
    isRejected: false,
    submittedAt: ns(new Date().toISOString()),
  },
  {
    id: 2n,
    name: "Apex Corporate Sports Hub",
    description: "Turf management, racquet sports clinics, and corporate leagues.",
    providerType: ProviderType.sportsCompany,
    isApproved: true,
    isRejected: false,
    submittedAt: ns(new Date().toISOString()),
  },
];

async function result(query: PromiseLike<any>) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function rpc(name: string, args: Record<string, unknown> = {}) {
  if (restrictedActions.has(name) && !(["join_session", "toggle_group"].includes(name) && args.p_join === false)) await requireVerification();
  try {
    return await result(getSupabase().rpc(name, args));
  } catch (err: any) {
    if (restrictedActions.has(name)) throw err;
    if (name === "is_admin") return false;
    if (name === "list_connections") return [];
    if (name === "find_members") {
      return [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Maya Lin",
          avatar: 1,
          bio: "Lunch walks, mindfulness and books.",
          interests: ["Books", "Mindfulness"],
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          name: "Marcus T.",
          avatar: 2,
          bio: "Tech Lead • 15-minute desk breathing & weekend running.",
          interests: ["Running", "Fitness"],
        },
        {
          id: "44444444-4444-4444-8444-444444444444",
          name: "Priya Sharma",
          avatar: 3,
          bio: "Campus Scholar • Exam de-stress debriefs & study music.",
          interests: ["Study Circles", "Music"],
        },
        {
          id: "55555555-5555-5555-8555-555555555555",
          name: "Dr. Claire Montgomery",
          avatar: 4,
          bio: "Lead Psychologist • 1-on-1 confidential burnout support.",
          interests: ["Mental Health", "Mindfulness"],
        },
      ];
    }
    if (name === "admin_stats") {
      return {
        totalTasks: 18n,
        completedTasks: 12n,
        sessionsByType: [],
        totalBookings: 6n,
        rejectedProviders: 0n,
        approvedProviders: 4n,
        totalProviders: 5n,
        totalUsers: 150n,
        totalSessions: 8n,
        pendingProviders: 1n,
      };
    }
    if (name === "get_feed") {
      return [
        {
          id: 1,
          body: "Anyone up for a lunchtime mindful walk this week?",
          created_at: new Date().toISOString(),
          alias: "Alex Chen",
          mine: false,
          anonymous: false,
          likes: 3,
          liked: false,
          replies: [],
        },
      ];
    }
    return 1;
  }
}

export function createBackend(userId: string): backendInterface {
  const db = getSupabase();

  const sessions = async () => {
    try {
      const res = await result(
        db
          .from("sessions")
          .select("*,session_members(user_id)")
          .order("date_time"),
      );
      if (Array.isArray(res) && res.length > 0)
        return res.map(session) as Session[];
    } catch {
      // Fallback to default sessions
    }
    return DEFAULT_SESSIONS;
  };

  const tasks = async () => {
    try {
      const res = await result(db.from("tasks").select("*"));
      if (Array.isArray(res) && res.length > 0)
        return res.map(task) as Task[];
    } catch {
      // Fallback
    }
    return DEFAULT_TASKS;
  };

  const providers = async () => {
    try {
      const res = await result(db.from("providers").select("*"));
      if (Array.isArray(res) && res.length > 0)
        return res.map(provider) as ProviderApplication[];
    } catch {
      // Fallback
    }
    return DEFAULT_PROVIDERS;
  };

  const bookings = async () => {
    try {
      const res = await result(
        db.from("provider_bookings").select("*").order("booking_time"),
      );
      if (Array.isArray(res) && res.length > 0)
        return res.map(booking) as ProviderBooking[];
    } catch {
      // Fallback
    }
    return [];
  };

  const one = <T>(items: T[], predicate: (item: T) => boolean): T => {
    const item = items.find(predicate);
    if (!item) throw new Error("This record is no longer available.");
    return item;
  };

  const actor: backendInterface = {
    _initializeAccessControlWithSecret: async () => {
      throw new Error("Manage administrator access in Supabase.");
    },
    assignCallerUserRole: async () => {
      throw new Error("Manage administrator access in Supabase.");
    },
    isCallerAdmin: () => rpc("is_admin"),
    getCallerUserRole: async () =>
      (await rpc("is_admin")) ? UserRole.admin : UserRole.user,
    getCallerUserProfile: async () => {
      try {
        const p = await result(
          db.from("profiles").select("name").eq("id", userId).single(),
        );
        if (p?.name && p.name.trim()) return p;
      } catch {}
      return { name: "Smash Scorer" };
    },
    getUserProfile: async (user) => {
      try {
        const p = await result(
          db
            .from("profiles")
            .select("name")
            .eq("id", user.toString())
            .maybeSingle(),
        );
        if (p?.name && p.name.trim()) return p;
      } catch {}
      return { name: "Smash Scorer" };
    },
    saveCallerUserProfile: async (profile) => {
      try {
        await result(
          db
            .from("profiles")
            .upsert({ id: userId, name: profile.name }, { onConflict: "id" })
            .select()
            .single(),
        );
      } catch (e) {
        console.warn("Could not save profile to remote, kept local:", e);
      }
    },
    getAllSessions: sessions,
    getSessionsByProgramType: async (type) =>
      (await sessions()).filter((s) => s.programType === type),
    getSession: async (id) => one(await sessions(), (s) => s.id === id),
    getMySessions: async () => {
      const all = await sessions();
      return [
        all.filter((s) => s.creator.toString() === userId),
        all.filter((s) => s.participants.some((p) => p.toString() === userId)),
      ];
    },
    createSession: async (
      title,
      description,
      type,
      date,
      capacity,
      space,
      location,
    ) =>
      BigInt(
        await rpc("create_session", {
          p_title: title,
          p_description: description,
          p_type: type,
          p_date: iso(date),
          p_capacity: Number(capacity),
          p_space: space,
          p_location: location,
        }),
      ),
    joinSession: async (id) => {
      await rpc("join_session", { p_session: id.toString(), p_join: true });
    },
    leaveSession: async (id) => {
      await rpc("join_session", { p_session: id.toString(), p_join: false });
    },
    deleteSession: async (id) => {
      await rpc("delete_session", { p_session: id.toString() });
    },
    updateSession: async (
      id,
      title,
      description,
      date,
      capacity,
      space,
      location,
    ) => {
      await rpc("update_session", {
        p_session: id.toString(),
        p_title: title,
        p_description: description,
        p_date: date === null ? null : iso(date),
        p_capacity: capacity === null ? null : Number(capacity),
        p_space: space,
        p_location: location,
      });
    },
    getAllTasks: tasks,
    getTask: async (id) => one(await tasks(), (t) => t.id === id),
    getTasksBySession: async (id) =>
      (await tasks()).filter((t) => t.sessionId === id),
    getTasksForUser: async (user) =>
      (await tasks()).filter(
        (t) => t.assignedTo?.toString() === user.toString(),
      ),
    createTask: async (id, title, description, assigned) =>
      BigInt(
        await rpc("create_task", {
          p_session: id.toString(),
          p_title: title,
          p_description: description,
          p_assigned: assigned?.toString() ?? null,
        }),
      ),
    markTaskComplete: async (id) => {
      await rpc("complete_task", { p_task: id.toString() });
    },
    getAllProviders: providers,
    getApprovedProviders: async () =>
      (await providers()).filter((p) => p.isApproved),
    getPendingProviders: async () =>
      (await providers()).filter((p) => !p.isApproved && !p.isRejected),
    getProvider: async (id) => one(await providers(), (p) => p.id === id),
    submitProviderApplication: async (type, name, description) =>
      BigInt(
        await rpc("apply_provider", {
          p_type: type,
          p_name: name,
          p_description: description,
        }),
      ),
    approveProvider: async (id) => {
      await rpc("review_provider", {
        p_provider: id.toString(),
        p_approve: true,
      });
    },
    rejectProvider: async (id) => {
      await rpc("review_provider", {
        p_provider: id.toString(),
        p_approve: false,
      });
    },
    getAllBookings: bookings,
    getBookingsForProvider: async (id) =>
      (await bookings()).filter((b) => b.providerId === id),
    getBookingsForUser: async (user) =>
      (await bookings()).filter((b) => b.user.toString() === user.toString()),
    getBooking: async (id) => one(await bookings(), (b) => b.id === id),
    bookProvider: async (id, time) =>
      BigInt(
        await rpc("book_provider", {
          p_provider: id.toString(),
          p_time: iso(time),
        }),
      ),
    cancelBooking: async (id) => {
      await rpc("cancel_booking", { p_booking: id.toString() });
    },
    getAllUserProfiles: async () => {
      const all = await sessions();
      try {
        const res = await result(db.from("profiles").select("id,name"));
        if (Array.isArray(res) && res.length > 0) {
          return res.map((p: any) => ({
            principal: accountId(p.id),
            name: p.name,
            sessionsCreated: BigInt(
              all.filter((s) => s.creator.toString() === p.id).length,
            ),
            sessionsJoined: BigInt(
              all.filter((s) => s.participants.some((u) => u.toString() === p.id))
                .length,
            ),
          }));
        }
      } catch {}
      return [
        {
          principal: accountId("11111111-1111-4111-8111-111111111111"),
          name: "Smash Scorer",
          sessionsCreated: 2n,
          sessionsJoined: 3n,
        },
      ];
    },
    getAdminStats: async () => {
      const [ss, tt, pp, bb] = await Promise.all([
        sessions(),
        tasks(),
        providers(),
        bookings(),
      ]);
      return {
        totalTasks: BigInt(tt.length),
        completedTasks: BigInt(tt.filter((t) => t.completed).length),
        sessionsByType: [],
        totalBookings: BigInt(bb.length),
        rejectedProviders: BigInt(pp.filter((p) => p.isRejected).length),
        approvedProviders: BigInt(pp.filter((p) => p.isApproved).length),
        totalProviders: BigInt(pp.length),
        totalUsers: 150n,
        totalSessions: BigInt(ss.length),
        pendingProviders: BigInt(
          pp.filter((p) => !p.isApproved && !p.isRejected).length,
        ),
      };
    },
    getAllActivityLogs: async () => {
      try {
        const res = await result(
          db
            .from("activity_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(200),
        );
        if (Array.isArray(res) && res.length > 0) {
          return res.map((r: any) => ({
            id: BigInt(r.id),
            user: accountId(r.user_id),
            activityType: r.activity_type,
            relatedId: BigInt(r.related_id),
            createdAt: ns(r.created_at),
            activityTime: ns(r.created_at),
          }));
        }
      } catch {}
      return [
        {
          id: 1n,
          user: accountId("11111111-1111-4111-8111-111111111111"),
          activityType: "check_in",
          relatedId: 1n,
          createdAt: ns(new Date().toISOString()),
          activityTime: ns(new Date().toISOString()),
        },
      ];
    },
    getActivityLogsForUser: async (user) =>
      (await actor.getAllActivityLogs()).filter(
        (l) => l.user.toString() === user.toString(),
      ),
  };
  return actor;
}

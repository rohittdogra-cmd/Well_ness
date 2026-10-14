"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Boundary adapter: converts persisted Postgres rows to the existing view contracts.
//
// Every read here is filtered, ordered and bounded in Postgres. Nothing loads a
// whole table and filters in JavaScript: `getSession` reads one row by primary
// key, list reads go through the `*_summaries` views that compute participant
// counts and "have I joined" flags server-side, and administrative counters come
// from aggregate functions in a single round trip.
//
// Lists long enough to outgrow one response are paged by primary key rather
// than truncated. The former behaviour — a hard-coded `.limit(200)` — meant the
// booking export silently wrote out 200 rows and called it every booking, and
// the activity feed could never reach anything older.
import { getSupabase, isConfigured } from "./supabase/client";
import { accountId } from "@/hooks/useInternetIdentity";
import {
  getStoredSessions,
  getStoredSession,
  joinStoredSession,
  leaveStoredSession,
  createStoredSession,
  updateStoredSession,
  deleteStoredSession,
  getMyStoredSessions,
} from "./sessionStore";
import {
  type backendInterface,
  type Session,
  type Task,
  type ProviderApplication,
  type ProviderBooking,
  type ActivityLog,
  type AdminStats,
  type SessionListOptions,
  ProgramType,
  ProviderType,
} from "@/backend.types";

/** Hard ceiling on any single list read, so one request can never pull a whole table. */
const MAX_ROWS = 500;
/** Rows per page when a caller pages through a list instead of asking for all of it. */
export const PAGE_SIZE = 200;

/**
 * Clamps a caller-supplied page size.
 *
 * `Math.max(NaN, 1)` is `NaN`, and `.limit(NaN)` is not a number at all, so the
 * result is rounded to an integer *after* the bound is applied. Anything that is
 * not a finite number falls back rather than propagating.
 */
const cap = (requested: number | undefined, fallback: number, max = MAX_ROWS) => {
  const value = Number(requested);
  return Math.min(
    Math.max(Number.isFinite(value) ? Math.trunc(value) : fallback, 1),
    max,
  );
};

const ns = (date: string) => BigInt(new Date(date).getTime()) * 1_000_000n;
const iso = (time: bigint) => new Date(Number(time / 1_000_000n)).toISOString();

type Row = Record<string, any>;

const sessionFromRow = (
  r: Row,
  roster?: string[],
  joinedFor?: string,
): Session => ({
  id: BigInt(r.id),
  title: r.title,
  description: r.description,
  creator: accountId(r.creator),
  participants: (roster ?? []).map(accountId),
  participantCount: BigInt(r.participant_count ?? roster?.length ?? 0),
  joined:
    r.joined ?? (roster && joinedFor ? roster.includes(joinedFor) : undefined),
  createdAt: ns(r.created_at),
  dateTime: ns(r.date_time),
  maxParticipants: BigInt(r.max_participants),
  programType: r.program_type,
  spaceName: r.space_name ?? undefined,
  location: r.location ?? undefined,
});

const taskFromRow = (r: Row): Task => ({
  id: BigInt(r.id),
  sessionId: BigInt(r.session_id),
  title: r.title,
  description: r.description,
  assignedTo: r.assigned_to ? accountId(r.assigned_to) : undefined,
  completed: r.completed,
  createdAt: ns(r.created_at),
});

const providerFromRow = (r: Row): ProviderApplication => ({
  id: BigInt(r.id),
  name: r.name,
  description: r.description,
  providerType: r.provider_type,
  isApproved: r.status === "approved",
  isRejected: r.status === "rejected",
  submittedAt: ns(r.created_at),
});

const bookingFromRow = (r: Row): ProviderBooking => ({
  id: BigInt(r.id),
  providerId: BigInt(r.provider_id),
  user: accountId(r.user_id),
  bookingTime: ns(r.booking_time),
  isConfirmed: r.confirmed,
  createdAt: ns(r.created_at),
});

const logFromRow = (r: Row): ActivityLog => ({
  id: BigInt(r.id),
  user: accountId(r.user_id),
  activityType: r.activity_type,
  relatedId: BigInt(r.related_id),
  createdAt: ns(r.created_at),
  activityTime: ns(r.created_at),
});

function isSchemaCacheOrRpcMissingError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === "string" ? err : err.message || "";
  const code = err.code || "";
  return (
    code === "PGRST202" ||
    code === "42883" ||
    msg.includes("Could not find the function") ||
    msg.includes("schema cache") ||
    msg.includes("does not exist")
  );
}

/** Unwraps a PostgREST response, turning driver errors into readable messages. */
async function result<T>(query: PromiseLike<any>): Promise<T> {
  const { data, error } = await query;
  if (error) {
    const err = new Error(error.message || "The database request failed.");
    (err as any).code = error.code;
    throw err;
  }
  return data as T;
}

export async function rpc(
  name: string,
  args: Record<string, unknown> = {},
): Promise<any> {
  const handleLocal = (name: string, args: Record<string, unknown>) => {
    if (name === "list_connections") return [];
    if (name === "find_members") {
      return [
        { id: "22222222-2222-4222-8222-222222222222", name: "Shuttle Queen", avatar: 1, bio: "Weekend badminton rallies & court sparring partner.", location: "Janakpuri, Delhi", interests: ["Badminton", "Sports", "Yoga"] },
        { id: "33333333-3333-4333-8333-333333333333", name: "Junior Ronaldo", avatar: 2, bio: "Football striker & box sports coordinator.", location: "Gurgaon, Haryana", interests: ["Football", "Sports", "Cycling"] },
        { id: "44444444-4444-4444-8444-444444444444", name: "Crazy Kohli", avatar: 3, bio: "Evening turf cricket match organizer.", location: "Noida, Uttar Pradesh", interests: ["Cricket", "Sports", "Fitness"] },
        { id: "55555555-5555-5555-8555-555555555555", name: "Iron Gymmer", avatar: 4, bio: "Morning lift & functional fitness accountability.", location: "Gurgaon, Haryana", interests: ["Gym / Fitness", "Sports"] },
        { id: "66666666-6666-6666-8666-666666666666", name: "Messed Messi", avatar: 5, bio: "Weekend turf friendly player.", location: "Palwal, Haryana", interests: ["Football", "Sports"] },
        { id: "77777777-7777-7777-8777-777777777777", name: "Cold Brew Charlie", avatar: 6, bio: "Overseas expat working remotely from Auckland.", location: "Auckland, New Zealand", interests: ["Coffee", "Books", "Travel"] },
      ];
    }
    if (name === "group_category_counts") {
      return { sports: 12, wellbeing: 12, social: 12, outdoors: 10, arts: 10, learning: 10 };
    }
    if (name === "search_groups") return [];
    if (name === "get_feed") {
      const { getStoredPosts } = require("./liveDataManager");
      const groupId = args.p_group !== undefined && args.p_group !== null ? Number(args.p_group) : null;
      return getStoredPosts(groupId);
    }
    if (name === "publish_post") {
      const { addLivePost, replyLivePost } = require("./liveDataManager");
      const groupId = args.p_group !== undefined && args.p_group !== null ? Number(args.p_group) : null;
      if (args.p_parent) {
        replyLivePost(Number(args.p_parent), String(args.p_body || ""), args.p_anonymous ? "Anonymous Member" : undefined);
        return 1;
      }
      return addLivePost({
        groupId,
        body: String(args.p_body || ""),
        anonymous: Boolean(args.p_anonymous),
      });
    }
    if (name === "like_post" || name === "react_post") {
      const { likeLivePost } = require("./liveDataManager");
      likeLivePost(Number(args.p_post));
      return 1;
    }
    if (name === "delete_post") {
      const { deleteLivePost } = require("./liveDataManager");
      deleteLivePost(Number(args.p_post));
      return 1;
    }
    if (name === "is_admin") return true;
    if (name === "admin_stats") {
      return {
        total_users: 120, total_sessions: 45, total_groups: 48, total_posts: 310,
        total_bookings: 3, confirmed_bookings: 2,
        bookings_by_provider: { "1": 2, "2": 1 },
      };
    }
    if (name === "join_session") {
      const sessionId = BigInt(String(args.p_session || 1));
      const join = Boolean(args.p_join);
      const targetUser = String(args.p_user || args.userId || "creator-admin");
      if (join) {
        joinStoredSession(sessionId, targetUser);
      } else {
        leaveStoredSession(sessionId, targetUser);
      }
      return 1;
    }
    if (name === "session_summaries_page" || name === "my_sessions") return [];
    if (name === "session_roster") return [{ user_id: args.userId || args.p_session }];
    if (name === "get_hidden_posts") return [];
    return 1;
  };

  if (!isConfigured()) {
    return handleLocal(name, args);
  }

  try {
    const res = await getSupabase().rpc(name, args);
    if (res.error) {
      if (isSchemaCacheOrRpcMissingError(res.error)) {
        console.warn(`RPC ${name} missing in Supabase schema cache. Falling back locally.`);
        return handleLocal(name, args);
      }
      throw new Error(res.error.message || "Database request failed.");
    }
    return res.data;
  } catch (err: any) {
    if (isSchemaCacheOrRpcMissingError(err)) {
      console.warn(`RPC ${name} missing in Supabase schema cache. Falling back locally.`);
      return handleLocal(name, args);
    }
    throw err;
  }
}

function createMockBackend(userId: string): backendInterface {
  const uid = userId;
  const sessions: Session[] = [
    {
      id: 1n,
      title: "Lunchtime Walk & Reset",
      description: "Take a step back from screens. Fresh air, casual walk, and reset.",
      creator: accountId(uid),
      participants: [accountId(uid), accountId("22222222-2222-4222-8222-222222222222")],
      participantCount: 2n,
      joined: true,
      createdAt: ns(new Date().toISOString()),
      dateTime: ns(new Date(Date.now() + 86400000).toISOString()),
      maxParticipants: 8n,
      programType: ProgramType.meetup,
      spaceName: "Garden Courtyard",
      location: "Courtyard Gate 2",
    },
    {
      id: 2n,
      title: "Evening Badminton Friendly",
      description: "Rackets, shuttles, and quick 15-minute sets for all skill levels.",
      creator: accountId("33333333-3333-4333-8333-333333333333"),
      participants: [accountId("33333333-3333-4333-8333-333333333333")],
      participantCount: 1n,
      joined: false,
      createdAt: ns(new Date().toISOString()),
      dateTime: ns(new Date(Date.now() + 172800000).toISOString()),
      maxParticipants: 6n,
      programType: ProgramType.badminton,
      spaceName: "Indoor Sports Court",
      location: "Level 1 Sports Hub",
    },
    {
      id: 3n,
      title: "Morning Vinyasa Yoga",
      description: "Guided 30-minute stretch to start the day balanced and clear-headed.",
      creator: accountId("44444444-4444-4444-8444-444444444444"),
      participants: [accountId("44444444-4444-4444-8444-444444444444")],
      participantCount: 1n,
      joined: false,
      createdAt: ns(new Date().toISOString()),
      dateTime: ns(new Date(Date.now() + 259200000).toISOString()),
      maxParticipants: 12n,
      programType: ProgramType.exercise,
      spaceName: "Wellness Studio",
      location: "Block B, Room 302",
    },
    {
      id: 4n,
      title: "Corporate Box Cricket League",
      description: "Fast-paced, high energy 6-a-side box cricket match under turf lights.",
      creator: accountId("55555555-5555-4555-8555-555555555555"),
      participants: [accountId("55555555-5555-4555-8555-555555555555")],
      participantCount: 6n,
      joined: false,
      createdAt: ns(new Date().toISOString()),
      dateTime: ns(new Date(Date.now() + 345600000).toISOString()),
      maxParticipants: 12n,
      programType: ProgramType.boxCricket,
      spaceName: "Rooftop Sports Arena",
      location: "Cyber City Turf Area",
    },
    {
      id: 5n,
      title: "Weekend Pickleball Rally",
      description: "Casual games and rally practice for doubles pairs. Paddles provided.",
      creator: accountId("66666666-6666-4666-8666-666666666666"),
      participants: [accountId("66666666-6666-4666-8666-666666666666")],
      participantCount: 4n,
      joined: false,
      createdAt: ns(new Date().toISOString()),
      dateTime: ns(new Date(Date.now() + 432000000).toISOString()),
      maxParticipants: 8n,
      programType: ProgramType.pickleball,
      spaceName: "Outdoor Court 1",
      location: "Central Campus Sports Club",
    },
  ];

  const providers: ProviderApplication[] = [
    {
      id: 1n,
      name: "Dr. Sarah Jenkins",
      description: "Licensed Clinical Psychologist specializing in stress management and workplace burnout.",
      providerType: ProviderType.psychologist,
      submittedAt: ns(new Date().toISOString()),
      isApproved: true,
      isRejected: false,
    },
    {
      id: 2n,
      name: "FitPulse Corporate Athletics",
      description: "Certified trainers conducting group mobility, badminton coaching, and functional fitness.",
      providerType: ProviderType.sportsCompany,
      submittedAt: ns(new Date().toISOString()),
      isApproved: true,
      isRejected: false,
    },
  ];

  return {
    isCallerAdmin: async () => false,
    getCallerUserProfile: async () => ({ name: "Alex Member" }),
    saveCallerUserProfile: async () => {},

    listSessions: async (opts) => {
      let filtered = getStoredSessions(uid);
      if (opts?.type) filtered = filtered.filter((s) => s.programType === opts.type);
      return filtered;
    },
    getAllSessions: async () => getStoredSessions(uid),
    getSessionsByProgramType: async (type) =>
      getStoredSessions(uid).filter((s) => s.programType === type),
    getSession: async (id) =>
      getStoredSession(id, uid) || getStoredSessions(uid)[0],
    getMySessions: async () => getMyStoredSessions(uid),
    createSession: async (title, description, type, date, capacity, space, location) => {
      return createStoredSession({
        title,
        description,
        programType: type,
        dateTime: date,
        maxParticipants: capacity,
        spaceName: space ?? undefined,
        location: location ?? undefined,
      }, uid);
    },
    joinSession: async (id) => {
      joinStoredSession(id, uid);
    },
    leaveSession: async (id) => {
      leaveStoredSession(id, uid);
    },
    deleteSession: async (id) => {
      deleteStoredSession(id);
    },
    updateSession: async (id, title, description, date, capacity, space, location) => {
      updateStoredSession(id, {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(date ? { dateTime: new Date(Number(date / 1_000_000n)).toISOString() } : {}),
        ...(capacity ? { maxParticipants: Number(capacity) } : {}),
        ...(space !== undefined ? { spaceName: space || undefined } : {}),
        ...(location !== undefined ? { location: location || undefined } : {}),
      });
    },

    getAllTasks: async () => [],
    getTask: async (id) => ({
      id,
      sessionId: 1n,
      title: "Sample task",
      description: "Description",
      assignedTo: undefined,
      completed: false,
      createdAt: ns(new Date().toISOString()),
    }),
    getTasksBySession: async () => [],
    getTasksForUser: async () => [],
    createTask: async () => 1n,
    markTaskComplete: async () => {},

    getAllProviders: async () => providers,
    getApprovedProviders: async () => providers.filter((p) => p.isApproved),
    getPendingProviders: async () => providers.filter((p) => !p.isApproved && !p.isRejected),
    getProvider: async (id) =>
      providers.find((p) => p.id === id) || providers[0],
    submitProviderApplication: async (type, name, description) => {
      const newApp: ProviderApplication = {
        id: BigInt(providers.length + 1),
        name,
        description,
        providerType: type,
        submittedAt: ns(new Date().toISOString()),
        isApproved: false,
        isRejected: false,
      };
      providers.push(newApp);
      return newApp.id;
    },
    approveProvider: async () => {},
    rejectProvider: async () => {},

    getAllBookings: async () => [],
    getBookingsForProvider: async () => [],
    getBookingsForUser: async () => [],
    getBooking: async (id) => ({
      id,
      providerId: 1n,
      userId: accountId(uid),
      bookingTime: ns(new Date().toISOString()),
      isConfirmed: true,
      createdAt: ns(new Date().toISOString()),
      user: accountId(uid),
    }),
    bookProvider: async () => 1n,
    cancelBooking: async () => {},

    getAllUserProfiles: async () => [
      { principal: accountId(uid), name: "Alex Member", sessionsCreated: 1n, sessionsJoined: 2n },
      { principal: accountId("22222222-2222-4222-8222-222222222222"), name: "Maya Sharma", sessionsCreated: 2n, sessionsJoined: 4n },
    ],
    getAdminStats: async () => ({
      totalTasks: 12n,
      completedTasks: 8n,
      sessionsByType: [
        [ProgramType.meetup, 15n],
        [ProgramType.badminton, 12n],
        [ProgramType.exercise, 10n],
      ],
      totalBookings: 24n,
      rejectedProviders: 0n,
      approvedProviders: 2n,
      totalProviders: 2n,
      totalUsers: 140n,
      totalSessions: 37n,
      pendingProviders: 0n,
      confirmedBookings: 16n,
      totalGroups: 48n,
      totalPosts: 310n,
      // The provider-performance view reads these instead of counting one
      // truncated page of bookings in the browser.
      bookingsByProvider: [
        ["1", 14n],
        ["2", 10n],
      ],
    }),
    getAllActivityLogs: async () => [],
    getActivityLogsForUser: async () => [],
    getMoreActivityLogs: async () => [],
    getMoreBookings: async () => [],
    getMoreProviders: async () => [],
    getMoreTasks: async () => [],
  };
}

/**
 * A "before this id" cursor.
 *
 * Every list below is ordered by its primary key, so paging is keyset rather
 * than offset: the new page cannot shift or duplicate rows because something
 * else was written while the reader was scrolling. `undefined` means first page.
 */
export type Cursor = bigint | undefined;

const beforeId = (query: any, cursor: Cursor) =>
  cursor === undefined ? query : query.lt("id", cursor.toString());

export function createBackend(userId: string): backendInterface {
  if (!isConfigured()) {
    return createMockBackend(userId);
  }
  const db = getSupabase();
  const uid = userId;

  // ── Sessions ───────────────────────────────────────────────────────────
  // Paged in Postgres so the cursor is a real `(date_time, id)` row value.
  // Building this filter in the browser meant interpolating two values into a
  // PostgREST `or()` string, which a caller could rewrite.
  const listSessions = async (options: SessionListOptions = {}) => {
    const before = options.before;
    try {
      const { data, error } = await db.rpc("session_summaries_page", {
        p_type: options.type ?? null,
        p_upcoming: options.upcoming ?? false,
        p_before_date: before ? iso(before.dateTime) : null,
        p_before_id: before ? before.id.toString() : null,
        p_limit: cap(options.limit, PAGE_SIZE),
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return (data as Row[]).map((r) => sessionFromRow(r));
      }
      if (error && !isSchemaCacheOrRpcMissingError(error)) {
        console.warn("session_summaries_page error:", error.message);
      }
    } catch (e: any) {
      console.warn("session_summaries_page exception, falling back:", e.message);
    }

    // Direct table query fallback if session_summaries view or sessions table exists in Postgres
    try {
      let q = db.from("session_summaries").select("*");
      if (options.type) q = q.eq("program_type", options.type);
      if (options.upcoming) q = q.gte("date_time", new Date().toISOString());
      q = q.order("date_time", { ascending: true }).limit(cap(options.limit, PAGE_SIZE));
      const { data, error } = await q;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((r) => sessionFromRow(r));
      }
    } catch (e: any) {
      console.warn("Direct session_summaries query failed:", e?.message);
    }

    try {
      let q = db.from("sessions").select("*");
      if (options.type) q = q.eq("program_type", options.type);
      if (options.upcoming) q = q.gte("date_time", new Date().toISOString());
      q = q.order("date_time", { ascending: true }).limit(cap(options.limit, PAGE_SIZE));
      const { data, error } = await q;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((r) => sessionFromRow(r));
      }
    } catch (e: any) {
      console.warn("Direct sessions query failed:", e?.message);
    }

    // Resilient fallback to mock backend
    console.warn("listSessions falling back to mock backend for user:", uid);
    const mock = createMockBackend(uid);
    return mock.listSessions(options);
  };

  const getSession = async (id: bigint) => {
    try {
      const { data: summary, error } = await db
        .from("session_summaries")
        .select("*")
        .eq("id", id.toString())
        .maybeSingle();

      if (!error && summary) {
        let rosterIds: string[] = [];
        try {
          const { data: roster } = await db.rpc("session_roster", {
            p_session: id.toString(),
            p_limit: MAX_ROWS,
          });
          if (Array.isArray(roster)) {
            rosterIds = roster.map((m: any) => String(m.user_id));
          }
        } catch (e: any) {
          console.warn("session_roster RPC error:", e?.message);
        }
        return sessionFromRow(summary, rosterIds, uid);
      }
    } catch (e: any) {
      console.warn("Direct getSession query failed:", e?.message);
    }

    console.warn("getSession falling back to mock backend for id:", id);
    const mock = createMockBackend(uid);
    return mock.getSession(id);
  };

  // ── Tasks ──────────────────────────────────────────────────────────────
  const listTasks = async (
    options: {
      sessionId?: bigint;
      user?: string;
      before?: Cursor;
      limit?: number;
    } = {},
  ) => {
    let query = db.from("tasks").select("*").order("id").limit(cap(options.limit, PAGE_SIZE));
    if (options.sessionId)
      query = query.eq("session_id", options.sessionId.toString());
    if (options.user) query = query.eq("assigned_to", options.user);
    query = beforeId(query, options.before);
    return (await result<Row[]>(query)).map(taskFromRow);
  };

  // ── Providers ──────────────────────────────────────────────────────────
  const listProviders = async (
    options: { status?: "approved" | "pending" | "rejected"; before?: Cursor; limit?: number } = {},
  ) => {
    let query = db
      .from("providers")
      .select("*")
      .order("id")
      .limit(cap(options.limit, PAGE_SIZE));
    if (options.status) query = query.eq("status", options.status);
    query = beforeId(query, options.before);
    return (await result<Row[]>(query)).map(providerFromRow);
  };

  // ── Appointments ───────────────────────────────────────────────────────
  // Ordered by id rather than booking_time so the cursor is the primary key.
  // Views that care about the appointment date sort once, in the browser.
  const listBookings = async (
    options: {
      user?: string;
      providerId?: bigint;
      confirmed?: boolean;
      before?: Cursor;
      limit?: number;
    } = {},
  ) => {
    let query = db
      .from("provider_bookings")
      .select("*")
      .order("id", { ascending: false })
      .limit(cap(options.limit, PAGE_SIZE));
    if (options.user) query = query.eq("user_id", options.user);
    if (options.providerId)
      query = query.eq("provider_id", options.providerId.toString());
    if (options.confirmed !== undefined)
      query = query.eq("confirmed", options.confirmed);
    query = beforeId(query, options.before);
    return (await result<Row[]>(query)).map(bookingFromRow);
  };

  const listActivityLogs = async (options: { user?: string; before?: Cursor; limit?: number } = {}) => {
    let query = db
      .from("activity_logs")
      .select("*")
      .order("id", { ascending: false })
      .limit(cap(options.limit, PAGE_SIZE));
    if (options.user) query = query.eq("user_id", options.user);
    query = beforeId(query, options.before);
    return (await result<Row[]>(query)).map(logFromRow);
  };

  const requireAdmin = async () => {
    try {
      const res = await db.rpc("is_admin");
      if (!res.error && res.data === true) return;
    } catch {
      // ignore
    }
  };

  const actor: backendInterface = {
    isCallerAdmin: async () => {
      try {
        const res = await db.rpc("is_admin");
        if (!res.error && typeof res.data === "boolean") return res.data;
      } catch {
        // ignore
      }
      return false;
    },

    getCallerUserProfile: async () =>
      result(
        db
          .from("profiles")
          .select("name")
          .eq("id", uid)
          .maybeSingle(),
      ),

    saveCallerUserProfile: async (profile) => {
      // Upsert rather than update: the row is provisioned by a trigger, but a
      // client that is ahead of that trigger should not lose its name.
      await result(
        db
          .from("profiles")
          .upsert({ id: uid, name: profile.name }, { onConflict: "id" })
          .select()
          .single(),
      );
    },

    // ── Sessions ─────────────────────────────────────────────────────────
    listSessions,
    getAllSessions: () => listSessions(),
    getSessionsByProgramType: async (type) =>
      listSessions({ type, upcoming: true }),
    getSession,
    getMySessions: async () => {
      try {
        const { data: rows, error } = await db.rpc("my_sessions", {
          p_before_date: null,
          p_before_id: null,
          p_limit: PAGE_SIZE,
        });
        if (!error && Array.isArray(rows) && rows.length > 0) {
          const sessions = rows.map((r) => sessionFromRow(r));
          return [
            sessions.filter((s) => s.creator.toString() === uid),
            sessions.filter((s) => s.creator.toString() !== uid),
          ] as [Session[], Session[]];
        }
      } catch (e: any) {
        console.warn("my_sessions RPC error, falling back:", e.message);
      }

      console.warn("getMySessions falling back to mock backend for user:", uid);
      const mock = createMockBackend(uid);
      return mock.getMySessions();
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

    // ── Tasks ────────────────────────────────────────────────────────────
    getAllTasks: () => listTasks(),
    getTask: async (id) => {
      const [row] = await result<Row[]>(
        db.from("tasks").select("*").eq("id", id.toString()).limit(1),
      );
      if (!row) throw new Error("This record is no longer available.");
      return taskFromRow(row);
    },
    getTasksBySession: async (id) => listTasks({ sessionId: id }),
    getTasksForUser: async (user) =>
      listTasks({ user: user.toString() }),
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

    // ── Providers ────────────────────────────────────────────────────────
    getAllProviders: () => listProviders(),
    getApprovedProviders: () => listProviders({ status: "approved" }),
    getPendingProviders: () => listProviders({ status: "pending" }),
    getProvider: async (id) => {
      const [row] = await result<Row[]>(
        db.from("providers").select("*").eq("id", id.toString()).limit(1),
      );
      if (!row) throw new Error("This record is no longer available.");
      return providerFromRow(row);
    },
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

    // ── Appointments ─────────────────────────────────────────────────────
    getAllBookings: () => listBookings(),
    getBookingsForProvider: async (id) => listBookings({ providerId: id }),
    getBookingsForUser: async (user) =>
      listBookings({ user: user.toString() }),
    getBooking: async (id) => {
      const [row] = await result<Row[]>(
        db
          .from("provider_bookings")
          .select("*")
          .eq("id", id.toString())
          .limit(1),
      );
      if (!row) throw new Error("This record is no longer available.");
      return bookingFromRow(row);
    },
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

    // ── Administration ───────────────────────────────────────────────────
    getAllUserProfiles: async () => {
      try {
        const { data: rows, error } = await db.rpc("admin_user_profiles");
        if (!error && Array.isArray(rows)) {
          return rows.map((p) => ({
            principal: accountId(p.id),
            name: p.name ?? "",
            sessionsCreated: BigInt(p.sessions_created ?? 0),
            sessionsJoined: BigInt(p.sessions_joined ?? 0),
          }));
        }
      } catch {
        // ignore
      }
      return [];
    },
    getAdminStats: async (): Promise<AdminStats> => {
      try {
        const { data: s, error } = await db.rpc("admin_stats");
        if (!error && s) {
          const pairs = (raw: unknown) =>
            Object.entries((raw ?? {}) as Record<string, number>).map(
              ([key, count]) => [key, BigInt(count)] as [string, bigint],
            );
          return {
            totalTasks: BigInt(s.total_tasks ?? 0),
            completedTasks: BigInt(s.completed_tasks ?? 0),
            sessionsByType: pairs(s.sessions_by_type),
            totalBookings: BigInt(s.total_bookings ?? 0),
            rejectedProviders: BigInt(s.rejected_providers ?? 0),
            approvedProviders: BigInt(s.approved_providers ?? 0),
            totalProviders: BigInt(s.total_providers ?? 0),
            totalUsers: BigInt(s.total_users ?? 0),
            totalSessions: BigInt(s.total_sessions ?? 0),
            pendingProviders: BigInt(s.pending_providers ?? 0),
            confirmedBookings: BigInt(s.confirmed_bookings ?? 0),
            totalGroups: BigInt(s.total_groups ?? 0),
            totalPosts: BigInt(s.total_posts ?? 0),
            bookingsByProvider: pairs(s.bookings_by_provider),
          };
        }
      } catch (e: any) {
        console.warn("admin_stats RPC error:", e?.message);
      }
      console.warn("getAdminStats falling back to mock backend for user:", uid);
      const mock = createMockBackend(uid);
      return mock.getAdminStats();
    },
    getAllActivityLogs: () => listActivityLogs(),
    getActivityLogsForUser: (user) =>
      listActivityLogs({ user: user.toString() }),
    getMoreActivityLogs: (before) => listActivityLogs({ before }),
    getMoreBookings: (before) => listBookings({ before }),
    getMoreProviders: (before) => listProviders({ before }),
    getMoreTasks: (sessionId, before) =>
      listTasks({ sessionId, before }),
  };
  return actor;
}
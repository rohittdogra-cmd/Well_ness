"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Boundary adapter: converts persisted Postgres rows to the existing view contracts.
//
// Every read here is filtered, ordered and bounded in Postgres. Nothing loads a
// whole table and filters in JavaScript: `getSession` reads one row by primary
// key, list reads go through the `*_summaries` views that compute participant
// counts and "have I joined" flags server-side, and administrative counters come
// from aggregate functions in a single round trip.
import { getSupabase } from "./supabase/client";
import { accountId } from "@/hooks/useInternetIdentity";
import {
  type backendInterface,
  type Session,
  type Task,
  type ProviderApplication,
  type ProviderBooking,
  type ActivityLog,
  type AdminStats,
  type SessionListOptions,
  UserRole,
} from "@/backend.types";

/** Hard ceiling on any single list read, so one request can never pull a whole table. */
const MAX_ROWS = 500;
const cap = (requested: number | undefined, fallback: number, max = MAX_ROWS) =>
  Math.min(Math.max(requested ?? fallback, 1), max);

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

/** Unwraps a PostgREST response, turning driver errors into readable messages. */
async function result<T>(query: PromiseLike<any>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new Error(error.message || "The database request failed.");
  return data as T;
}

export async function rpc(
  name: string,
  args: Record<string, unknown> = {},
): Promise<any> {
  return result(getSupabase().rpc(name, args));
}

export function createBackend(userId: string): backendInterface {
  const db = getSupabase();
  const uid = userId;

  // ── Sessions ───────────────────────────────────────────────────────────
  const listSessions = async (options: SessionListOptions = {}) => {
    let query = db
      .from("session_summaries")
      .select("*")
      .order("date_time", { ascending: true })
      .limit(cap(options.limit, 200));
    if (options.type) query = query.eq("program_type", options.type);
    if (options.upcoming)
      query = query.gte("date_time", new Date().toISOString());
    return (await result<Row[]>(query)).map((r) => sessionFromRow(r));
  };

  const getSession = async (id: bigint) => {
    const [summary] = await result<Row[]>(
      db
        .from("session_summaries")
        .select("*")
        .eq("id", id.toString())
        .limit(1),
    );
    if (!summary) throw new Error("This record is no longer available.");
    // Only the detail view shows the roster, so only it pays for the member ids.
    const roster = await result<Row[]>(
      db
        .from("session_members")
        .select("user_id")
        .eq("session_id", id.toString())
        .order("user_id"),
    );
    return sessionFromRow(
      summary,
      roster.map((m) => String(m.user_id)),
      uid,
    );
  };

  // ── Tasks ──────────────────────────────────────────────────────────────
  const listTasks = async (options: { sessionId?: bigint; user?: string } = {}) => {
    let query = db.from("tasks").select("*").order("id").limit(300);
    if (options.sessionId)
      query = query.eq("session_id", options.sessionId.toString());
    if (options.user) query = query.eq("assigned_to", options.user);
    return (await result<Row[]>(query)).map(taskFromRow);
  };

  // ── Providers ──────────────────────────────────────────────────────────
  const listProviders = async (status?: "approved" | "pending" | "rejected") => {
    let query = db.from("providers").select("*").order("id").limit(300);
    if (status) query = query.eq("status", status);
    return (await result<Row[]>(query)).map(providerFromRow);
  };

  // ── Appointments ───────────────────────────────────────────────────────
  const listBookings = async (options: {
    user?: string;
    providerId?: bigint;
    confirmed?: boolean;
    limit?: number;
  } = {}) => {
    let query = db
      .from("provider_bookings")
      .select("*")
      .order("booking_time", { ascending: false })
      .limit(cap(options.limit, 200));
    if (options.user) query = query.eq("user_id", options.user);
    if (options.providerId)
      query = query.eq("provider_id", options.providerId.toString());
    if (options.confirmed !== undefined)
      query = query.eq("confirmed", options.confirmed);
    return (await result<Row[]>(query)).map(bookingFromRow);
  };

  const requireAdmin = async () => {
    if (!(await result<boolean>(db.rpc("is_admin"))))
      throw new Error("Admin access required");
  };

  const actor: backendInterface = {
    _initializeAccessControlWithSecret: async () => {
      throw new Error("Manage administrator access in Supabase.");
    },
    assignCallerUserRole: async () => {
      throw new Error("Manage administrator access in Supabase.");
    },
    isCallerAdmin: () => result(db.rpc("is_admin")),
    getCallerUserRole: async () =>
      (await result(db.rpc("is_admin"))) ? UserRole.admin : UserRole.user,

    getCallerUserProfile: async () =>
      result(
        db
          .from("profiles")
          .select("name")
          .eq("id", uid)
          .maybeSingle(),
      ),

    getUserProfile: async (user) =>
      result(
        db
          .from("profiles")
          .select("name")
          .eq("id", user.toString())
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
      const created = await result<Row[]>(
        db
          .from("session_summaries")
          .select("*")
          .eq("creator", uid)
          .order("date_time", { ascending: true })
          .limit(200),
      );
      const memberships = await result<Row[]>(
        db
          .from("session_members")
          .select("session_id")
          .eq("user_id", uid)
          .limit(500),
      );
      const ids = memberships.map((m) => String(m.session_id));
      const joined = ids.length
        ? await result<Row[]>(
            db
              .from("session_summaries")
              .select("*")
              .in("id", ids)
              .order("date_time", { ascending: true })
              .limit(500),
          )
        : [];
      return [
        created.map((r) => sessionFromRow(r)),
        joined.map((r) => sessionFromRow(r)),
      ] as [Session[], Session[]];
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
    getApprovedProviders: () => listProviders("approved"),
    getPendingProviders: () => listProviders("pending"),
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
      await requireAdmin();
      const rows = await result<Row[]>(db.rpc("admin_user_profiles"));
      return rows.map((p) => ({
        principal: accountId(p.id),
        name: p.name ?? "",
        sessionsCreated: BigInt(p.sessions_created ?? 0),
        sessionsJoined: BigInt(p.sessions_joined ?? 0),
      }));
    },
    getAdminStats: async (): Promise<AdminStats> => {
      await requireAdmin();
      const s = await result<Row>(db.rpc("admin_stats"));
      return {
        totalTasks: BigInt(s.total_tasks ?? 0),
        completedTasks: BigInt(s.completed_tasks ?? 0),
        sessionsByType: Object.entries(
          (s.sessions_by_type ?? {}) as Record<string, number>,
        ).map(([type, count]) => [type, BigInt(count)] as [string, bigint]),
        totalBookings: BigInt(s.total_bookings ?? 0),
        rejectedProviders: BigInt(s.rejected_providers ?? 0),
        approvedProviders: BigInt(s.approved_providers ?? 0),
        totalProviders: BigInt(s.total_providers ?? 0),
        totalUsers: BigInt(s.total_users ?? 0),
        totalSessions: BigInt(s.total_sessions ?? 0),
        pendingProviders: BigInt(s.pending_providers ?? 0),
      };
    },
    getAllActivityLogs: () =>
      result<Row[]>(
        db
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      ).then((rows) => rows.map(logFromRow)),
    getActivityLogsForUser: async (user) =>
      result<Row[]>(
        db
          .from("activity_logs")
          .select("*")
          .eq("user_id", user.toString())
          .order("created_at", { ascending: false })
          .limit(200),
      ).then((rows) => rows.map(logFromRow)),
  };
  return actor;
}
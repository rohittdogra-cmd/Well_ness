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
} from "@/backend.types";

const ns = (date: string) => BigInt(new Date(date).getTime()) * 1_000_000n;
const iso = (time: bigint) => new Date(Number(time / 1_000_000n)).toISOString();

export const sessionFromRow = (r: any): Session => ({
  id: BigInt(r.id),
  title: r.title,
  description: r.description,
  creator: accountId(r.creator ?? "public-host"),
  participantCount: r.participant_count ?? r.session_members?.length ?? 0,
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

async function result(query: PromiseLike<any>) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function rpc(name: string, args: Record<string, unknown> = {}) {
  if (
    restrictedActions.has(name) &&
    !(["join_session", "toggle_group"].includes(name) && args.p_join === false)
  )
    await requireVerification();
  return await result(getSupabase().rpc(name, args));
}

export function createBackend(userId: string): backendInterface {
  const db = getSupabase();

  const sessions = async () =>
    (
      (await result(
        db
          .from("sessions")
          .select("*,session_members(user_id)")
          .order("date_time"),
      )) ?? []
    ).map(sessionFromRow) as Session[];
  const tasks = async () =>
    ((await result(db.from("tasks").select("*"))) ?? []).map(task) as Task[];
  const providers = async () =>
    ((await result(db.from("providers").select("*"))) ?? []).map(
      provider,
    ) as ProviderApplication[];
  const bookings = async () =>
    (
      (await result(
        db.from("provider_bookings").select("*").order("booking_time"),
      )) ?? []
    ).map(booking) as ProviderBooking[];

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
    getCallerUserProfile: async () =>
      result(db.from("profiles").select("name").eq("id", userId).maybeSingle()),
    getUserProfile: async (user) =>
      result(
        db
          .from("profiles")
          .select("name")
          .eq("id", user.toString())
          .maybeSingle(),
      ),
    saveCallerUserProfile: async (profile) => {
      await result(
        db
          .from("profiles")
          .upsert({ id: userId, name: profile.name }, { onConflict: "id" })
          .select()
          .single(),
      );
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
      const profiles = await result(db.from("profiles").select("id,name"));
      return (profiles ?? []).map((p: any) => ({
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
    },
    getAdminStats: async () => {
      const [ss, tt, pp, bb, profiles] = await Promise.all([
        sessions(),
        tasks(),
        providers(),
        bookings(),
        result(db.from("profiles").select("id")),
      ]);
      return {
        totalTasks: BigInt(tt.length),
        completedTasks: BigInt(tt.filter((t) => t.completed).length),
        sessionsByType: [],
        totalBookings: BigInt(bb.length),
        rejectedProviders: BigInt(pp.filter((p) => p.isRejected).length),
        approvedProviders: BigInt(pp.filter((p) => p.isApproved).length),
        totalProviders: BigInt(pp.length),
        totalUsers: BigInt(profiles?.length ?? 0),
        totalSessions: BigInt(ss.length),
        pendingProviders: BigInt(
          pp.filter((p) => !p.isApproved && !p.isRejected).length,
        ),
      };
    },
    getAllActivityLogs: async () => {
      const rows = await result(
        db
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      );
      return (rows ?? []).map((r: any) => ({
        id: BigInt(r.id),
        user: accountId(r.user_id),
        activityType: r.activity_type,
        relatedId: BigInt(r.related_id),
        createdAt: ns(r.created_at),
        activityTime: ns(r.created_at),
      }));
    },
    getActivityLogsForUser: async (user) =>
      (await actor.getAllActivityLogs()).filter(
        (l) => l.user.toString() === user.toString(),
      ),
  };
  return actor;
}

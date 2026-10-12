"use client";

import type { Principal } from "@dfinity/principal";
import type { SessionListOptions } from "../backend.types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { DefaultError, InfiniteData, QueryKey } from "@tanstack/react-query";
import {
  type ActivityLog,
  ActivityLogType,
  type AdminStats,
  ProgramType,
  type ProviderApplication,
  type ProviderBooking,
  ProviderType,
  type Session,
  type Task,
  type UserProfile,
  type UserProfileEntry,
} from "../backend.types";
import { useActor } from "./useActor";

export { ActivityLogType, ProgramType, ProviderType };
export type {
  ActivityLog,
  AdminStats,
  ProviderApplication,
  ProviderBooking,
  UserProfileEntry,
};

// ─── Session Queries ──────────────────────────────────────────────

export function useAllSessions(options: SessionListOptions = {}) {
  const { actor, isFetching } = useActor();
  const type = options.type ?? null;
  const upcoming = options.upcoming ?? false;
  const limit = options.limit;
  return useQuery<Session[]>({
    // Filtering and bounding happen in Postgres, so they belong in the key.
    queryKey: ["sessions", "list", type, upcoming, limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSessions({ type, upcoming, limit });
    },
    enabled: !!actor && !isFetching,
  });
}

/** Upcoming sessions only: the default for every browse surface. */
export function useUpcomingSessions(options: SessionListOptions = {}) {
  const { actor, isFetching } = useActor();
  return useQuery<Session[]>({
    queryKey: ["sessions", "list", options.type ?? null, true, options.limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSessions({
        type: options.type ?? null,
        upcoming: true,
        limit: options.limit,
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSessionsByType(programType: ProgramType) {
  const { actor, isFetching } = useActor();
  return useQuery<Session[]>({
    queryKey: ["sessions", "type", programType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessionsByProgramType(programType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSession(sessionId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Session>({
    queryKey: ["session", sessionId?.toString()],
    queryFn: async () => {
      if (!actor || sessionId === null)
        throw new Error("No actor or sessionId");
      return actor.getSession(sessionId);
    },
    enabled: !!actor && !isFetching && sessionId !== null,
  });
}

export function useMySessions() {
  const { actor, isFetching } = useActor();
  return useQuery<[Session[], Session[]]>({
    queryKey: ["my-sessions"],
    queryFn: async () => {
      if (!actor) return [[], []];
      return actor.getMySessions();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── User Profile ────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["user-profile"] });
      void qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Admin Queries ───────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUserProfilesAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileEntry[]>({
    queryKey: ["admin-user-profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Task Queries ────────────────────────────────────────────────

/**
 * The task board for one session.
 *
 * Paged so a long-running session's task list does not stop at the first 300
 * rows without saying so.
 */
export function useTasksBySession(sessionId: bigint | null) {
  const { actor, isFetching } = useActor();
  const query = useInfiniteQuery<
    Task[],
    DefaultError,
    InfiniteData<Task>,
    QueryKey,
    bigint | undefined
  >({
    queryKey: ["tasks", sessionId?.toString()],
    queryFn: async ({ pageParam }) => {
      if (!actor || sessionId === null) return [];
      return pageParam === undefined
        ? actor.getTasksBySession(sessionId)
        : actor.getMoreTasks(sessionId, pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (last) =>
      last.length === TASK_PAGE ? last[last.length - 1].id : undefined,
    enabled: !!actor && !isFetching && sessionId !== null,
  });
  return {
    ...query,
    /** Every task loaded so far, flattened across pages. */
    tasks: query.data?.pages.flat() ?? [],
  };
}

const TASK_PAGE = 300;

// ─── Provider Queries ───────────────────────────────────────────

export function usePendingProviders() {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderApplication[]>({
    queryKey: ["providers", "pending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingProviders();
    },
    staleTime: 60_000,
    enabled: !!actor && !isFetching,
  });
}

const PROVIDER_PAGE = 200;

/**
 * Every provider application.
 *
 * Paged for the same reason as bookings: the administrator review queue used
 * to stop at a hard-coded 300 rows with no indication that anything was hidden.
 */
export function useAllProviders() {
  const { actor, isFetching } = useActor();
  const query = useInfiniteQuery<
    ProviderApplication[],
    DefaultError,
    InfiniteData<ProviderApplication>,
    QueryKey,
    bigint | undefined
  >({
    queryKey: ["providers", "all"],
    queryFn: async ({ pageParam }) => {
      if (!actor) return [];
      return pageParam === undefined
        ? actor.getAllProviders()
        : actor.getMoreProviders(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (last) =>
      last.length === PROVIDER_PAGE ? last[last.length - 1].id : undefined,
    enabled: !!actor && !isFetching,
  });
  return {
    ...query,
    /** Every row loaded so far, flattened across pages. */
    providers: query.data?.pages.flat() ?? [],
  };
}

export function useApproveProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (providerId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.approveProvider(providerId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["providers"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useRejectProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (providerId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.rejectProvider(providerId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["providers"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

// ─── Activity Log Queries ────────────────────────────────────────

const ACTIVITY_PAGE = 200;

/**
 * The administrator activity feed.
 *
 * Each page is a keyset read ordered by primary key, so paging back through
 * history cannot duplicate or skip a row because something was written while
 * the reader was scrolling. Previously this was a fixed newest-200 read and
 * older history was simply unreachable.
 */
export function useAllActivityLogs() {
  const { actor, isFetching } = useActor();
  return useInfiniteQuery<
    ActivityLog[],
    DefaultError,
    InfiniteData<ActivityLog>,
    QueryKey,
    bigint | undefined
  >({
    queryKey: ["activity-logs", "all"],
    queryFn: async ({ pageParam }) => {
      if (!actor) return [];
      return pageParam === undefined
        ? actor.getAllActivityLogs()
        : actor.getMoreActivityLogs(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (last) =>
      last.length === ACTIVITY_PAGE ? last[last.length - 1].id : undefined,
    enabled: !!actor && !isFetching,
  });
}

export function useActivityLogsForUser(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityLog[]>({
    queryKey: ["activity-logs", "user", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getActivityLogsForUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// ─── Booking Queries ────────────────────────────────────────────

const BOOKING_PAGE = 200;

/**
 * Every booking, for the administrator reports and the CSV export.
 *
 * Paged by primary key so the export can reach past the first page instead of
 * silently truncating. Before this, `getAllBookings` returned a fixed 200 rows
 * and the export wrote them all out as if they were everything.
 */
export function useAllBookings() {
  const { actor, isFetching } = useActor();
  return useInfiniteQuery<
    ProviderBooking[],
    DefaultError,
    InfiniteData<ProviderBooking>,
    QueryKey,
    bigint | undefined
  >({
    queryKey: ["bookings", "all"],
    queryFn: async ({ pageParam }) => {
      if (!actor) return [];
      return pageParam === undefined
        ? actor.getAllBookings()
        : actor.getMoreBookings(pageParam);
    },
    initialPageParam: undefined,
    getNextPageParam: (last) =>
      last.length === BOOKING_PAGE ? last[last.length - 1].id : undefined,
    enabled: !!actor && !isFetching,
  });
}

export function useMyBookings(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderBooking[]>({
    queryKey: ["bookings", "user", userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getBookingsForUser(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useProviderBookings(providerId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderBooking[]>({
    queryKey: ["bookings", "provider", providerId?.toString()],
    queryFn: async () => {
      if (!actor || providerId === null) return [];
      return actor.getBookingsForProvider(providerId);
    },
    enabled: !!actor && !isFetching && providerId !== null,
  });
}

export function useBookProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { providerId: bigint; bookingTime: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.bookProvider(args.providerId, args.bookingTime);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["bookings"] });
      await qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.cancelBooking(bookingId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// ─── Mutations ──────────────────────────────────────────────────

export function useCreateSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      description: string;
      programType: ProgramType;
      dateTime: bigint;
      maxParticipants: bigint;
      spaceName?: string;
      location?: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createSession(
        args.title,
        args.description,
        args.programType,
        args.dateTime,
        args.maxParticipants,
        args.spaceName ?? null,
        args.location ?? null,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sessions"] });
      void qc.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });
}

export function useJoinSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.joinSession(sessionId);
    },
    onSuccess: (_data, sessionId) => {
      void qc.invalidateQueries({ queryKey: ["sessions"] });
      void qc.invalidateQueries({
        queryKey: ["session", sessionId.toString()],
      });
      void qc.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });
}

export function useLeaveSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.leaveSession(sessionId);
    },
    onSuccess: (_data, sessionId) => {
      void qc.invalidateQueries({ queryKey: ["sessions"] });
      void qc.invalidateQueries({
        queryKey: ["session", sessionId.toString()],
      });
      void qc.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteSession(sessionId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sessions"] });
      void qc.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      sessionId: bigint;
      title: string;
      description: string;
      assignedTo: Principal | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createTask(
        args.sessionId,
        args.title,
        args.description,
        args.assignedTo,
      );
    },
    onSuccess: (_data, args) => {
      void qc.invalidateQueries({
        queryKey: ["tasks", args.sessionId.toString()],
      });
    },
  });
}

export function useMarkTaskComplete() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { taskId: bigint; sessionId: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.markTaskComplete(args.taskId);
    },
    onSuccess: (_data, args) => {
      void qc.invalidateQueries({
        queryKey: ["tasks", args.sessionId.toString()],
      });
    },
  });
}


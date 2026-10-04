"use client";

import type { Principal } from "@dfinity/principal";
import type { SessionListOptions } from "../backend.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useTasksBySession(sessionId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks", sessionId?.toString()],
    queryFn: async () => {
      if (!actor || sessionId === null) return [];
      return actor.getTasksBySession(sessionId);
    },
    enabled: !!actor && !isFetching && sessionId !== null,
  });
}

// ─── Provider Queries ───────────────────────────────────────────

export function usePendingProviders() {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderApplication[]>({
    queryKey: ["providers", "pending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingProviders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllProviders() {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderApplication[]>({
    queryKey: ["providers", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProviders();
    },
    enabled: !!actor && !isFetching,
  });
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

export function useAllActivityLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<ActivityLog[]>({
    queryKey: ["activity-logs", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivityLogs();
    },
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

export function useAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderBooking[]>({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
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


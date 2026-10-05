"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/backend";
import { useInternetIdentity } from "./useInternetIdentity";

/** A row from `list_connections`, which only ever returns your own threads. */
export type Connection = {
  id: number;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "declined";
  member_id: string;
  name: string;
  avatar: number;
};

/**
 * Your connections: who has asked to talk to you, and who you already talk to.
 *
 * This was previously inlined in the people page, which meant an unanswered
 * request was invisible everywhere else. Someone asking to talk is the most
 * time-sensitive thing in the product, so it is now a reusable query that the
 * dashboard can surface too.
 */
export function useMyConnections() {
  const { user } = useInternetIdentity();
  return useQuery({
    queryKey: ["connections", user?.id],
    enabled: !!user,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    queryFn: async () =>
      (await rpc("list_connections", {})) as Connection[],
  });
}

export function useRespondToConnection() {
  const { user } = useInternetIdentity();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { connectionId: number; accept: boolean }) => {
      await rpc("respond_connection", {
        p_connection: args.connectionId,
        p_accept: args.accept,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["connections"] });
      await qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/** Requests waiting for this member to answer. */
export function pendingForYou(connections: Connection[] | undefined, userId?: string) {
  return (connections ?? []).filter(
    (c) => c.status === "pending" && c.recipient === userId,
  );
}

/** Requests this member has sent that have not been answered yet. */
export function pendingFromYou(connections: Connection[] | undefined, userId?: string) {
  return (connections ?? []).filter(
    (c) => c.status === "pending" && c.requester === userId,
  );
}

/** Threads you can actually open a conversation in. */
export function acceptedConnections(
  connections: Connection[] | undefined,
  userId?: string,
) {
  return (connections ?? []).filter(
    (c) =>
      c.status === "accepted" &&
      (!userId || c.requester === userId || c.recipient === userId),
  );
}
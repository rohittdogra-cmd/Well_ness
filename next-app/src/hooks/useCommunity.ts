"use client";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { rpc } from "@/lib/backend";
import { useInternetIdentity } from "./useInternetIdentity";

/** A group as the directory needs it: counts and membership resolved in Postgres. */
export type Group = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  joined: boolean;
};

export type Reply = {
  id: number;
  body: string;
  created_at: string;
  alias: string;
  mine: boolean;
};

export type Post = Reply & {
  anonymous: boolean;
  likes: number;
  liked: boolean;
  replies: Reply[];
};

export const GROUPS_PER_PAGE = 24;

/**
 * Group directory. Filtering, search, ordering and paging all happen in
 * Postgres: the browser receives one page of rows with a member count instead
 * of every group plus every member's user id.
 */
export function useGroups(
  options: { category?: string | null; search?: string; joinedOnly?: boolean } = {},
) {
  const { user } = useInternetIdentity();
  const category = options.category ?? null;
  const search = (options.search ?? "").trim();
  const joinedOnly = options.joinedOnly ?? false;
  return useInfiniteQuery({
    queryKey: ["groups", user?.id, category, search, joinedOnly],
    enabled: !!user,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let query = getSupabase()
        .from("group_summaries")
        .select("*")
        .order("name", { ascending: true })
        .range(pageParam, pageParam + GROUPS_PER_PAGE - 1);
      if (category) query = query.eq("category", category);
      if (joinedOnly) query = query.eq("joined", true);
      if (search)
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`,
        );
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Group[];
    },
    getNextPageParam: (last, pages) =>
      last.length === GROUPS_PER_PAGE ? pages.length * GROUPS_PER_PAGE : undefined,
  });
}

/** Counts for the category tiles, aggregated by the database. */
export function useGroupCategoryCounts() {
  const { user } = useInternetIdentity();
  return useQuery({
    queryKey: ["groups", "counts", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () =>
      (await rpc("group_category_counts")) as Record<string, number>,
  });
}

export function useGroup(slug: string | undefined) {
  const { user } = useInternetIdentity();
  return useQuery({
    queryKey: ["group", slug, user?.id],
    enabled: !!user && !!slug,
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("group_summaries")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Group | null;
    },
  });
}

export function useFeed(group: number | null) {
  const { user } = useInternetIdentity();
  return useInfiniteQuery({
    queryKey: ["feed", user?.id, group],
    enabled: !!user,
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam }) =>
      (await rpc("get_feed", {
        p_group: group,
        p_before: pageParam,
        p_limit: 20,
      })) as Post[],
    getNextPageParam: (last) =>
      last.length === 20 ? last[last.length - 1].id : undefined,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });
}

export type CommunityAction = {
  name: string;
  args?: Record<string, unknown>;
};

export function useCommunityAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, args }: CommunityAction) =>
      rpc(name, args ?? {}) as Promise<unknown>,
    onSuccess: async (_data, action) => {
      const invalidations: Promise<unknown>[] = [
        qc.invalidateQueries({ queryKey: ["feed"] }),
        qc.invalidateQueries({ queryKey: ["group"] }),
        qc.invalidateQueries({ queryKey: ["notifications"] }),
      ];
      // Creating or leaving a group changes the directory and the tile counts.
      if (action.name === "create_group" || action.name === "toggle_group")
        invalidations.push(
          qc.invalidateQueries({ queryKey: ["groups"] }),
        );
      await Promise.all(invalidations);
    },
  });
}
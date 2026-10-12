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
import { getStoredGroups, addLiveGroup } from "@/lib/liveDataManager";

/** A group as the directory needs it: counts and membership resolved in Postgres. */
export type Group = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  joined: boolean;
  image?: string;
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
      // MOCK FOR LOCALHOST
      const { isConfigured } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        let filtered = getStoredGroups();
        if (category) filtered = filtered.filter(g => g.category === category);
        if (joinedOnly) filtered = filtered.filter(g => g.joined);
        if (search) filtered = filtered.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()));

        return filtered.slice(pageParam, pageParam + GROUPS_PER_PAGE);
      }

      // The search term goes through as a bound parameter. It used to be
      // interpolated into a PostgREST `or()` filter, where a comma or a closing
      // bracket in the input rewrote the filter instead of searching for it.
      return (await rpc("search_groups", {
        p_search: search || null,
        p_category: category,
        p_joined: joinedOnly,
        p_limit: GROUPS_PER_PAGE,
        p_offset: pageParam,
      })) as Group[];
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
    queryFn: async () => {
      const { isConfigured } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        const groups = getStoredGroups();
        const counts: Record<string, number> = {};
        for (const g of groups) {
          counts[g.category] = (counts[g.category] || 0) + 1;
        }
        return counts;
      }
      return (await rpc("group_category_counts")) as Record<string, number>;
    },
  });
}

export function useGroup(slug: string | undefined) {
  const { user } = useInternetIdentity();
  return useQuery({
    queryKey: ["group", slug, user?.id],
    enabled: !!user && !!slug,
    queryFn: async () => {
      // MOCK FOR LOCALHOST
      const { isConfigured } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        const found = getStoredGroups().find(g => g.slug === slug);
        return (found ?? null) as Group | null;
      }

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

const FEED_PAGE = 20;

/**
 * Conversation feed.
 *
 * Polling is deliberately split from history. A `useInfiniteQuery` with
 * `refetchInterval` refetches *every* loaded page on each tick, so a member who
 * had scrolled to page four was issuing four `get_feed` round trips every 15
 * seconds — cost growing linearly with engagement. Instead only the newest
 * page is polled, and the accumulated older pages are left alone: posts already
 * read do not change, and replies and likes surface on the newest page.
 */
export function useFeed(group: number | null) {
  const { user } = useInternetIdentity();
  const enabled = !!user;

  const history = useInfiniteQuery({
    queryKey: ["feed", user?.id, group],
    enabled,
    initialPageParam: null as number | null,
    queryFn: async ({ pageParam }) =>
      (await rpc("get_feed", {
        p_group: group,
        p_before: pageParam,
        p_limit: FEED_PAGE,
      })) as Post[],
    getNextPageParam: (last) =>
      last.length === FEED_PAGE ? last[last.length - 1].id : undefined,
  });

  const latest = useQuery({
    queryKey: ["feed-latest", user?.id, group],
    enabled,
    queryFn: async () =>
      (await rpc("get_feed", {
        p_group: group,
        p_before: null,
        p_limit: FEED_PAGE,
      })) as Post[],
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  // The polled page and the first loaded page overlap once a member has loaded
  // more than one page, so merge on post id rather than concatenating.
  const pages = history.data?.pages ?? [];
  const head = latest.data ?? pages[0] ?? [];
  const seen = new Set(head.map((post) => post.id));
  const rest = pages
    .slice(head.length ? 1 : 0)
    .map((page) => page.filter((post) => !seen.has(post.id)))
    .filter((page) => page.length);

  return {
    ...history,
    posts: [...head, ...rest.flat()],
    /** Pulls both the polled newest page and the loaded history. */
    refresh: async () => {
      await Promise.all([latest.refetch(), history.refetch()]);
    },
    isRefreshing: latest.isFetching || history.isFetching,
  };
}

export type CommunityAction = {
  name: string;
  args?: Record<string, unknown>;
};

export function useCommunityAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, args }: CommunityAction) => {
      const { isConfigured } = await import("@/lib/supabase/client");
      if (!isConfigured() && name === "create_group" && args) {
        return addLiveGroup({
          name: String(args.p_name || ""),
          description: String(args.p_description || ""),
          category: String(args.p_category || "sports"),
          image: args.p_image ? String(args.p_image) : undefined,
        });
      }
      return rpc(name, args ?? {}) as Promise<unknown>;
    },
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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { isConfigured } from "@/lib/env";
import { serverSupabase } from "@/lib/supabase/server";
import { GroupDetailPage } from "../../../views/GroupDetailPage";

type Params = { topic: string };
type GroupRow = { id: number; name: string; description: string; category: string };

/**
 * One indexed read resolves the group, which lets the route do two things a
 * client-only page cannot: answer a real HTTP 404 for a slug that does not
 * exist, and put the group's own name in the title tag.
 *
 * The read is skipped when Supabase is not configured, and a permission error is
 * treated as "cannot tell" rather than "not found" — a signed-out visitor must
 * not be handed a 404 for a group they simply cannot see yet. Only a confident
 * "no such row" produces a 404.
 */
async function findGroup(slug: string): Promise<GroupRow | null | undefined> {
  if (!isConfigured()) return undefined;
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("group_summaries")
    .select("id,name,description,category")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return undefined;
  return (data as GroupRow | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic } = await params;
  const group = await findGroup(decodeURIComponent(topic));
  return pageMetadata(`/groups/${topic}`, {
    title: group?.name ?? "Group",
    description:
      group?.description ||
      "Join this subgroup to share posts, replies and upcoming plans with the people in it.",
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  const { topic } = await props.params;
  const group = await findGroup(decodeURIComponent(topic));
  if (group === null) notFound();
  return <GroupDetailPage />;
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { isConfigured } from "@/lib/env";
import { serverSupabase } from "@/lib/supabase/server";
import { SessionDetailPage } from "../../../views/SessionDetailPage";

type Params = { id: string };

/**
 * A single activity. Its title, host and attendees are per-person data, so the
 * page stays `noindex`; a missing id still deserves a real 404 rather than a
 * 200 that renders "not found" text.
 *
 * As with group pages, a permission error means "cannot tell" and never
 * becomes a 404.
 */
async function findSession(
  id: string,
): Promise<{ title: string } | null | undefined> {
  if (!/^\d+$/.test(id)) return null;
  if (!isConfigured()) return undefined;
  const supabase = await serverSupabase();
  const { data, error } = await supabase
    .from("session_summaries")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  if (error) return undefined;
  return data ? { title: (data as { title: string }).title } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await findSession(id);
  return pageMetadata(`/sessions/${id}`, {
    title: session?.title ?? "Session",
    description:
      "Details for a wellness activity: who is coming, where to meet, and how to join or leave.",
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  const { id } = await props.params;
  const session = await findSession(id);
  if (session === null) notFound();
  return <SessionDetailPage />;
}
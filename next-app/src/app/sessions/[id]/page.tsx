import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SessionDetailPage } from "../../../views/SessionDetailPage";

type Params = { id: string };

/**
 * A single activity. Its title, host and attendees are per-person data, so the
 * page is `noindex` and no database read happens at request time.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata(`/sessions/${id}`, {
    title: "Session",
    description:
      "Details for a wellness activity: who is coming, where to meet, and how to join or leave.",
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  await props.params;
  return <SessionDetailPage />;
}
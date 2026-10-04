import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { GroupDetailPage } from "../../../views/GroupDetailPage";

type Params = { topic: string };

/**
 * Group pages render one member's community, so they are never indexed (see
 * `pageMetadata`). The title still resolves from the slug so a shared link is
 * readable, without leaking the group's contents to a crawler.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic } = await params;
  const label = decodeURIComponent(topic)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return pageMetadata(`/groups/${topic}`, {
    title: label || "Group",
    description: `Join this subgroup to share posts, replies and upcoming plans with the people in it.`,
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  await props.params;
  return <GroupDetailPage />;
}
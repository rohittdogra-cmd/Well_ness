import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CommunityPage } from "../../views/CommunityPage";

export const metadata: Metadata = pageMetadata("/community", {
  title: "Community Conversations",
  description: "Join the open community conversation: share a win, ask a question, or offer support anonymously.",
});

export default function Page() {
  return <CommunityPage />;
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { DiscussPage } from "../../views/DiscussPage";

export const metadata: Metadata = pageMetadata("/discuss", {
  title: "Conversations",
  description: "Real people, anonymous aliases: the open conversation feed for your workplace community.",
});

export default function Page() {
  return <DiscussPage />;
}

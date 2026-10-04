import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SocialGatheringPage } from "../../views/SocialGatheringPage";

export const metadata: Metadata = pageMetadata("/social-gathering", {
  title: "Social Gatherings",
  description: "Relaxed, low-pressure social events to build genuine connection and belonging.",
});

export default function Page() {
  return <SocialGatheringPage />;
}

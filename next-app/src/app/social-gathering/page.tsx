import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SocialGatheringPage } from "../../views/SocialGatheringPage";

export const metadata: Metadata = pageMetadata("/social-gathering", {
  title: "Social Gatherings · Informal Cafe & Weekend Circles Delhi-NCR",
  description:
    "Relaxed, low-pressure social get-togethers in Delhi-NCR: Cyber Hub coffee breaks, weekend board games, acoustic jams, and food walks with zero networking stress.",
  keywords: [
    "social gatherings gurgaon",
    "cyber hub cafe meetups",
    "delhi weekend social activities",
    "board game meetups ncr",
    "low pressure socializing for introverts",
  ],
});

export default function Page() {
  return <SocialGatheringPage />;
}

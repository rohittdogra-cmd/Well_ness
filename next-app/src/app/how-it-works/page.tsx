import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { HowItWorksPage } from "../../views/HowItWorksPage";

export const metadata: Metadata = pageMetadata("/how-it-works", {
  title: "How It Works · 2-Player Matchmaking, Cute Handles & Confidential Care",
  description:
    "See how stress-unwind works: select your locality, receive an auto-assigned cute sports avatar, find badminton match partners in Delhi-NCR, and access private doctor cabins with zero employer monitoring.",
  keywords: [
    "how stress-unwind works",
    "badminton matchmaking process",
    "anonymous corporate wellness explanation",
    "how to book badminton court ncr",
    "employer blind wellness guide",
  ],
});

export default function Page() {
  return <HowItWorksPage />;
}

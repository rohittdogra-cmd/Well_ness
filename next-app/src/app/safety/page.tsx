import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SafetyPage } from "../../views/SafetyPage";

export const metadata: Metadata = pageMetadata("/safety", {
  title: "Safety Charter & Anti-Harassment Guidelines",
  description:
    "Community safety rules, offline turf meetup protocols, zero-tolerance anti-doxxing policies, and moderation procedures for stress-unwind members.",
  keywords: [
    "community safety guidelines",
    "safe sports meetups delhi ncr",
    "anti doxxing corporate wellness",
    "anonymous meetup safety tips",
    "wholesome workplace community rules",
  ],
});

export default function Page() {
  return <SafetyPage />;
}

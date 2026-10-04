import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { MindfulMeetupPage } from "../../views/MindfulMeetupPage";

export const metadata: Metadata = pageMetadata("/meetup-activities", {
  title: "Mindful Meetups",
  description: "Small, intentional groups for meaningful conversations and shared mindfulness practice.",
});

export default function Page() {
  return <MindfulMeetupPage />;
}

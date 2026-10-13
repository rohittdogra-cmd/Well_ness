import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { MindfulMeetupPage } from "../../views/MindfulMeetupPage";

export const metadata: Metadata = pageMetadata("/meetup-activities", {
  title: "Mindful Meetups · Intentional Peer Conversations Delhi-NCR",
  description:
    "Join small, structured mindful meetups across Gurgaon, Delhi, and Noida. Safe peer discussions and low-pressure mindfulness circles for working professionals.",
  keywords: [
    "mindful meetups delhi ncr",
    "corporate mindfulness circles",
    "peer conversations gurgaon",
    "low pressure social meetups",
  ],
});

export default function Page() {
  return <MindfulMeetupPage />;
}

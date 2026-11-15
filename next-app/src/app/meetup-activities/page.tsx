import type { Metadata } from "next";
import { MindfulMeetupPage } from "../../views/MindfulMeetupPage";

export const metadata: Metadata = {
  title: "Mindful Meetups & Restorative Activities",
  description:
    "Join local and virtual mindful meetups on Stress Unwind. Participate in walking meditations, stress decompression circles, and grounding activities.",
  alternates: {
    canonical: "https://stress-unwind.com/meetup-activities",
  },
  openGraph: {
    title: "Mindful Meetups & Restorative Activities | Stress Unwind",
    description:
      "De-stress and recharge with guided mindful meetups and peer activities.",
    url: "https://stress-unwind.com/meetup-activities",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <MindfulMeetupPage />;
}

import type { Metadata } from "next";
import { HomePage } from "../views/HomePage";

export const metadata: Metadata = {
  title: "Stress Unwind — Corporate & Community Wellness Platform",
  description:
    "Take a pause with Stress Unwind. Join mindful meetups, discover interest-based peer circles, de-stress with daily arcade exercises, and access confidential 1-on-1 counseling care.",
  alternates: {
    canonical: "https://stress-unwind.com",
  },
  openGraph: {
    title: "Stress Unwind — Corporate & Community Wellness Platform",
    description:
      "A dedicated space to pause, connect, and thrive. Mindful meetups, peer circles, and verified 1-on-1 counseling care.",
    url: "https://stress-unwind.com",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <HomePage />;
}

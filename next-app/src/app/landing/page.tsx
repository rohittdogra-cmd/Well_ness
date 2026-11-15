import type { Metadata } from "next";
import { LandingPage } from "../../views/LandingPage";

export const metadata: Metadata = {
  title: "Stress Unwind — Corporate Wellbeing & Team Mental Health",
  description:
    "Discover how Stress Unwind transforms workplace wellness through peer circles, mental health counseling, team activities, and mindful corporate meetups.",
  alternates: {
    canonical: "https://stress-unwind.com/landing",
  },
  openGraph: {
    title: "Stress Unwind — Corporate Wellbeing & Team Mental Health",
    description:
      "Transform workplace wellness through peer circles, mental health counseling, team activities, and mindful corporate meetups.",
    url: "https://stress-unwind.com/landing",
  },
};

export default function Page() {
  return <LandingPage />;
}

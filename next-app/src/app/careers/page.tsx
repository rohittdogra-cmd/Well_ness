import type { Metadata } from "next";
import { CareersPage } from "../../views/CareersPage";

export const metadata: Metadata = {
  title: "Join Our Team — Careers at Stress Unwind",
  description:
    "Help us reshape the landscape of workplace wellbeing and peer mental health. Explore open positions and career opportunities at Stress Unwind.",
  alternates: {
    canonical: "https://stress-unwind.com/careers",
  },
  openGraph: {
    title: "Join Our Team — Careers at Stress Unwind | Stress Unwind",
    description:
      "Build the future of mindful workplace wellness with the Stress Unwind team.",
    url: "https://stress-unwind.com/careers",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <CareersPage />;
}

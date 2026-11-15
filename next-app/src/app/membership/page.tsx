import type { Metadata } from "next";
import { MembershipPage } from "../../views/MembershipPage";

export const metadata: Metadata = {
  title: "Corporate & Individual Wellness Membership",
  description:
    "Explore Stress Unwind membership plans for enterprise teams and individuals. Unlock unlimited peer support circles, wellness activities, and subsidized counseling sessions.",
  alternates: {
    canonical: "https://stress-unwind.com/membership",
  },
  openGraph: {
    title: "Corporate & Individual Wellness Membership | Stress Unwind",
    description:
      "Holistic wellness plans for companies and individuals seeking burnout prevention.",
    url: "https://stress-unwind.com/membership",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <MembershipPage />;
}

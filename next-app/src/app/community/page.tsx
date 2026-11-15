import type { Metadata } from "next";
import { CommunityPage } from "../../views/CommunityPage";

export const metadata: Metadata = {
  title: "Wellness Community & Connection Stories",
  description:
    "Explore inspiring peer stories, community reflections, and shared wellness journeys on Stress Unwind. See how connection changes lives.",
  alternates: {
    canonical: "https://stress-unwind.com/community",
  },
  openGraph: {
    title: "Wellness Community & Connection Stories | Stress Unwind",
    description:
      "Real stories, authentic voices, and welcoming spaces on Stress Unwind.",
    url: "https://stress-unwind.com/community",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <CommunityPage />;
}

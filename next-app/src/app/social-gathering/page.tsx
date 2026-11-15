import type { Metadata } from "next";
import { SocialGatheringPage } from "../../views/SocialGatheringPage";

export const metadata: Metadata = {
  title: "Social Gatherings & Unwind Events",
  description:
    "Unwind together with welcoming coffee chats, game nights, and casual social gatherings on Stress Unwind. Build warm connections and reduce social isolation.",
  alternates: {
    canonical: "https://stress-unwind.com/social-gathering",
  },
  openGraph: {
    title: "Social Gatherings & Unwind Events | Stress Unwind",
    description:
      "Casual social hours and community events designed to help you relax and make friends.",
    url: "https://stress-unwind.com/social-gathering",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <SocialGatheringPage />;
}

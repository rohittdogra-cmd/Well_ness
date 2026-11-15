import type { Metadata } from "next";
import { GroupsPage } from "../../views/GroupsPage";

export const metadata: Metadata = {
  title: "Explore Peer Circles & Interest Groups",
  description:
    "Find your circle at Stress Unwind. Connect over sports, mindfulness, yoga, arts, book clubs, cycling, tech, and career growth in safe, moderated peer communities.",
  alternates: {
    canonical: "https://stress-unwind.com/groups",
  },
  openGraph: {
    title: "Explore Peer Circles & Interest Groups | Stress Unwind",
    description:
      "Find your circle, share your passions, and make room for the moments that matter.",
    url: "https://stress-unwind.com/groups",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <GroupsPage />;
}

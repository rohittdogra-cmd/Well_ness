import type { Metadata } from "next";
import { GroupDetailPage } from "../../../views/GroupDetailPage";

type Props = {
  params: Promise<{ topic: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const formatted = topic
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${formatted} Peer Circle`,
    description: `Join the ${formatted} circle on Stress Unwind. Meet peers with shared interests, participate in activities, and build meaningful community connections.`,
    alternates: {
      canonical: `https://stress-unwind.com/groups/${topic}`,
    },
    openGraph: {
      title: `${formatted} Peer Circle | Stress Unwind`,
      description: `Connect with peers in the ${formatted} circle on Stress Unwind.`,
      url: `https://stress-unwind.com/groups/${topic}`,
      siteName: "Stress Unwind",
    },
  };
}

export default function Page() {
  return <GroupDetailPage />;
}

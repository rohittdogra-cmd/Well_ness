import type { Metadata } from "next";
import { DiscussPage } from "../../views/DiscussPage";

export const metadata: Metadata = {
  title: "Mindful Discussions & Open Dialogues",
  description:
    "Ask an honest question, share a small win, or join supportive, moderated mental wellness discussions on Stress Unwind. There's room for your quiet days, too.",
  alternates: {
    canonical: "https://stress-unwind.com/discuss",
  },
  openGraph: {
    title: "Mindful Discussions & Open Dialogues | Stress Unwind",
    description:
      "A compassionate, moderated community space for open wellness conversations.",
    url: "https://stress-unwind.com/discuss",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <DiscussPage />;
}

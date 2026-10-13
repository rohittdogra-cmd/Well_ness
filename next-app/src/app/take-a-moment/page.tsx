import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TakeAMomentPage } from "../../views/TakeAMomentPage";

export const metadata: Metadata = pageMetadata("/take-a-moment", {
  title: "Take a Moment · 2-Minute Breathing Exercise & Calming Pause",
  description:
    "Reset your autonomic nervous system with a private, guided 2-minute breathing pause. Grounding mindfulness for busy professionals between meetings or after intense work sessions.",
  keywords: [
    "take a moment breathing exercise",
    "2 minute mindfulness pause",
    "workplace anxiety breathing technique",
    "calm nervous system between meetings",
    "quick stress relief exercise",
  ],
});

export default function Page() {
  return <TakeAMomentPage />;
}

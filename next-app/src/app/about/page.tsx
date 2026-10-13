import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AboutPage } from "../../views/AboutPage";

export const metadata: Metadata = pageMetadata("/about", {
  title: "About stress-unwind · 100% Employer-Blind Wellness Architecture",
  description:
    "Learn how stress-unwind protects corporate professionals: independent sports turf booking, algorithm-assigned cute handles, proximity matchmaking, and confidential clinical psychology without corporate HR visibility.",
  keywords: [
    "about stress-unwind",
    "employer blind wellness company",
    "confidential corporate mental health",
    "workplace burnout recovery platform",
    "delhi ncr sports community",
  ],
});

export default function Page() {
  return <AboutPage />;
}

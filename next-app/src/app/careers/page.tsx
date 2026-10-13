import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CareersPage } from "../../views/CareersPage";

export const metadata: Metadata = pageMetadata("/careers", {
  title: "Careers at stress-unwind · Building Independent Wellness Infrastructure",
  description:
    "Join our team in Delhi-NCR. We are building technology for 100% employer-blind corporate wellness, offline sports arena matchmaking, and ethical clinical care.",
  keywords: [
    "careers at stress-unwind",
    "wellness startup jobs delhi ncr",
    "sports tech engineering roles gurgaon",
    "clinical psychology jobs",
  ],
});

export default function Page() {
  return <CareersPage />;
}

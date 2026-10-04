import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LandingPage } from "../../views/LandingPage";

export const metadata: Metadata = pageMetadata("/landing", {
  title: "Corporate Wellness Platform",
  description:
    "Meet your people at work: mindful meetups, social gatherings, task sharing and peer support in one private wellness hub.",
  // /landing renders the same content as /. It is kept for existing links and
  // points crawlers at the canonical home page instead of competing with it.
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
});

export default function Page() {
  return <LandingPage />;
}
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TermsPage } from "../../views/TermsPage";

export const metadata: Metadata = pageMetadata("/terms", {
  title: "Terms of Service & Membership Agreement",
  description:
    "Official terms of service, sports turf booking etiquette, community code of conduct, risk waivers, and clinical tele-mental health policies for stress-unwind members.",
  keywords: [
    "terms of service",
    "membership agreement",
    "community guidelines",
    "badminton court booking rules",
    "sports liability waiver",
    "tele-mental health terms",
    "employer blind privacy agreement",
  ],
});

export default function Page() {
  return <TermsPage />;
}

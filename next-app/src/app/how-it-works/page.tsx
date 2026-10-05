import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { HowItWorksPage } from "../../views/HowItWorksPage";

export const metadata: Metadata = pageMetadata("/how-it-works", {
  title: "How it works",
  description: "Talk without revealing who you are: aliases, private conversations, meetups and quiet moments.",
});

export default function Page() {
  return <HowItWorksPage />;
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPage } from "../../views/PrivacyPage";

export const metadata: Metadata = pageMetadata("/privacy", {
  title: "Privacy",
  description: "What is stored, who can see it, how long we keep it, and honestly what anonymity this service does and does not offer.",
});

export default function Page() {
  return <PrivacyPage />;
}

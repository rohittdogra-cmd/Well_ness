import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SafetyPage } from "../../views/SafetyPage";

export const metadata: Metadata = pageMetadata("/safety", {
  title: "Safety and Community Guidelines",
  description: "The rules we hold everyone to, how to report something that worries you, and how to meet someone safely in person.",
});

export default function Page() {
  return <SafetyPage />;
}

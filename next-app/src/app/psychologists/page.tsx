import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PsychologistsPage } from "../../views/PsychologistsPage";

export const metadata: Metadata = pageMetadata("/psychologists", {
  title: "Psychologists",
  description: "Request a confidential appointment with an approved psychologist on the wellness hub.",
});

export default function Page() {
  return <PsychologistsPage />;
}

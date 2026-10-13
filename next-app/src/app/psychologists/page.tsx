import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PsychologistsPage } from "../../views/PsychologistsPage";

export const metadata: Metadata = pageMetadata("/psychologists", {
  title: "Approved Clinical Psychologists & Doctor Directory",
  description:
    "Schedule a confidential one-on-one consultation with verified RCI-licensed clinical psychologists and psychiatrists. Evidence-based care for executive burnout, anxiety, impostor syndrome, and corporate fatigue.",
  keywords: [
    "licensed clinical psychologists gurgaon",
    "rci certified therapists delhi",
    "burnout doctors corporate wellness",
    "executive mental health counseling",
    "confidential therapy appointment",
    "work stress psychologist noida",
  ],
});

export default function Page() {
  return <PsychologistsPage />;
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PrivacyPage } from "../../views/PrivacyPage";

export const metadata: Metadata = pageMetadata("/privacy", {
  title: "Privacy Policy & Data Governance · 100% Employer-Blind Architecture",
  description:
    "Official privacy policy for stress-unwind: strict employer isolation, auto-assigned cute avatars, locked locality proximity calculations, confidential turf operations desk, RCI doctor privacy, and DPDP Act 2023 compliance.",
  keywords: [
    "privacy policy corporate wellness",
    "100% employer blind privacy",
    "dpdp act 2023 compliance",
    "zero tracking mental health",
    "anonymous badminton matchmaking privacy",
    "doctor patient confidentiality india",
  ],
});

export default function Page() {
  return <PrivacyPage />;
}

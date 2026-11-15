import type { Metadata } from "next";
import { ProviderWorkspace } from "@/components/ProviderWorkspace";

export const metadata: Metadata = {
  title: "Provider Portal & Clinical Workspace",
  description:
    "Clinical dashboard and appointment workspace for verified mental health providers, psychologists, and wellness facilitators on Stress Unwind.",
  alternates: {
    canonical: "https://stress-unwind.com/provider",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ProviderWorkspace />;
}

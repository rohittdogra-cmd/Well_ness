import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { OnboardingPage } from "../../views/OnboardingPage";

export const metadata: Metadata = pageMetadata("/onboarding", {
  title: "Set Up Your Profile",
  description: "Choose a display name, avatar and interests so people can find you.",
});

export default function Page() {
  return <OnboardingPage />;
}

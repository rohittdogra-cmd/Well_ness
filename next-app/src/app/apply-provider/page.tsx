import type { Metadata } from "next";
import { ApplyProviderPage } from "../../views/ApplyProviderPage";

export const metadata: Metadata = {
  title: "Apply as a Wellness Provider | Stress Unwind",
  description:
    "Join the Stress Unwind certified wellness network. Partner with organizations to host mindfulness sessions, therapy workshops, and active wellness circles.",
  alternates: {
    canonical: "https://stress-unwind.com/apply-provider",
  },
  openGraph: {
    title: "Apply as a Wellness Provider | Stress Unwind",
    description:
      "Join the Stress Unwind certified wellness network. Partner with organizations to host mindfulness sessions, therapy workshops, and active wellness circles.",
    url: "https://stress-unwind.com/apply-provider",
  },
};

export default function Page() {
  return <ApplyProviderPage />;
}

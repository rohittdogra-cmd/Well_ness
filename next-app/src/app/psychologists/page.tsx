import type { Metadata } from "next";
import { PsychologistsPage } from "../../views/PsychologistsPage";

export const metadata: Metadata = {
  title: "1-on-1 Confidential Counseling & Clinical Care",
  description:
    "Connect with verified mental health professionals and licensed psychologists for confidential, compassionate clinical care through Stress Unwind.",
  alternates: {
    canonical: "https://stress-unwind.com/psychologists",
  },
  openGraph: {
    title: "1-on-1 Confidential Counseling & Clinical Care | Stress Unwind",
    description:
      "Confidential, licensed clinical support and 1-on-1 counseling tailored to your mental health journey.",
    url: "https://stress-unwind.com/psychologists",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <PsychologistsPage />;
}

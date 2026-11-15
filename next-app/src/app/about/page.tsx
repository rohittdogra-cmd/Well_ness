import type { Metadata } from "next";
import { AboutPage } from "../../views/AboutPage";

export const metadata: Metadata = {
  title: "About Us — Our Mission for Mental Wellbeing",
  description:
    "Learn how Stress Unwind empowers corporate teams and communities to overcome workplace stress, recover from burnout, and build authentic connections.",
  alternates: {
    canonical: "https://stress-unwind.com/about",
  },
  openGraph: {
    title: "About Us — Our Mission for Mental Wellbeing | Stress Unwind",
    description:
      "Empowering workplaces and individuals with holistic wellness, peer circles, and evidence-backed care.",
    url: "https://stress-unwind.com/about",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <AboutPage />;
}

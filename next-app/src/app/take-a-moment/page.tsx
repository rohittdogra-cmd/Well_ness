import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TakeAMomentPage } from "../../views/TakeAMomentPage";

export const metadata: Metadata = pageMetadata("/take-a-moment", {
  title: "Take a Moment",
  description: "A short, private pause: a breathing space, one question to sit with, and a way back whenever you want it.",
});

export default function Page() {
  return <TakeAMomentPage />;
}

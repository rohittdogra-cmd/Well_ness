import { Metadata } from "next";
import { TherapyPage } from "../../views/TherapyPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata("/therapy", {
  title: "Anonymous Therapy",
  description: "Connect with certified therapists anonymously to talk through your stress.",
});

export default function Page() {
  return <TherapyPage />;
}

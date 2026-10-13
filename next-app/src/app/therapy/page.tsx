import { Metadata } from "next";
import { TherapyPage } from "../../views/TherapyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/therapy", {
  title: "100% Confidential Anonymous Therapy & Doctor Cabins",
  description:
    "Consult licensed clinical psychologists and psychiatrists anonymously. Private, encrypted virtual doctor cabins for corporate burnout, depression, and workplace stress with zero employer data sharing.",
  keywords: [
    "anonymous therapy india",
    "confidential therapy for tech employees",
    "rci certified therapists delhi ncr",
    "corporate burnout counseling gurgaon",
    "workplace depression therapy noida",
    "100% employer blind therapy",
    "tele-manas mental health 14416",
  ],
});

export default function Page() {
  return <TherapyPage />;
}

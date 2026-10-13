import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ContactPage } from "../../views/ContactPage";

export const metadata: Metadata = pageMetadata("/contact", {
  title: "Care Desk & Concierge · Support & Grievances",
  description:
    "Get in touch with the stress-unwind concierge desk: sports court assistance, match scheduling support, privacy inquiries, and confidential grievance redressal.",
  keywords: [
    "contact stress-unwind",
    "badminton court booking support",
    "corporate wellness care desk",
    "grievance officer contact delhi",
    "member support gurgaon",
  ],
});

export default function Page() {
  return <ContactPage />;
}

import type { Metadata } from "next";
import { ContactPage } from "../../views/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch with Support",
  description:
    "Contact the Stress Unwind team for assistance, corporate wellness partnerships, or community feedback. We are here to support your wellness journey.",
  alternates: {
    canonical: "https://stress-unwind.com/contact",
  },
  openGraph: {
    title: "Contact Us — Get in Touch with Support | Stress Unwind",
    description:
      "Have questions or need assistance? Connect with the Stress Unwind team today.",
    url: "https://stress-unwind.com/contact",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <ContactPage />;
}

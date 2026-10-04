import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ContactPage } from "../../views/ContactPage";

export const metadata: Metadata = pageMetadata("/contact", {
  title: "Contact",
  description: "Send the wellness hub team a question, an idea, or something that needs fixing.",
});

export default function Page() {
  return <ContactPage />;
}

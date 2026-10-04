import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AboutPage } from "../../views/AboutPage";

export const metadata: Metadata = pageMetadata("/about", {
  title: "About the Hub",
  description: "How the wellness hub works: private groups, moderated conversations, shared activities and confidential support for colleagues.",
});

export default function Page() {
  return <AboutPage />;
}

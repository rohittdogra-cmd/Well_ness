import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CareersPage } from "../../views/CareersPage";

export const metadata: Metadata = pageMetadata("/careers", {
  title: "Careers",
  description: "Open roles and how we work at the wellness hub.",
});

export default function Page() {
  return <CareersPage />;
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ComingSoonPage } from "../../views/ComingSoonPage";

export const metadata: Metadata = pageMetadata("/coming-soon", {
  title: "Coming Soon",
  description: "Features arriving in the wellness hub next.",
});

export default function Page() {
  return <ComingSoonPage />;
}

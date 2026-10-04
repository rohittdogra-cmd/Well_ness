import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ApplyProviderPage } from "../../views/ApplyProviderPage";

export const metadata: Metadata = pageMetadata("/apply-provider", {
  title: "Become a Provider",
  description: "Apply to join the hub as a verified psychologist or sports partner.",
});

export default function Page() {
  return <ApplyProviderPage />;
}

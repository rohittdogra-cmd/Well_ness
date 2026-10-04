import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PeoplePage } from "../../views/PeoplePage";

export const metadata: Metadata = pageMetadata("/people", {
  title: "People",
  description: "Find colleagues by name, send a connection request, and chat privately once they accept.",
});

export default function Page() {
  return <PeoplePage />;
}

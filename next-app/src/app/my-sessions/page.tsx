import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { MySessionsPage } from "../../views/MySessionsPage";

export const metadata: Metadata = pageMetadata("/my-sessions", {
  title: "My Sessions",
  description: "Every activity you have created or joined, with calendar export.",
});

export default function Page() {
  return <MySessionsPage />;
}

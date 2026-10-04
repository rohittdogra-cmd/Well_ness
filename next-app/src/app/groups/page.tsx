import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { GroupsPage } from "../../views/GroupsPage";

export const metadata: Metadata = pageMetadata("/groups", {
  title: "Groups",
  description: "Find your people by interest: sports, wellbeing, arts, learning, social and outdoors subgroups.",
});

export default function Page() {
  return <GroupsPage />;
}

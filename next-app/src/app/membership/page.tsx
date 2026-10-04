import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { MembershipPage } from "../../views/MembershipPage";

export const metadata: Metadata = pageMetadata("/membership", {
  title: "Membership",
  description: "What membership includes: community groups, hosted activities, appointment requests and confidential peer support.",
});

export default function Page() {
  return <MembershipPage />;
}

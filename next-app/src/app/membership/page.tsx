import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { MembershipPage } from "../../views/MembershipPage";

export const metadata: Metadata = pageMetadata("/membership", {
  title: "Membership Benefits · Turf Passes, Support Groups & Doctor Cabins",
  description:
    "Explore stress-unwind membership: priority indoor badminton court booking passes, access to 60+ Delhi-NCR topic circles, anonymous peer venting, and subsidized private clinical psychology appointments.",
  keywords: [
    "corporate wellness membership",
    "badminton court membership gurgaon",
    "sports club membership delhi ncr",
    "mental health membership india",
    "employee wellness passes",
  ],
});

export default function Page() {
  return <MembershipPage />;
}

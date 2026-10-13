import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { GroupsPage } from "../../views/GroupsPage";

export const metadata: Metadata = pageMetadata("/groups", {
  title: "Community Subgroups · Sports, Treks, Social & Wellness Circles",
  description:
    "Explore 60+ active subgroups across Delhi-NCR. Join badminton squads, weekend Aravali treks, Cyber Hub coffee meetups, box cricket tournaments, yoga circles, and anonymous peer support groups.",
  keywords: [
    "corporate sports groups delhi ncr",
    "badminton clubs gurgaon",
    "weekend trekking groups aravali",
    "cyber hub social groups",
    "box cricket groups delhi",
    "wellness and meditation circles ncr",
    "anonymous peer support groups",
  ],
});

export default function Page() {
  return <GroupsPage />;
}

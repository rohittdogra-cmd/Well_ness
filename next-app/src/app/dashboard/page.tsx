import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { DashboardPage } from "../../views/DashboardPage";

export const metadata: Metadata = pageMetadata("/dashboard", {
  title: "My Profile",
  description: "Your personal wellness profile: calendar, sessions, check-ins, activity and settings.",
});

export default function Page() {
  return <DashboardPage />;
}

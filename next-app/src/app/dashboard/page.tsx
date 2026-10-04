import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { DashboardPage } from "../../views/DashboardPage";

export const metadata: Metadata = pageMetadata("/dashboard", {
  title: "Your Dashboard",
  description: "Your wellness dashboard: saved profile, sessions, activity history and notifications.",
});

export default function Page() {
  return <DashboardPage />;
}

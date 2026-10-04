import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AccountPage } from "../../views/AccountPage";

export const metadata: Metadata = pageMetadata("/account", {
  title: "Account Settings",
  description: "Manage your sign-in details and community profile.",
});

export default function Page() {
  return <AccountPage />;
}

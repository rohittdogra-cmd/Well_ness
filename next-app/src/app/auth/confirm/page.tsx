import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ConfirmEmailPage } from "../../../views/ConfirmEmailPage";

export const metadata: Metadata = pageMetadata("/auth/confirm", {
  title: "Confirm Email",
  description: "Confirm your email address to finish signing in to the wellness hub.",
});

export default function Page() {
  return <ConfirmEmailPage />;
}

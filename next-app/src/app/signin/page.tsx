import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SignInPage } from "../../views/SignInPage";

export const metadata: Metadata = pageMetadata("/signin", {
  title: "Sign In",
  description: "Sign in to the wellness hub with your email and password, a one-time email link, or a one-time code.",
});

export default function Page() {
  return <SignInPage />;
}

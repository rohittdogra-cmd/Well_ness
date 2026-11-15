import type { Metadata } from "next";
import { SignInPage } from "../../views/SignInPage";

export const metadata: Metadata = {
  title: "Sign In | Stress Unwind",
  description: "Sign in to your Stress Unwind corporate wellness account.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <SignInPage />;
}

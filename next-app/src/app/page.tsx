import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { HomePage } from "../views/HomePage";

export const metadata: Metadata = pageMetadata("/", {
  title: "Corporate Wellness Platform",
  description: "Meet your people at work: mindful meetups, social gatherings, task sharing and peer support in one private wellness hub.",
});

export default function Page() {
  return <HomePage />;
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BookActivitiesPage } from "../../views/BookActivitiesPage";

export const metadata: Metadata = pageMetadata("/book-activities", {
  title: "Book Activities",
  description: "Find and join wellness activities: walks, games, meetups and team sessions.",
});

export default function Page() {
  return <BookActivitiesPage />;
}

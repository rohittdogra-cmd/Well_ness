import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BookActivitiesPage } from "../../views/BookActivitiesPage";

export const metadata: Metadata = pageMetadata("/book-activities", {
  title: "Book Sports Turfs & Wellness Activities · Delhi-NCR",
  description:
    "Find and book verified badminton courts, morning Aravali treks, weekend box cricket, yoga sessions, and mindful meetups across Gurgaon, Janakpuri, Noida, and South Delhi.",
  keywords: [
    "book sports activities delhi ncr",
    "badminton court booking app",
    "box cricket slot booking gurgaon",
    "weekend wellness meetups ncr",
    "corporate sports activities",
    "find badminton partner gurgaon",
  ],
});

export default function Page() {
  return <BookActivitiesPage />;
}

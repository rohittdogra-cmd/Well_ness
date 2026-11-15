import type { Metadata } from "next";
import { BookActivitiesPage } from "../../views/BookActivitiesPage";

export const metadata: Metadata = {
  title: "Book Mindful Activities & Group Sessions",
  description:
    "Schedule restorative desk stretches, guided breathing sessions, weekend walks, and social activities on Stress Unwind. Make room for daily wellbeing.",
  alternates: {
    canonical: "https://stress-unwind.com/book-activities",
  },
  openGraph: {
    title: "Book Mindful Activities & Group Sessions | Stress Unwind",
    description:
      "Find restorative activities, meet peers, and make memories with Stress Unwind.",
    url: "https://stress-unwind.com/book-activities",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <BookActivitiesPage />;
}

import type { Metadata } from "next";
import { TaskSharingPage } from "../../views/TaskSharingPage";

export const metadata: Metadata = {
  title: "Collaborative Task Sharing & Focus Circles",
  description:
    "Lighten your workload and overcome workplace burnout. Join collaborative task-sharing circles and virtual co-working sprints on Stress Unwind.",
  alternates: {
    canonical: "https://stress-unwind.com/task-sharing",
  },
  openGraph: {
    title: "Collaborative Task Sharing & Focus Circles | Stress Unwind",
    description:
      "Focus together, share the load, and achieve your daily goals in supportive company.",
    url: "https://stress-unwind.com/task-sharing",
    siteName: "Stress Unwind",
  },
};

export default function Page() {
  return <TaskSharingPage />;
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TaskSharingPage } from "../../views/TaskSharingPage";

export const metadata: Metadata = pageMetadata("/task-sharing", {
  title: "Collaborative Task Sharing & Accountability Pods",
  description:
    "Break down overwhelming corporate workloads. Partner with peers for co-working sessions, body doubling, and collaborative task accountability with zero corporate surveillance.",
  keywords: [
    "task sharing corporate wellness",
    "coworking accountability pods",
    "body doubling for adhd and burnout",
    "peer productivity circles",
    "workload sharing support",
  ],
});

export default function Page() {
  return <TaskSharingPage />;
}

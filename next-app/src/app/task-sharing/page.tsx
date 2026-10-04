import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TaskSharingPage } from "../../views/TaskSharingPage";

export const metadata: Metadata = pageMetadata("/task-sharing", {
  title: "Task Sharing",
  description: "Collaborative task management that breaks down workloads and shares responsibility.",
});

export default function Page() {
  return <TaskSharingPage />;
}

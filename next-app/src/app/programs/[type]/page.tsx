import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ProgramsPage } from "../../../views/ProgramsPage";

/**
 * Program landing pages. Titles come from a local table rather than
 * `lib/programConfig`, which pulls in the data hooks and does not belong in a
 * server module.
 */
const PROGRAMS: Record<string, string> = {
  meetup: "Mindful Meetup",
  exercise: "Movement & Exercise",
  socialGathering: "Social Gathering",
  taskAllocation: "Task Sharing",
  boxCricket: "Box Cricket",
  pickleball: "Pickleball",
  badminton: "Badminton",
  tennis: "Tennis",
};

type Params = { type: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { type } = await params;
  const label = PROGRAMS[type];
  if (!label)
    return pageMetadata("/programs", {
      title: "Wellness Programs",
      description: "Wellness programs running in your hub.",
    });
  return pageMetadata(`/programs/${type}`, {
    title: label,
    description: `Browse upcoming ${label.toLowerCase()} sessions in your hub: dates, spaces and open places, with capacity checked when you join.`,
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  await props.params;
  return <ProgramsPage />;
}
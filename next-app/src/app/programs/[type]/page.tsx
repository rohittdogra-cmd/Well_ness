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
      title: "Wellness & Sports Programs · Delhi-NCR",
      description:
        "Browse verified corporate wellness programs, sports turfs, and mindful activities running across Delhi-NCR.",
    });

  const isBadminton = type === "badminton";

  return pageMetadata(`/programs/${type}`, {
    title: isBadminton
      ? "Indoor Badminton Court Booking & 2-Player Matchmaking · Delhi-NCR"
      : `${label} Sessions & Arena Booking · Delhi-NCR`,
    description: isBadminton
      ? "Book tournament-grade indoor badminton courts across Janakpuri, Cyber Hub Gurgaon, Sec 54, Noida, and Palwal. Match with nearby colleagues using cute avatars with 100% employer-blind anonymity."
      : `Browse upcoming ${label.toLowerCase()} sessions in Delhi-NCR: verified venues, confirmed slots, and peer matchmaking with zero HR tracking.`,
    keywords: isBadminton
      ? [
          "badminton turf booking delhi ncr",
          "book badminton court gurgaon",
          "janakpuri indoor badminton sp arena",
          "fitso smash arena cyber hub",
          "sector 54 rapid sports dome",
          "noida sector 62 badminton court",
          "palwal national sports arena",
          "2 player badminton matchmaking",
        ]
      : [
          `${label.toLowerCase()} booking delhi ncr`,
          `${label.toLowerCase()} gurgaon`,
          `corporate ${label.toLowerCase()} sessions`,
          "sports matchmaking delhi ncr",
        ],
  });
}

export default async function Page(props: { params: Promise<Params> }) {
  await props.params;
  return <ProgramsPage />;
}
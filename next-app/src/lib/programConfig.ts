// Imported from the DTO module, not the client hooks: this config is
// read by server routes (sitemap, metadata) as well as by components.
import { ProgramType } from "../backend.types";

export interface ProgramConfig {
  type: ProgramType;
  label: string;
  shortLabel: string;
  description: string;
  tagline: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  textClass: string;
  path: string;
}

export const PROGRAM_CONFIGS: Record<ProgramType, ProgramConfig> = {
  [ProgramType.meetup]: {
    type: ProgramType.meetup,
    label: "Mindful Meetup",
    shortLabel: "Meetup",
    description:
      "Connect with small, intentional groups for meaningful conversations and shared mindfulness practices.",
    tagline: "Small groups, big connections",
    emoji: "☕",
    colorClass: "text-[oklch(0.45_0.13_190)]",
    bgClass: "bg-[oklch(0.92_0.05_190)]",
    borderClass: "border-[oklch(0.78_0.09_190)]",
    badgeClass:
      "bg-[oklch(0.92_0.05_190)] text-[oklch(0.35_0.12_190)] border-[oklch(0.78_0.09_190)]",
    textClass: "text-[oklch(0.35_0.12_190)]",
    path: "/programs/meetup",
  },
  [ProgramType.exercise]: {
    type: ProgramType.exercise,
    label: "Movement & Exercise",
    shortLabel: "Exercise",
    description:
      "Group workouts, yoga, and movement sessions designed to release stress through physical activity.",
    tagline: "Move together, feel better",
    emoji: "🏃",
    colorClass: "text-[oklch(0.42_0.14_155)]",
    bgClass: "bg-[oklch(0.91_0.05_155)]",
    borderClass: "border-[oklch(0.75_0.09_155)]",
    badgeClass:
      "bg-[oklch(0.91_0.05_155)] text-[oklch(0.32_0.13_155)] border-[oklch(0.75_0.09_155)]",
    textClass: "text-[oklch(0.32_0.13_155)]",
    path: "/programs/exercise",
  },
  [ProgramType.socialGathering]: {
    type: ProgramType.socialGathering,
    label: "Social Gathering",
    shortLabel: "Social",
    description:
      "Relaxed, low-pressure social events to build genuine connections and a sense of belonging.",
    tagline: "Belong somewhere",
    emoji: "🌸",
    colorClass: "text-[oklch(0.44_0.16_295)]",
    bgClass: "bg-[oklch(0.93_0.05_295)]",
    borderClass: "border-[oklch(0.77_0.09_295)]",
    badgeClass:
      "bg-[oklch(0.93_0.05_295)] text-[oklch(0.34_0.14_295)] border-[oklch(0.77_0.09_295)]",
    textClass: "text-[oklch(0.34_0.14_295)]",
    path: "/programs/socialGathering",
  },
  [ProgramType.taskAllocation]: {
    type: ProgramType.taskAllocation,
    label: "Task Sharing",
    shortLabel: "Tasks",
    description:
      "Collaborative task management to break down overwhelming workloads and share responsibilities.",
    tagline: "Divide the load, lighten the mind",
    emoji: "✅",
    colorClass: "text-[oklch(0.52_0.14_75)]",
    bgClass: "bg-[oklch(0.95_0.05_75)]",
    borderClass: "border-[oklch(0.82_0.1_75)]",
    badgeClass:
      "bg-[oklch(0.95_0.05_75)] text-[oklch(0.40_0.13_75)] border-[oklch(0.82_0.1_75)]",
    textClass: "text-[oklch(0.40_0.13_75)]",
    path: "/programs/taskAllocation",
  },
  [ProgramType.boxCricket]: {
    type: ProgramType.boxCricket,
    label: "Box Cricket",
    shortLabel: "Box Cricket",
    description:
      "Fast-paced indoor cricket in a compact arena — perfect for team bonding, friendly rivalries, and a great cardio session.",
    tagline: "Bat, bowl, bond",
    emoji: "🏏",
    colorClass: "text-[oklch(0.45_0.15_50)]",
    bgClass: "bg-[oklch(0.94_0.06_50)]",
    borderClass: "border-[oklch(0.80_0.10_50)]",
    badgeClass:
      "bg-[oklch(0.94_0.06_50)] text-[oklch(0.38_0.14_50)] border-[oklch(0.80_0.10_50)]",
    textClass: "text-[oklch(0.38_0.14_50)]",
    path: "/programs/boxCricket",
  },
  [ProgramType.pickleball]: {
    type: ProgramType.pickleball,
    label: "Pickleball",
    shortLabel: "Pickleball",
    description:
      "The fastest-growing sport in the office! Easy to learn, endlessly fun — play singles or doubles and build cross-team camaraderie.",
    tagline: "Dink, drive, dominate",
    emoji: "🏓",
    colorClass: "text-[oklch(0.46_0.14_115)]",
    bgClass: "bg-[oklch(0.93_0.06_115)]",
    borderClass: "border-[oklch(0.79_0.10_115)]",
    badgeClass:
      "bg-[oklch(0.93_0.06_115)] text-[oklch(0.36_0.13_115)] border-[oklch(0.79_0.10_115)]",
    textClass: "text-[oklch(0.36_0.13_115)]",
    path: "/programs/pickleball",
  },
  [ProgramType.badminton]: {
    type: ProgramType.badminton,
    label: "Badminton",
    shortLabel: "Badminton",
    description:
      "Shuttle smashes and rapid rallies — badminton is an excellent full-body workout that sharpens reflexes and lifts your mood.",
    tagline: "Rally your way to relief",
    emoji: "🏸",
    colorClass: "text-[oklch(0.44_0.14_230)]",
    bgClass: "bg-[oklch(0.92_0.05_230)]",
    borderClass: "border-[oklch(0.77_0.09_230)]",
    badgeClass:
      "bg-[oklch(0.92_0.05_230)] text-[oklch(0.34_0.13_230)] border-[oklch(0.77_0.09_230)]",
    textClass: "text-[oklch(0.34_0.13_230)]",
    path: "/programs/badminton",
  },
  [ProgramType.tennis]: {
    type: ProgramType.tennis,
    label: "Tennis",
    shortLabel: "Tennis",
    description:
      "Serve, volley, and unwind on the court. Tennis sessions for all skill levels — a timeless sport for focus and stress relief.",
    tagline: "Game, set, de-stress",
    emoji: "🎾",
    colorClass: "text-[oklch(0.50_0.15_98)]",
    bgClass: "bg-[oklch(0.94_0.07_98)]",
    borderClass: "border-[oklch(0.82_0.11_98)]",
    badgeClass:
      "bg-[oklch(0.94_0.07_98)] text-[oklch(0.40_0.14_98)] border-[oklch(0.82_0.11_98)]",
    textClass: "text-[oklch(0.40_0.14_98)]",
    path: "/programs/tennis",
  },
};

export const PROGRAM_ORDER: ProgramType[] = [
  ProgramType.meetup,
  ProgramType.exercise,
  ProgramType.socialGathering,
  ProgramType.taskAllocation,
];

export function getProgramConfig(type: ProgramType): ProgramConfig {
  return PROGRAM_CONFIGS[type];
}

export function getProgramTypeFromPath(path: string): ProgramType | null {
  const map: Record<string, ProgramType> = {
    meetup: ProgramType.meetup,
    exercise: ProgramType.exercise,
    socialGathering: ProgramType.socialGathering,
    taskAllocation: ProgramType.taskAllocation,
    boxCricket: ProgramType.boxCricket,
    pickleball: ProgramType.pickleball,
    badminton: ProgramType.badminton,
    tennis: ProgramType.tennis,
  };
  return map[path] ?? null;
}

export function formatDateTime(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTimeShort(dateTime: bigint): string {
  const ms = Number(dateTime) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

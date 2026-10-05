"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, LogIn, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { CreateSessionModal } from "../components/CreateSessionModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ProgramType } from "../hooks/useQueries";

const ALL_TASK_ACTIVITIES = [
  {
    image: "/images/activities/project-kickoff.jpg",
    emoji: "🗺️",
    name: "Project Kick-off Mapping",
    description:
      "Collaboratively map out a project's goals, tasks, and owners in a single focused session",
    tags: ["Planning", "Team"],
    size: "3–10 people",
  },
  {
    image: "/images/activities/responsibility-shuffle.jpg",
    emoji: "🔁",
    name: "Weekly Responsibility Shuffle",
    description:
      "Rotate tasks across team members weekly to reduce monotony and share the cognitive load",
    tags: ["Routine", "Balanced"],
    size: "4–12 people",
  },
  {
    image: "/images/activities/buddy-system.jpg",
    emoji: "🤝",
    name: "Buddy Task System",
    description:
      "Pair up colleagues to co-own a task — accountability and shared ownership reduce stress",
    tags: ["Collaborative", "1:1"],
    size: "2 people",
  },
  {
    image: "/images/activities/backlog-blitz.jpg",
    emoji: "🧹",
    name: "Backlog Blitz",
    description:
      "A focused 30-minute group session to collectively triage, delegate, or close stale tasks",
    tags: ["Focused", "Team"],
    size: "3–8 people",
  },
  {
    image: "/images/activities/skill-match-assignment.jpg",
    emoji: "📋",
    name: "Skill-Match Assignment",
    description:
      "Match tasks to team members based on strengths and learning goals, not just availability",
    tags: ["Growth", "Planning"],
    size: "Any",
  },
  {
    image: "/images/activities/time-box-sprint.jpg",
    emoji: "⏱️",
    name: "Time-Box Sprint",
    description:
      "Everyone commits to one task for a fixed period — progress visible to the whole group for motivation",
    tags: ["Focused", "Energising"],
    size: "4–15 people",
  },
  {
    image: "/images/activities/priority-poker.jpg",
    emoji: "🎯",
    name: "Priority Poker",
    description:
      "Use anonymous voting to surface what the team actually considers most important this week",
    tags: ["Decision-Making", "Team"],
    size: "4–12 people",
  },
  {
    image: "/images/activities/teach-to-help.jpg",
    emoji: "🧑‍🏫",
    name: "Teach-to-Help",
    description:
      "An expert on a task teaches others just enough to share it — knowledge transfer and workload relief",
    tags: ["Learning", "Collaborative"],
    size: "2–8 people",
  },
  {
    image: "/images/activities/async-handoff-session.jpg",
    emoji: "🌀",
    name: "Async Handoff Session",
    description:
      "Structured async notes and a brief sync to smoothly hand off ongoing tasks without stress",
    tags: ["Remote-Friendly", "Handoff"],
    size: "2–5 people",
  },
  {
    image: "/images/activities/workload-check-in.jpg",
    emoji: "📊",
    name: "Workload Check-in",
    description:
      "A regular team check-in to surface overloads early and redistribute before burnout sets in",
    tags: ["Wellbeing", "Routine"],
    size: "3–10 people",
  },
  {
    image: "/images/activities/done-together-celebration.jpg",
    emoji: "🏁",
    name: "Done-Together Celebration",
    description:
      "When a shared task is completed, take a moment to celebrate collectively — effort deserves recognition",
    tags: ["Celebration", "Team"],
    size: "Any",
  },
  {
    image: "/images/activities/blocker-standup.jpg",
    emoji: "💬",
    name: "Blocker Standup",
    description:
      "A 10-minute daily or weekly call purely to surface and solve blockers collaboratively",
    tags: ["Focused", "Support"],
    size: "3–12 people",
  },
];

const TAG_COLORS: Record<string, string> = {
  Planning:
    "bg-[oklch(0.93_0.07_75)] text-[oklch(0.38_0.13_65)] border-[oklch(0.80_0.10_72)]",
  Team: "bg-[oklch(0.92_0.07_115)] text-[oklch(0.36_0.12_115)] border-[oklch(0.78_0.09_115)]",
  Routine:
    "bg-[oklch(0.92_0.06_190)] text-[oklch(0.35_0.11_190)] border-[oklch(0.78_0.09_190)]",
  Balanced:
    "bg-[oklch(0.93_0.06_155)] text-[oklch(0.32_0.12_155)] border-[oklch(0.76_0.09_155)]",
  Collaborative:
    "bg-[oklch(0.93_0.05_230)] text-[oklch(0.34_0.10_230)] border-[oklch(0.77_0.08_230)]",
  "1:1":
    "bg-[oklch(0.94_0.06_75)] text-[oklch(0.40_0.12_72)] border-[oklch(0.82_0.09_75)]",
  Focused:
    "bg-[oklch(0.94_0.08_50)] text-[oklch(0.38_0.14_48)] border-[oklch(0.80_0.11_50)]",
  Growth:
    "bg-[oklch(0.92_0.08_140)] text-[oklch(0.30_0.13_140)] border-[oklch(0.75_0.10_140)]",
  Energising:
    "bg-[oklch(0.93_0.07_50)] text-[oklch(0.38_0.13_48)] border-[oklch(0.79_0.10_50)]",
  "Decision-Making":
    "bg-[oklch(0.92_0.07_260)] text-[oklch(0.35_0.12_260)] border-[oklch(0.77_0.09_260)]",
  Learning:
    "bg-[oklch(0.92_0.07_295)] text-[oklch(0.36_0.12_295)] border-[oklch(0.77_0.09_295)]",
  "Remote-Friendly":
    "bg-[oklch(0.93_0.06_300)] text-[oklch(0.36_0.11_300)] border-[oklch(0.78_0.08_300)]",
  Handoff:
    "bg-[oklch(0.93_0.07_75)] text-[oklch(0.38_0.13_65)] border-[oklch(0.80_0.10_72)]",
  Wellbeing:
    "bg-[oklch(0.93_0.06_155)] text-[oklch(0.32_0.12_155)] border-[oklch(0.76_0.09_155)]",
  Celebration:
    "bg-[oklch(0.94_0.08_50)] text-[oklch(0.38_0.14_48)] border-[oklch(0.80_0.11_50)]",
  Support:
    "bg-[oklch(0.92_0.06_190)] text-[oklch(0.35_0.11_190)] border-[oklch(0.78_0.09_190)]",
};

const DEFAULT_TAG_COLOR =
  "bg-[oklch(0.92_0.05_190)] text-[oklch(0.35_0.10_190)] border-[oklch(0.78_0.08_190)]";

export function TaskSharingPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();

  return (
    <main className="pt-24 pb-20">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <Link href="/programs/meetup">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="task_page.back_button"
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Programs
            </Button>
          </Link>
        </motion.div>

        {/* Hero section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          data-ocid="task_page.section"
          className="mb-12"
        >
          <div className="relative bg-gradient-to-br from-[oklch(0.97_0.04_75)] via-[oklch(0.97_0.03_115)] to-[oklch(0.96_0.03_155)] rounded-3xl p-8 md:p-12 border border-border/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[oklch(0.95_0.06_75)] opacity-40 blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[oklch(0.93_0.06_115)] opacity-30 blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[oklch(0.40_0.13_75)] text-xs font-semibold border border-[oklch(0.82_0.1_75)]/60">
                  <Sparkles className="w-3 h-3" />
                  Task Sharing
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 text-[oklch(0.35_0.10_190)] text-xs font-medium border border-border/40">
                  {ALL_TASK_ACTIVITIES.length} activities
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Task Sharing{" "}
                <span className="text-[oklch(0.52_0.14_75)] italic">
                  Activities
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                From backlog blitzes to buddy systems — these structured
                activities help teams divide work fairly, reduce overload, and
                keep everyone moving forward together.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Activities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_TASK_ACTIVITIES.map((activity, i) => (
            <motion.div
              key={activity.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.055, duration: 0.4 }}
              data-ocid={`task_page.activity.item.${i + 1}`}
              className="group bg-card rounded-2xl border border-border/60 p-5 hover:border-[oklch(0.82_0.1_75)]/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250"
            >
              {activity.image && (
                <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden bg-muted/30">
                  <Image src={activity.image} alt={activity.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl leading-none mt-0.5 group-hover:scale-110 transition-transform duration-200">
                  {activity.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-base text-foreground leading-tight">
                    {activity.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {activity.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-3">
                <span>👥</span>
                <span>{activity.size}</span>
              </div>

              {/* Book button */}
              {!identity ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full gap-2"
                  data-ocid={`task_page.activity.open_modal_button.${i + 1}`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in to Book
                </Button>
              ) : (
                <div>
                  <CreateSessionModal
                    defaultType={ProgramType.taskAllocation}
                    defaultTitle={activity.name}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                        data-ocid={`task_page.activity.open_modal_button.${i + 1}`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Book Activity
                      </Button>
                    }
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-14 text-center"
        >
          <p className="text-muted-foreground mb-4 text-sm">
            Ready to tackle tasks together? Create a session and invite your
            team.
          </p>
          <Link href="/programs/meetup">
            <Button
              size="lg"
              className="rounded-full px-8 gap-2"
              data-ocid="task_page.primary_button"
            >
              Create a Task Session
              <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

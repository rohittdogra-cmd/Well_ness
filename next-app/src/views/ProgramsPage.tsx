"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Inbox, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { CreateSessionModal } from "../components/CreateSessionModal";
import { SessionCard, SessionCardSkeleton } from "../components/SessionCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUpcomingSessions } from "../hooks/useQueries";
import { ProgramType } from "../hooks/useQueries";
import { getProgramConfig, getProgramTypeFromPath } from "../lib/programConfig";

const EXERCISE_SPORTS = [
  {
    emoji: "🏏",
    name: "Box Cricket",
    description: "Fast-paced team cricket in a compact arena",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Indoor"],
  },
  {
    emoji: "🏓",
    name: "Pickleball",
    description: "Easy to learn, endlessly fun racket sport",
    levels: ["Beginner", "Intermediate"],
    formats: ["Indoor", "Outdoor"],
  },
  {
    emoji: "🏸",
    name: "Badminton",
    description: "Full-body workout with rapid rallies",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Indoor"],
  },
  {
    emoji: "🎾",
    name: "Tennis",
    description: "Serve, volley, and unwind on the court",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Outdoor"],
  },
  {
    emoji: "🧘",
    name: "Yoga",
    description: "Mindful movement for stress relief",
    levels: ["Beginner", "Intermediate"],
    formats: ["Indoor"],
  },
  {
    emoji: "🏃",
    name: "Running",
    description: "Group runs to clear the mind",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Outdoor"],
  },
  {
    emoji: "💪",
    name: "Group Workout",
    description: "HIIT and strength sessions together",
    levels: ["Beginner", "Intermediate"],
    formats: ["Indoor"],
  },
];

const MEETUP_ACTIVITIES = [
  {
    emoji: "☕",
    name: "Chai Pe Charcha",
    description:
      "Informal conversations over chai — share ideas, vent, laugh, or just unwind with colleagues",
    vibes: ["Casual", "Open Discussion"],
    size: "4–10 people",
  },
  {
    emoji: "🎙️",
    name: "Open Mic Stories",
    description:
      "Share a 2-minute story, joke, or experience in a safe, supportive circle",
    vibes: ["Creative", "Supportive"],
    size: "6–15 people",
  },
  {
    emoji: "🧩",
    name: "Icebreaker Circle",
    description:
      "Quick fun questions and activities to spark connections across teams",
    vibes: ["Fun", "Team Bonding"],
    size: "5–20 people",
  },
  {
    emoji: "🌿",
    name: "Mindful Check-in",
    description:
      "A gentle round of sharing how you're really doing — no advice, just listening",
    vibes: ["Mindful", "Safe Space"],
    size: "3–8 people",
  },
  {
    emoji: "🚶",
    name: "Walk & Talk",
    description:
      "Side-by-side strolls that make deep conversations feel easier and lighter",
    vibes: ["Active", "1:1 or Small Group"],
    size: "2–6 people",
  },
  {
    emoji: "📖",
    name: "Book / Podcast Club",
    description:
      "Discuss a chapter, episode, or idea that made you think differently",
    vibes: ["Intellectual", "Curious"],
    size: "4–12 people",
  },
];

const VIBE_COLORS: Record<string, string> = {
  Casual:
    "bg-[oklch(0.93_0.07_75)] text-[oklch(0.38_0.13_65)] border-[oklch(0.80_0.10_72)]",
  "Open Discussion":
    "bg-[oklch(0.92_0.06_190)] text-[oklch(0.35_0.11_190)] border-[oklch(0.78_0.09_190)]",
  Creative:
    "bg-[oklch(0.92_0.07_295)] text-[oklch(0.36_0.12_295)] border-[oklch(0.77_0.09_295)]",
  Supportive:
    "bg-[oklch(0.93_0.06_155)] text-[oklch(0.32_0.12_155)] border-[oklch(0.76_0.09_155)]",
  Fun: "bg-[oklch(0.94_0.08_50)] text-[oklch(0.38_0.14_48)] border-[oklch(0.80_0.11_50)]",
  "Team Bonding":
    "bg-[oklch(0.92_0.07_115)] text-[oklch(0.36_0.12_115)] border-[oklch(0.78_0.09_115)]",
  Mindful:
    "bg-[oklch(0.93_0.06_190)] text-[oklch(0.35_0.11_190)] border-[oklch(0.78_0.09_190)]",
  "Safe Space":
    "bg-[oklch(0.93_0.05_230)] text-[oklch(0.34_0.10_230)] border-[oklch(0.77_0.08_230)]",
  Active:
    "bg-[oklch(0.92_0.07_145)] text-[oklch(0.32_0.12_145)] border-[oklch(0.76_0.09_145)]",
  "1:1 or Small Group":
    "bg-[oklch(0.94_0.06_75)] text-[oklch(0.40_0.12_72)] border-[oklch(0.82_0.09_75)]",
  Intellectual:
    "bg-[oklch(0.92_0.07_260)] text-[oklch(0.35_0.12_260)] border-[oklch(0.77_0.09_260)]",
  Curious:
    "bg-[oklch(0.93_0.07_50)] text-[oklch(0.38_0.13_48)] border-[oklch(0.79_0.10_50)]",
};

const DEFAULT_VIBE_COLOR =
  "bg-[oklch(0.92_0.05_190)] text-[oklch(0.35_0.10_190)] border-[oklch(0.78_0.08_190)]";

const LEVEL_STYLES: Record<string, string> = {
  Beginner:
    "bg-[oklch(0.92_0.08_145)] text-[oklch(0.30_0.12_145)] border-[oklch(0.76_0.10_145)]",
  Intermediate:
    "bg-[oklch(0.94_0.09_85)] text-[oklch(0.38_0.14_75)] border-[oklch(0.82_0.11_80)]",
  Advanced:
    "bg-[oklch(0.93_0.08_50)] text-[oklch(0.38_0.14_40)] border-[oklch(0.78_0.12_48)]",
};

const FORMAT_STYLES: Record<string, string> = {
  Indoor:
    "bg-[oklch(0.92_0.05_230)] text-[oklch(0.34_0.12_230)] border-[oklch(0.77_0.09_230)]",
  Outdoor:
    "bg-[oklch(0.92_0.05_155)] text-[oklch(0.32_0.12_155)] border-[oklch(0.75_0.08_155)]",
};

function SportCategoriesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-xl font-bold text-foreground">
          Sport Categories
        </h2>
        <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
          {EXERCISE_SPORTS.length} activities
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {EXERCISE_SPORTS.map((sport, i) => (
          <motion.div
            key={sport.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            data-ocid={`exercise.sport.item.${i + 1}`}
            className="bg-card rounded-2xl border border-border/60 p-4 hover:border-primary/30 hover:shadow-md transition-all duration-250"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl leading-none mt-0.5">
                {sport.emoji}
              </span>
              <div>
                <h3 className="font-semibold text-sm text-foreground leading-tight">
                  {sport.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {sport.description}
                </p>
              </div>
            </div>

            {/* Skill level badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              {sport.levels.map((level) => (
                <span
                  key={level}
                  className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${LEVEL_STYLES[level]}`}
                >
                  {level}
                </span>
              ))}
            </div>

            {/* Format tags */}
            <div className="flex flex-wrap gap-1">
              {sport.formats.map((fmt) => (
                <span
                  key={fmt}
                  className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${FORMAT_STYLES[fmt]}`}
                >
                  {fmt === "Indoor" ? "🏢" : "🌿"} {fmt}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function MeetupActivitiesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            Meetup Ideas
          </h2>
          <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
            {MEETUP_ACTIVITIES.length} previewed
          </span>
        </div>
        <Link href="/meetup-activities">
          <Button
            variant="outline"
            size="sm"
            data-ocid="meetup.view_all.button"
            className="gap-1.5 text-xs"
          >
            View All Activities
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MEETUP_ACTIVITIES.map((activity, i) => (
          <motion.div
            key={activity.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            data-ocid={`meetup.activity.item.${i + 1}`}
            className="bg-card rounded-2xl border border-border/60 p-5 hover:border-primary/30 hover:shadow-md transition-all duration-250"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl leading-none mt-0.5">
                {activity.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground leading-tight">
                  {activity.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>

            {/* Vibe badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              {activity.vibes.map((vibe) => (
                <span
                  key={vibe}
                  className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                    VIBE_COLORS[vibe] ?? DEFAULT_VIBE_COLOR
                  }`}
                >
                  {vibe}
                </span>
              ))}
            </div>

            {/* Group size */}
            <div className="text-[10px] text-muted-foreground font-medium mt-1">
              👥 {activity.size}
            </div>
          </motion.div>
        ))}
      </div>

      {/* View all CTA */}
      <div className="mt-5 text-center">
        <Link href="/meetup-activities">
          <Button
            variant="ghost"
            size="sm"
            data-ocid="meetup.view_all_bottom.button"
            className="gap-2 text-muted-foreground hover:text-foreground text-xs"
          >
            See 8 more activities
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </motion.section>
  );
}

export function ProgramsPage() {
  const { type } = useParams() as { type: string };
  const programType = getProgramTypeFromPath(type) ?? ProgramType.meetup;
  const cfg = getProgramConfig(programType);

  const { data: sessions, isLoading, isError } = useUpcomingSessions({
    type: programType,
  });
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <main className="pt-24 pb-20">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${cfg.bgClass} text-3xl mb-4 shadow-sm`}
          >
            {cfg.emoji}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                {cfg.label}
              </h1>
              <p className="text-muted-foreground max-w-xl">
                {cfg.description}
              </p>
            </div>

            {isAuthenticated ? (
              <CreateSessionModal defaultType={programType} />
            ) : (
              <Button
                variant="outline"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="nav.login_button"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in to create
              </Button>
            )}
          </div>
        </motion.div>

        {/* Sport Categories — only for exercise */}
        {programType === ProgramType.exercise && <SportCategoriesSection />}

        {/* Meetup Ideas — only for meetup */}
        {programType === ProgramType.meetup && <MeetupActivitiesSection />}

        {/* Sessions */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="session.loading_state"
          >
            <SessionCardSkeleton key="sk1" />
            <SessionCardSkeleton key="sk2" />
            <SessionCardSkeleton key="sk3" />
            <SessionCardSkeleton key="sk4" />
            <SessionCardSkeleton key="sk5" />
            <SessionCardSkeleton key="sk6" />
          </div>
        ) : isError ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="session.error_state"
          >
            Failed to load sessions. Please try again.
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
            data-ocid="session.empty_state"
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${cfg.bgClass} text-4xl mx-auto mb-4`}
            >
              <Inbox className={`w-7 h-7 ${cfg.textClass}`} />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No sessions yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Be the first to create a {cfg.label.toLowerCase()} session and
              invite others to join.
            </p>
            {isAuthenticated ? (
              <CreateSessionModal defaultType={programType} />
            ) : (
              <Button onClick={login} disabled={isLoggingIn}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign in to create a session
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <Badge variant="secondary" className="text-xs">
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session, i) => (
                <SessionCard
                  key={session.id.toString()}
                  session={session}
                  index={i}
                  showJoinLeave
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

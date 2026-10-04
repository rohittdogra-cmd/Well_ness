"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, LogIn, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { CreateSessionModal } from "../components/CreateSessionModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ProgramType } from "../hooks/useQueries";

const ALL_MEETUP_ACTIVITIES = [
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
  {
    emoji: "🎨",
    name: "Doodle & Chill",
    description:
      "Freeform sketching together — no skill needed, just vibes and creative freedom",
    vibes: ["Creative", "Relaxed"],
    size: "3–10 people",
  },
  {
    emoji: "🎵",
    name: "Playlist Battle",
    description:
      "Each person adds one song, then the group vibes together — discover new favorites",
    vibes: ["Fun", "Casual"],
    size: "4–12 people",
  },
  {
    emoji: "🌅",
    name: "Sunrise / Sunset Watch",
    description:
      "Gather to watch the sky change colors as a team — a shared moment of quiet wonder",
    vibes: ["Mindful", "Outdoor"],
    size: "Any",
  },
  {
    emoji: "🍜",
    name: "Lunch Roulette",
    description:
      "Random pairing for lunch with a new colleague every week — grow your circle one meal at a time",
    vibes: ["Social", "1:1 or Small Group"],
    size: "2 people",
  },
  {
    emoji: "🎲",
    name: "Board Game Hour",
    description:
      "Strategy and laughs with classic or modern board games — friendly competition that bonds",
    vibes: ["Fun", "Team Bonding"],
    size: "4–8 people",
  },
  {
    emoji: "🌱",
    name: "Gratitude Circle",
    description:
      "Each person shares one thing they're grateful for today — small moments of joy, amplified",
    vibes: ["Mindful", "Safe Space"],
    size: "3–10 people",
  },
  {
    emoji: "🤸",
    name: "Stretch & Breathe",
    description:
      "A gentle 10-minute group stretch and breathing break to reset during a busy day",
    vibes: ["Active", "Mindful"],
    size: "Any",
  },
  {
    emoji: "🍕",
    name: "Friday Unwinding",
    description:
      "End-of-week informal hangout to celebrate small wins, share laughs, and recharge",
    vibes: ["Casual", "Supportive"],
    size: "5–20 people",
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
  Relaxed:
    "bg-[oklch(0.93_0.06_300)] text-[oklch(0.36_0.11_300)] border-[oklch(0.78_0.08_300)]",
  Outdoor:
    "bg-[oklch(0.92_0.08_140)] text-[oklch(0.30_0.13_140)] border-[oklch(0.75_0.10_140)]",
  Social:
    "bg-[oklch(0.93_0.07_30)] text-[oklch(0.38_0.13_28)] border-[oklch(0.79_0.10_30)]",
};

const DEFAULT_VIBE_COLOR =
  "bg-[oklch(0.92_0.05_190)] text-[oklch(0.35_0.10_190)] border-[oklch(0.78_0.08_190)]";

export function MindfulMeetupPage() {
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
              data-ocid="meetup_page.back_button"
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
          data-ocid="meetup_page.section"
          className="mb-12"
        >
          <div className="relative bg-gradient-to-br from-[oklch(0.97_0.04_75)] via-[oklch(0.97_0.03_155)] to-[oklch(0.96_0.03_230)] rounded-3xl p-8 md:p-12 border border-border/50 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[oklch(0.93_0.06_75)] opacity-40 blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[oklch(0.93_0.06_155)] opacity-30 blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[oklch(0.38_0.13_65)] text-xs font-semibold border border-[oklch(0.85_0.08_65)]/60">
                  <Sparkles className="w-3 h-3" />
                  Mindful Meetup
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 text-[oklch(0.35_0.10_190)] text-xs font-medium border border-border/40">
                  {ALL_MEETUP_ACTIVITIES.length} activities
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Mindful Meetup{" "}
                <span className="text-primary italic">Activities</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                From chai over conversations to group gratitude circles — these
                activities help your team slow down, connect meaningfully, and
                return to work feeling human again.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Activities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_MEETUP_ACTIVITIES.map((activity, i) => (
            <motion.div
              key={activity.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.055, duration: 0.4 }}
              data-ocid={`meetup_page.activity.item.${i + 1}`}
              className="group bg-card rounded-2xl border border-border/60 p-5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250"
            >
              {/* Emoji + name */}
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

              {/* Vibe badges */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {activity.vibes.map((vibe) => (
                  <span
                    key={vibe}
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      VIBE_COLORS[vibe] ?? DEFAULT_VIBE_COLOR
                    }`}
                  >
                    {vibe}
                  </span>
                ))}
              </div>

              {/* Group size */}
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
                  data-ocid={`meetup_page.activity.open_modal_button.${i + 1}`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in to Book
                </Button>
              ) : (
                <div className="mt-0">
                  <CreateSessionModal
                    defaultType={ProgramType.meetup}
                    defaultTitle={activity.name}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                        data-ocid={`meetup_page.activity.open_modal_button.${i + 1}`}
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
            Ready to host one of these? Create a session and invite your team.
          </p>
          <Link href="/programs/meetup">
            <Button
              size="lg"
              className="rounded-full px-8 gap-2"
              data-ocid="meetup_page.primary_button"
            >
              Create a Meetup Session
              <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

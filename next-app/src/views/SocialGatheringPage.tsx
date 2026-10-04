"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, LogIn, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { CreateSessionModal } from "../components/CreateSessionModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ProgramType } from "../hooks/useQueries";

const ALL_SOCIAL_ACTIVITIES = [
  {
    emoji: "🍕",
    name: "Pizza & Chill Night",
    description:
      "Casual evening with food, games, and good conversation — no agenda, just vibes",
    tags: ["Casual", "Evening"],
    size: "6–20 people",
  },
  {
    emoji: "🎭",
    name: "Improv Comedy Night",
    description:
      "Guided improv games that break the ice and have everyone laughing together",
    tags: ["Fun", "Interactive"],
    size: "8–20 people",
  },
  {
    emoji: "🌿",
    name: "Terrace Hangout",
    description:
      "Unwind outdoors with colleagues over snacks and fresh air — an informal social reset",
    tags: ["Outdoor", "Relaxed"],
    size: "4–15 people",
  },
  {
    emoji: "🎮",
    name: "Game Tournament",
    description:
      "Friendly brackets in board games, card games, or video games to spark lighthearted rivalry",
    tags: ["Fun", "Team Bonding"],
    size: "8–24 people",
  },
  {
    emoji: "🎨",
    name: "Paint & Sip",
    description:
      "Follow along a guided painting session with drinks — creativity meets relaxation",
    tags: ["Creative", "Relaxed"],
    size: "4–16 people",
  },
  {
    emoji: "🍳",
    name: "Potluck Cook-Off",
    description:
      "Everyone brings one dish from home — share recipes, stories, and flavours from different cultures",
    tags: ["Cultural", "Social"],
    size: "8–25 people",
  },
  {
    emoji: "🏕️",
    name: "Bonfire Circle",
    description:
      "Gather around a fire for stories, music, and s'mores — the warmth of community, literally",
    tags: ["Outdoor", "Evening"],
    size: "6–20 people",
  },
  {
    emoji: "📸",
    name: "Photo Walk",
    description:
      "Explore a neighbourhood together with cameras — see the world through each other's eyes",
    tags: ["Outdoor", "Creative"],
    size: "4–12 people",
  },
  {
    emoji: "🧩",
    name: "Puzzle Relay",
    description:
      "Teams race to complete sections of a giant puzzle — collaboration under fun pressure",
    tags: ["Team Bonding", "Indoor"],
    size: "6–20 people",
  },
  {
    emoji: "🎶",
    name: "Karaoke Bash",
    description:
      "Belt out classics together — no talent required, only enthusiasm and courage",
    tags: ["Fun", "Evening"],
    size: "8–30 people",
  },
  {
    emoji: "🌍",
    name: "Culture Exchange Hour",
    description:
      "Each person shares something from their culture — music, food, tradition, or a story",
    tags: ["Cultural", "Inclusive"],
    size: "6–18 people",
  },
  {
    emoji: "🏡",
    name: "Neighbourly Picnic",
    description:
      "Blankets on the grass, a shared basket, and an afternoon away from screens and stress",
    tags: ["Outdoor", "Casual"],
    size: "6–30 people",
  },
];

const TAG_COLORS: Record<string, string> = {
  Casual:
    "bg-[oklch(0.93_0.07_75)] text-[oklch(0.38_0.13_65)] border-[oklch(0.80_0.10_72)]",
  Evening:
    "bg-[oklch(0.92_0.06_295)] text-[oklch(0.36_0.12_295)] border-[oklch(0.77_0.09_295)]",
  Fun: "bg-[oklch(0.94_0.08_50)] text-[oklch(0.38_0.14_48)] border-[oklch(0.80_0.11_50)]",
  Interactive:
    "bg-[oklch(0.92_0.07_190)] text-[oklch(0.35_0.11_190)] border-[oklch(0.78_0.09_190)]",
  Outdoor:
    "bg-[oklch(0.92_0.08_140)] text-[oklch(0.30_0.13_140)] border-[oklch(0.75_0.10_140)]",
  Relaxed:
    "bg-[oklch(0.93_0.06_300)] text-[oklch(0.36_0.11_300)] border-[oklch(0.78_0.08_300)]",
  "Team Bonding":
    "bg-[oklch(0.92_0.07_115)] text-[oklch(0.36_0.12_115)] border-[oklch(0.78_0.09_115)]",
  Creative:
    "bg-[oklch(0.92_0.07_295)] text-[oklch(0.36_0.12_295)] border-[oklch(0.77_0.09_295)]",
  Social:
    "bg-[oklch(0.93_0.07_30)] text-[oklch(0.38_0.13_28)] border-[oklch(0.79_0.10_30)]",
  Cultural:
    "bg-[oklch(0.93_0.06_45)] text-[oklch(0.38_0.13_43)] border-[oklch(0.80_0.10_45)]",
  Inclusive:
    "bg-[oklch(0.93_0.05_230)] text-[oklch(0.34_0.10_230)] border-[oklch(0.77_0.08_230)]",
  Indoor:
    "bg-[oklch(0.92_0.05_190)] text-[oklch(0.35_0.10_190)] border-[oklch(0.78_0.08_190)]",
};

const DEFAULT_TAG_COLOR =
  "bg-[oklch(0.92_0.05_190)] text-[oklch(0.35_0.10_190)] border-[oklch(0.78_0.08_190)]";

export function SocialGatheringPage() {
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
              data-ocid="social_page.back_button"
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
          data-ocid="social_page.section"
          className="mb-12"
        >
          <div className="relative bg-gradient-to-br from-[oklch(0.97_0.04_295)] via-[oklch(0.97_0.03_30)] to-[oklch(0.96_0.03_75)] rounded-3xl p-8 md:p-12 border border-border/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[oklch(0.93_0.06_295)] opacity-40 blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[oklch(0.93_0.06_30)] opacity-30 blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-[oklch(0.34_0.14_295)] text-xs font-semibold border border-[oklch(0.77_0.09_295)]/60">
                  <Sparkles className="w-3 h-3" />
                  Social Gathering
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 text-[oklch(0.35_0.10_190)] text-xs font-medium border border-border/40">
                  {ALL_SOCIAL_ACTIVITIES.length} activities
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Social Gathering{" "}
                <span className="text-[oklch(0.44_0.16_295)] italic">
                  Activities
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                From game nights and culture exchanges to outdoor picnics —
                these gatherings create genuine bonds and a sense of belonging
                across your team.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Activities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_SOCIAL_ACTIVITIES.map((activity, i) => (
            <motion.div
              key={activity.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.055, duration: 0.4 }}
              data-ocid={`social_page.activity.item.${i + 1}`}
              className="group bg-card rounded-2xl border border-border/60 p-5 hover:border-[oklch(0.77_0.09_295)]/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250"
            >
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
                  data-ocid={`social_page.activity.open_modal_button.${i + 1}`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in to Book
                </Button>
              ) : (
                <div>
                  <CreateSessionModal
                    defaultType={ProgramType.socialGathering}
                    defaultTitle={activity.name}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                        data-ocid={`social_page.activity.open_modal_button.${i + 1}`}
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
            Found something fun? Create a session and invite your team.
          </p>
          <Link href="/programs/meetup">
            <Button
              size="lg"
              className="rounded-full px-8 gap-2"
              data-ocid="social_page.primary_button"
            >
              Create a Social Session
              <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

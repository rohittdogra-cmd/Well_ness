"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
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
import { useLocalProfile } from "../hooks/useLocalProfile";
import { BadmintonTurfBookingModal } from "../components/BadmintonTurfBookingModal";
import { TURF_VENUES } from "../lib/turfVenues";
import { MapPin, Sparkles, Building2 } from "lucide-react";
import { useState } from "react";

const EXERCISE_SPORTS = [
  {
    image: "/images/activities/box-cricket.jpg",
    emoji: "🏏",
    name: "Box Cricket",
    description: "Fast-paced team cricket in a compact arena",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Indoor"],
  },
  {
    image: "/images/activities/pickleball.jpg",
    emoji: "🏓",
    name: "Pickleball",
    description: "Easy to learn, endlessly fun racket sport",
    levels: ["Beginner", "Intermediate"],
    formats: ["Indoor", "Outdoor"],
  },
  {
    image: "/images/activities/badminton.jpg",
    emoji: "🏸",
    name: "Badminton",
    description: "Full-body workout with rapid rallies",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Indoor"],
  },
  {
    image: "/images/activities/tennis.jpg",
    emoji: "🎾",
    name: "Tennis",
    description: "Serve, volley, and unwind on the court",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Outdoor"],
  },
  {
    image: "/images/activities/yoga.jpg",
    emoji: "🧘",
    name: "Yoga",
    description: "Mindful movement for stress relief",
    levels: ["Beginner", "Intermediate"],
    formats: ["Indoor"],
  },
  {
    image: "/images/activities/running.jpg",
    emoji: "🏃",
    name: "Running",
    description: "Group runs to clear the mind",
    levels: ["Beginner", "Intermediate", "Advanced"],
    formats: ["Outdoor"],
  },
  {
    image: "/images/activities/group-workout.jpg",
    emoji: "💪",
    name: "Group Workout",
    description: "HIIT and strength sessions together",
    levels: ["Beginner", "Intermediate"],
    formats: ["Indoor"],
  },
];

const MEETUP_ACTIVITIES = [
  {
    image: "/images/activities/chai-pe-charcha.jpg",
    emoji: "☕",
    name: "Chai Pe Charcha",
    description:
      "Informal conversations over chai — share ideas, vent, laugh, or just unwind with colleagues",
    vibes: ["Casual", "Open Discussion"],
    size: "4–10 people",
  },
  {
    image: "/images/activities/open-mic-stories.jpg",
    emoji: "🎙️",
    name: "Open Mic Stories",
    description:
      "Share a 2-minute story, joke, or experience in a safe, supportive circle",
    vibes: ["Creative", "Supportive"],
    size: "6–15 people",
  },
  {
    image: "/images/activities/icebreaker-circle.jpg",
    emoji: "🧩",
    name: "Icebreaker Circle",
    description:
      "Quick fun questions and activities to spark connections across teams",
    vibes: ["Fun", "Team Bonding"],
    size: "5–20 people",
  },
  {
    image: "/images/activities/mindful-check-in.jpg",
    emoji: "🌿",
    name: "Mindful Check-in",
    description:
      "A gentle round of sharing how you're really doing — no advice, just listening",
    vibes: ["Mindful", "Safe Space"],
    size: "3–8 people",
  },
  {
    image: "/images/activities/walk-talk.jpg",
    emoji: "🚶",
    name: "Walk & Talk",
    description:
      "Side-by-side strolls that make deep conversations feel easier and lighter",
    vibes: ["Active", "1:1 or Small Group"],
    size: "2–6 people",
  },
  {
    image: "/images/activities/book-podcast-club.jpg",
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
            {(sport as any).image && (
              <div style={{ position: "relative", width: "100%", height: "120px", marginBottom: "12px", borderRadius: "8px", overflow: "hidden", background: "#e8edea" }}>
                <Image src={(sport as any).image} alt={sport.name} fill style={{ objectFit: "cover" }} />
              </div>
            )}
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
            {(activity as any).image && (
              <div style={{ position: "relative", width: "100%", height: "120px", marginBottom: "12px", borderRadius: "8px", overflow: "hidden", background: "#e8edea" }}>
                <Image src={(activity as any).image} alt={activity.name} fill style={{ objectFit: "cover" }} />
              </div>
            )}
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
  const localProfile = useLocalProfile();
  const [turfModalOpen, setTurfModalOpen] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState<{
    name: string;
    location: string;
  }>({
    name: "Shuttle Queen",
    location: "Janakpuri, Delhi",
  });

  const isBadminton = programType === ProgramType.badminton || type === "badminton";

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

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {isBadminton && (
                <Button
                  onClick={() => setTurfModalOpen(true)}
                  style={{ background: "#087f79", color: "white" }}
                >
                  🏸 Match &amp; Book Turf
                </Button>
              )}
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
          </div>
        </motion.div>

        {/* Dedicated Badminton Matchmaking & Playable Turf Courts Hub */}
        {isBadminton && (
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div
              style={{
                background: "linear-gradient(135deg, #087f79 0%, #0f766e 60%, #047857 100%)",
                borderRadius: "20px",
                padding: "24px 28px",
                color: "white",
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                boxShadow: "0 10px 25px -5px rgba(8, 127, 121, 0.3)",
              }}
            >
              <div style={{ maxWidth: "600px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255, 255, 255, 0.18)",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 750,
                    letterSpacing: "0.04em",
                    marginBottom: "10px",
                  }}
                >
                  <Sparkles size={13} /> 2-PLAYER BADMINTON MATCHMAKING &amp; TURF BOOKING
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 8px", lineHeight: 1.25 }}>
                  Find a doubles/singles partner &amp; book verified turf courts nearby.
                </h2>
                <p style={{ margin: 0, fontSize: "13.5px", opacity: 0.9, lineHeight: 1.5 }}>
                  Both players coordinate a mutual area (Janakpuri, Gurgaon, Noida, Palwal), choose an authentic court with teak wood or synthetic BWF mats, and get verified by our operations team.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTurfModalOpen(true)}
                style={{
                  background: "#ffffff",
                  color: "#087f79",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                🏸 Match Partner &amp; Book Slot <ArrowRight size={16} />
              </button>
            </div>

            {/* Playable Arenas Showcase */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                    Verified Playable Turfs &amp; Badminton Arenas
                  </h3>
                  <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                    Indoor air-conditioned halls with Yonex rentals and certified flooring
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {TURF_VENUES.map((turf) => (
                  <div
                    key={turf.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <strong style={{ fontSize: "15px", color: "#0f172a" }}>{turf.name}</strong>
                        <span
                          style={{
                            background: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "6px",
                          }}
                        >
                          ⭐ {turf.rating}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                        <MapPin size={12} color="#0d9488" /> {turf.cityState}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                        <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: 650, padding: "2px 8px", borderRadius: "6px" }}>
                          {turf.courtType}
                        </span>
                        {turf.amenities.slice(0, 2).map((a) => (
                          <span key={a} style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", padding: "2px 6px", borderRadius: "6px" }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f766e" }}>
                        ₹{turf.pricePerHour} <small style={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}>/ hr</small>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPartnerDetails({ name: "Shuttle Queen", location: turf.cityState });
                          setTurfModalOpen(true);
                        }}
                        style={{
                          background: "#087f79",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Book Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

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

      <BadmintonTurfBookingModal
        isOpen={turfModalOpen}
        onClose={() => setTurfModalOpen(false)}
        partnerCuteName={partnerDetails.name}
        partnerLocation={partnerDetails.location}
        userCuteName={localProfile?.name || "Smash Sensation"}
        userLocation={localProfile?.location || "Janakpuri, Delhi"}
      />
    </main>
  );
}

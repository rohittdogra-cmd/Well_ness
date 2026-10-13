"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Wind, RotateCcw, ArrowRight } from "lucide-react";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Take a Moment — a short, private pause.
 *
 * Deliberately non-clinical and unhurried: no audio, no counts you can fail,
 * no mandatory steps. The breathing guide is a plain CSS animation that expands
 * and contracts on its own; it pauses when the tab is hidden and stops entirely
 * under prefers-reduced-motion. The only data written is the existing private
 * mood check-in, which nobody else, including administrators, can read.
 */

const PROMPTS = [
  "What is taking up the most room in your head right now?",
  "Name one thing that went better today than you expected.",
  "If a friend were in your situation, what would you tell them?",
  "What do you actually want, separate from what you think you should want?",
  "What would you do with an hour that belonged only to you?",
];

/**
 * Must match the `check_ins` mood vocabulary and the existing DailyCheckIn, so
 * one account has a single, continuous mood history rather than two schemes.
 */
const MOODS = [
  { label: "Great", note: "as it is" },
  { label: "Good", note: "something lifted" },
  { label: "Okay", note: "carrying more" },
  { label: "Low", note: "something close" },
  { label: "Overwhelmed", note: "cannot settle" },
];

export function TakeAMomentPage() {
  const { user } = useInternetIdentity();
  const [phase, setPhase] = useState<"idle" | "breathing" | "done">("idle");
  const [prompt, setPrompt] = useState(0);
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [moodSaved, setMoodSaved] = useState(false);
  const [noteCleared, setNoteCleared] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Respect the operating-system preference rather than assuming it.
  // useSyncExternalStore is the right tool for matchMedia: it reads the value on
  // the client, falls back to false while server-rendering, and updates live if
  // the preference changes. Setting state inside an effect would cost an extra
  // render and can disagree with the server markup.
  const reduced = useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  // Do not animate in a background tab.
  useEffect(() => {
    if (phase !== "breathing") return;
    const onVisibility = () => setPhase(document.hidden ? "idle" : "breathing");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [phase]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function breathe() {
    setPhase("breathing");
    setNoteCleared(false);
    setPrompt((p) => (p + 1) % PROMPTS.length);
    // One cycle is roughly 22 seconds: slow enough to be calming, short enough
    // that nobody is trapped here.
    timer.current = setTimeout(() => setPhase("done"), 22_000);
  }

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    setPhase("idle");
  }

  async function saveMood(value: string) {
    setMood(value);
    if (!user) return;
    const now = new Date();
    const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    try {
      const { isConfigured, getSupabase } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`wellness_checkin_${user.id}_${day}`, value);
        }
        setMoodSaved(true);
        return;
      }
      // The only thing this page persists. Private by database policy.
      await getSupabase().from("check_ins").upsert({ user_id: user.id, day, mood: value });
      setMoodSaved(true);
    } catch {
      setMoodSaved(false);
    }
  }

  return (
    <div className="wellness-shell">
      <div className="moment-page">
        <header className="moment-header">
          <span className="eyebrow">TAKE A MOMENT</span>
          <h1>Nothing to do here.</h1>
          <p>
            One minute is enough. There is no right way to use this and nothing
            you can get wrong.
          </p>
        </header>

        <section
          className={`moment-breath moment-${phase}`}
          aria-live="polite"
          aria-label={
            phase === "breathing"
              ? "Breathing guide, expanding and contracting slowly"
              : "Breathing guide, idle"
          }
        >
          <div className="moment-orb" aria-hidden="true">
            {!reduced && <span className="moment-orb-ring" />}
          </div>
          <p className="moment-phase">
            {phase === "breathing"
              ? "Follow the shape. Breathe in, and let it go."
              : phase === "done"
                ? "That is enough. Nothing else is required."
                : reduced
                  ? "Your system asks for reduced motion, so the visual stays still."
                  : "Start when you are ready, or skip it entirely."}
          </p>
          {phase !== "breathing" ? (
            <button className="wellness-button" onClick={breathe}>
              <Wind size={16} /> Start one minute
            </button>
          ) : (
            <button className="text-action" onClick={stop}>
              <RotateCcw size={15} /> Stop
            </button>
          )}
        </section>

        <section className="moment-prompt">
          <h2>One thing to sit with</h2>
          <blockquote>{PROMPTS[prompt]}</blockquote>
          <button
            className="text-action"
            onClick={() => setPrompt((p) => (p + 1) % PROMPTS.length)}
          >
            Give me another
          </button>
        </section>

        <section className="moment-mood">
          <h2>How are you arriving?</h2>
          <div className="moment-mood-grid" role="group" aria-label="How are you arriving?">
            {MOODS.map((m) => (
              <button
                key={m.label}
                type="button"
                aria-pressed={mood === m.label}
                className={mood === m.label ? "selected" : ""}
                onClick={() => saveMood(m.label)}
              >
                <strong>{m.label}</strong>
                <small>{m.note}</small>
              </button>
            ))}
          </div>
          <p className="moment-privacy" role="status">
            {user
              ? moodSaved
                ? "Saved to your account. Nobody else can see this, and neither can the platform administrators."
                : "Private to you. Nobody else can see this."
              : "Sign in to keep this privately, or just carry it with you."}
          </p>
        </section>

        <section className="moment-note">
          <h2>Leave a note to yourself</h2>
          <label className="field-label" htmlFor="moment-note">
            Only you see this in this browser. It is not uploaded.
          </label>
          <textarea
            id="moment-note"
            rows={4}
            maxLength={500}
            value={note}
            placeholder="Anything you want to put down before you go back."
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="composer-actions">
            <button
              type="button"
              className="wellness-button light"
              disabled={!note.trim()}
              onClick={() => {
                setNote("");
                setNoteCleared(true);
              }}
            >
              {noteCleared ? "Cleared" : "Clear it and let it go"}
            </button>
          </div>
        </section>

        <footer className="moment-exit">
          <p>That is the whole thing. You can leave whenever you like.</p>
          <div className="moment-exit-actions">
            <Link className="wellness-button" href="/discuss">
              Back to conversations <ArrowRight size={16} />
            </Link>
            <Link className="text-action" href="/">
              Take a quiet moment instead
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
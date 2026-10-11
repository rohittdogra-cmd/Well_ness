"use client";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";

/**
 * The last seven days of private mood check-ins.
 *
 * Read as a trend rather than a chart: a member glancing at their dashboard
 * wants to know whether they have been more steady or more stretched, and a row
 * of seven marks answers that in a glance. Only the member's own rows are
 * readable, by database policy.
 */
export type MoodDay = { day: string; mood: string };

const MOOD_ORDER = ["Overwhelmed", "Low", "Okay", "Good", "Great"];

/** Height on a 1-5 scale; unknown or unrecorded days fall back to a flat line. */
export function moodWeight(mood: string | undefined) {
  const index = MOOD_ORDER.indexOf(mood ?? "");
  return index === -1 ? 0 : index + 1;
}

export function moodLabel(mood: string | undefined) {
  return mood ?? "Not recorded";
}

function isoDay(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useMoodWeek(userId: string | undefined) {
  return useQuery({
    queryKey: ["mood-week", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const days = Array.from({ length: 7 }, (_, i) => isoDay(6 - i));
      const { isConfigured } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        const sampleMoods = ["Good", "Great", "Okay", "Good", "Great", "Good", "Great"];
        return days.map((day, idx) => ({ day, mood: sampleMoods[idx % sampleMoods.length] }));
      }
      const { data, error } = await getSupabase()
        .from("check_ins")
        .select("day,mood")
        .eq("user_id", userId!)
        .gte("day", days[0])
        .order("day", { ascending: true });
      if (error) throw error;
      const found = new Map(
        ((data ?? []) as { day: string; mood: string }[]).map((r) => [
          r.day,
          r.mood,
        ]),
      );
      // Always return seven entries so the strip never changes width.
      return days.map((day) => ({ day, mood: found.get(day) }));
    },
  });
}
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Mascot } from "./Mascot";
import { Check } from "lucide-react";
import { toast } from "sonner";
export function DailyCheckIn() {
  const { user } = useInternetIdentity();
  const qc = useQueryClient();
  const now = new Date();
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const query = useQuery({
    queryKey: ["check-in", user?.id, day],
    enabled: !!user,
    queryFn: async () => {
      const { isConfigured, getSupabase } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        if (typeof window !== "undefined") {
          return localStorage.getItem(`wellness_checkin_${user!.id}_${day}`);
        }
        return null;
      }
      const { data, error } = await getSupabase()
        .from("check_ins")
        .select("mood")
        .eq("user_id", user!.id)
        .eq("day", day)
        .maybeSingle();
      if (error) throw error;
      return (data?.mood ?? null) as string | null;
    },
  });
  const mutation = useMutation({
    mutationFn: async (mood: string) => {
      const { isConfigured, getSupabase } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`wellness_checkin_${user!.id}_${day}`, mood);
        }
        return;
      }
      const { error } = await getSupabase()
        .from("check_ins")
        .upsert({ user_id: user!.id, day, mood });
      if (error) throw error;
    },
    onSuccess: (_data, mood) => {
      qc.invalidateQueries({ queryKey: ["check-in"] });
      qc.invalidateQueries({ queryKey: ["mood-week"] });
      toast.success(`Check-in recorded: ${mood}`);
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <section className="pulse-panel">
      <div>
        <span className="eyebrow">A MOMENT FOR YOU</span>
        <h2>How’s your day, really?</h2>
        <p>No right answer. Just a little check-in.</p>
      </div>
      <div className="pulse-options">
        {["Great", "Good", "Okay", "Low", "Overwhelmed"].map((label, i) => (
          <button
            key={label}
            disabled={mutation.isPending || query.isPending}
            type="button"
            aria-pressed={query.data === label}
            onClick={() => mutation.mutate(label)}
            className={query.data === label ? "selected" : ""}
          >
            <Mascot variant={[0, 1, 4, 2, 5][i]} />
            <span>
              {label}
              {query.data === label && <Check size={12} />}
            </span>
          </button>
        ))}
        <p className="pulse-response" role="status">
          {query.error
            ? "Could not load your check-in. Refresh to try again."
            : mutation.isPending
              ? "Saving your check-in…"
              : query.data
                ? "Thanks for making a little room for yourself today."
                : "Private to you. Saved securely to your account."}
        </p>
      </div>
    </section>
  );
}

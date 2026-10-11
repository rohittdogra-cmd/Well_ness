"use client";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { useInternetIdentity } from "./useInternetIdentity";
export type LocalProfile = {
  name: string;
  avatar: number;
  bio: string;
  interests: string[];
  availability: string[];
  goal: string;
};
export function useProfileQuery() {
  const { user } = useInternetIdentity();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { isConfigured } = await import("@/lib/supabase/client");
      if (!isConfigured()) {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("wellness_local_profile");
          if (stored) {
            try {
              return JSON.parse(stored) as LocalProfile;
            } catch (e) {
              console.error(e);
            }
          }
        }
        return {
          name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Alex Member",
          avatar: 1,
          bio: "Here for mindful meetups, community sports, and wellness.",
          interests: ["Cricket", "Yoga", "Mindfulness"],
          availability: ["Weekdays after 5pm", "Weekends"],
          goal: "Build healthy habits and connect with peers",
        } as LocalProfile;
      }
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("name,avatar,bio,interests,availability,goal")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data || {
        name: "",
        avatar: 0,
        bio: "",
        interests: [],
        availability: [],
        goal: "",
      }) as LocalProfile;
    },
  });
}
export function useLocalProfile(): LocalProfile | null {
  const { data } = useProfileQuery();
  return data?.name.trim() ? data : null;
}
export async function saveLocalProfile(profile: LocalProfile, userId: string) {
  const { isConfigured } = await import("@/lib/supabase/client");
  if (!isConfigured()) {
    if (typeof window !== "undefined") {
      localStorage.setItem("wellness_local_profile", JSON.stringify(profile));
    }
    return;
  }
  const { error } = await getSupabase()
    .from("profiles")
    .upsert({ ...profile, id: userId }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
}

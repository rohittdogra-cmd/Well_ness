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
  gender?: "male" | "female" | "non-binary";
  location?: string;
  assignedCuteName?: string;
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
          const stored =
            (user?.id
              ? localStorage.getItem(`wellness_local_profile_${user.id}`)
              : null) || localStorage.getItem("wellness_local_profile");
          if (stored) {
            try {
              return JSON.parse(stored) as LocalProfile;
            } catch (e) {
              console.error(e);
            }
          }
        }
        return {
          name: "Smash Sensation",
          assignedCuteName: "Smash Sensation",
          gender: "male",
          location: "Janakpuri, Delhi",
          avatar: 1,
          bio: "Here for badminton matches, weekend turfs, and mindful wellness.",
          interests: ["Badminton", "Cricket", "Yoga"],
          availability: ["Weekdays after 5pm", "Weekends"],
          goal: "Build healthy habits and connect with peers",
        } as LocalProfile;
      }
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("name,avatar,bio,interests,availability,goal,location,gender")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) {
        // Fallback in case location/gender columns aren't in remote schema yet
        const retry = await getSupabase()
          .from("profiles")
          .select("name,avatar,bio,interests,availability,goal")
          .eq("id", user!.id)
          .maybeSingle();
        if (retry.error) throw retry.error;
        return (retry.data || {
          name: "",
          avatar: 0,
          bio: "",
          interests: [],
          availability: [],
          goal: "",
          location: "Janakpuri, Delhi",
          gender: "male",
        }) as LocalProfile;
      }
      return (data || {
        name: "",
        avatar: 0,
        bio: "",
        interests: [],
        availability: [],
        goal: "",
        location: "Janakpuri, Delhi",
        gender: "male",
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
      localStorage.setItem(
        `wellness_local_profile_${userId}`,
        JSON.stringify(profile),
      );
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

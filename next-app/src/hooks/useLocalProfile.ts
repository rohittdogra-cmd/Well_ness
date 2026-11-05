"use client";
import { maskContent } from "@/lib/moderation.mjs";
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
      try {
        const { data, error } = await getSupabase()
          .from("profiles")
          .select("name,avatar,bio,interests,availability,goal")
          .eq("id", user!.id)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          return {
            name: "",
            avatar: 0,
            bio: "",
            interests: [],
            availability: [],
            goal: "",
          } as LocalProfile;
        }
        return {
          ...data,
          name: data.name?.trim() ? data.name : "Smash Scorer",
        } as LocalProfile;
      } catch {
        // Fallback when remote database is unavailable or offline
        if (typeof window !== "undefined") {
          const local = localStorage.getItem(
            "wellness_local_profile_" + user?.id,
          );
          if (local) {
            try {
              return maskContent(JSON.parse(local)) as LocalProfile;
            } catch {}
          }
        }
        const defaultName =
          user?.user_metadata?.name ||
          user?.email?.split("@")[0] ||
          "Smash Scorer";
        return {
          name: maskContent({ name: defaultName }).name,
          avatar: 0,
          bio: "Active member in the wellness hub.",
          interests: ["Badminton", "Health & Wellness"],
          availability: ["After work"],
          goal: "Meet my people",
        } as LocalProfile;
      }
    },
  });
}

export function useLocalProfile(): LocalProfile | null {
  const { data } = useProfileQuery();
  return data?.name?.trim() ? data : null;
}

export async function saveLocalProfile(profile: LocalProfile, userId: string) {
  profile = maskContent(profile) as LocalProfile;
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "wellness_local_profile_" + userId,
      JSON.stringify(profile),
    );
  }
  try {
    const { error } = await getSupabase()
      .from("profiles")
      .upsert({ ...profile, id: userId }, { onConflict: "id" })
      .select()
      .single();
    if (error) console.warn("Supabase profile upsert warning:", error);
  } catch (e) {
    console.warn("Could not save to remote Supabase, saved locally:", e);
  }
}

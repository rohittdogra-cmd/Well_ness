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
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("name,avatar,bio,interests,availability,goal")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? {
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
  return data?.name?.trim() ? data : null;
}

export async function saveLocalProfile(profile: LocalProfile, userId: string) {
  profile = maskContent(profile) as LocalProfile;
  const { error } = await getSupabase()
    .from("profiles")
    .upsert({ ...profile, id: userId }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw new Error(error.message);
}

"use client";
import { useMemo } from "react";
import { createBackend } from "@/lib/backend";
import { useInternetIdentity } from "./useInternetIdentity";
export function useActor() {
  const { user, isInitializing } = useInternetIdentity();
  const actor = useMemo(
    () => createBackend(user?.id || "guest-member"),
    [user?.id],
  );
  return { actor, isFetching: isInitializing };
}

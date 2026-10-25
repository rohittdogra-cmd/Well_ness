"use client";
import { useQuery } from "@tanstack/react-query";
import { useInternetIdentity } from "./useInternetIdentity";
import { verificationStatus } from "@/lib/verification";
export function useVerification() {
  const { user } = useInternetIdentity();
  return useQuery({
    queryKey: ["verification", user?.id],
    enabled: !!user,
    queryFn: verificationStatus,
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 30000 : false,
  });
}

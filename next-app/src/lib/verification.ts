import { getSupabase } from "./supabase/client";
export type VerificationStatus = {
  verified: boolean;
  status: "unverified" | "pending" | "approved" | "rejected";
  method?: string;
  reason?: string;
};
export const restrictedActions = new Set([
  "create_group",
  "toggle_group",
  "react_post",
  "publish_post",
  "send_direct_message",
  "request_connection",
  "respond_connection",
  "book_provider",
  "create_session",
  "join_session",
]);
export async function verificationStatus(): Promise<VerificationStatus> {
  const { data, error } = await getSupabase().rpc("verification_status");
  if (error || !data || typeof data.verified !== "boolean")
    throw new Error("Could not check verification. Please try again.");
  return data as VerificationStatus;
}
export async function requireVerification() {
  if (!(await verificationStatus()).verified) {
    window.location.assign("/verify");
    throw new Error(
      "Verify your profile to chat, message or book. You can keep browsing freely.",
    );
  }
}

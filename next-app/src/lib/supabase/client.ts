import { createModeratedFetch } from "../moderation.mjs";
import { createBrowserClient } from "@supabase/ssr";
export const isConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
export function getSupabase() {
  if (!isConfigured())
    throw new Error(
      "Connect Supabase to enable your hub. Add the environment variables described in DEPLOYMENT.md.",
    );
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { fetch: createModeratedFetch() } },
  );
}

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  configurationProblem,
  isConfigured,
  SETUP_MESSAGE,
  supabaseConfig,
} from "../env";

export { isConfigured, configurationProblem, SETUP_MESSAGE };

let client: SupabaseClient | undefined;

/**
 * The browser Supabase client, created once per page load.
 *
 * `createBrowserClient` already memoises internally, but keeping our own
 * reference makes it explicit that every caller shares one client, and therefore
 * one auth listener and one realtime socket.
 */
export function getSupabase(): SupabaseClient {
  if (!isConfigured())
    throw new Error(configurationProblem() ?? SETUP_MESSAGE);
  client ??= createBrowserClient(supabaseConfig.url, supabaseConfig.key);
  return client;
}
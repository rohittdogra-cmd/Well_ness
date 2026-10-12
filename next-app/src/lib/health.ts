import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMissingSchemaError,
  isPermissionError,
  SCHEMA_MIGRATION,
} from "./dbErrors";

/**
 * Detects whether the database schema this build expects is actually installed.
 *
 * The application cannot run against a project that predates migration 6: it
 * reads `group_summaries` and `session_summaries` and calls `admin_stats()`,
 * `admin_user_profiles()`, `group_category_counts()` and
 * `submit_contact_request()`. Without that migration every page fails with a
 * Postgres message that means nothing to whoever is deploying.
 *
 * The probe deliberately runs as `anon`. The new views are granted to
 * `authenticated` only, so a correctly-installed database answers with a
 * permission error (42501) while a missing one answers with a relation error
 * (PGRST205 / 42P01). That difference is the signal, and it works without any
 * session, so a deployment check can use it.
 */
export type SchemaStatus = "current" | "missing" | "unknown";

/** Long enough for a cold connection, short enough to fail a deployment check. */
const PROBE_TIMEOUT_MS = 5000;

export async function inspectSchema(db: SupabaseClient): Promise<{
  schema: SchemaStatus;
  detail?: string;
}> {
  // Bounded, so an unreachable database fails the check in seconds instead of
  // holding the request open until the platform's own timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const { error } = await db
      .from("group_summaries")
      .select("id")
      .limit(1)
      .abortSignal(controller.signal);
    if (!error) return { schema: "current" };
    if (isMissingSchemaError(error))
      return {
        schema: "missing",
        detail: `Missing database schema. Apply supabase/migrations/${SCHEMA_MIGRATION}.`,
      };
    // Any other failure still proves the relation resolved, which is all this
    // probe is asking.
    if (isPermissionError(error)) return { schema: "current" };
    return { schema: "unknown", detail: "The schema probe returned an error." };
  } catch {
    return {
      schema: "unknown",
      detail: controller.signal.aborted
        ? `Supabase did not respond within ${PROBE_TIMEOUT_MS / 1000}s.`
        : "Supabase could not be reached.",
    };
  } finally {
    clearTimeout(timer);
  }
}
/**
 * Turns a PostgREST failure into something a person can act on.
 *
 * The raw message ("relation public.group_summaries does not exist") is
 * accurate but useless to whoever is looking at a blank page. This module is
 * isomorphic on purpose: the same explanation is needed by the server-side
 * health check and by the client-side error boundary.
 */

export const SCHEMA_MIGRATION = "202610020001_scale_and_index.sql";

/** The schema is installed but this caller is not allowed to see the row. */
const PERMISSION_ERRORS = new Set(["42501", "PGRST301"]);

/** The object the code expects does not exist in the database. */
const NOT_FOUND_ERRORS = new Set(["42P01", "PGRST205"]);

export function codeOf(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error))
    return "";
  return String((error as { code?: unknown }).code ?? "");
}

export function isMissingSchemaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    NOT_FOUND_ERRORS.has(codeOf(error)) ||
    /could not find the table|schema cache|does not exist/i.test(message)
  );
}

export function isPermissionError(error: unknown): boolean {
  return PERMISSION_ERRORS.has(codeOf(error));
}

export function describeDatabaseError(error: unknown): string {
  if (isMissingSchemaError(error))
    return `This database is missing the latest schema. Apply supabase/migrations/${SCHEMA_MIGRATION} in the Supabase SQL editor, then reload.`;
  if (isPermissionError(error))
    return "Your account does not have access to this. If that looks wrong, ask an administrator to check your permissions.";
  return error instanceof Error ? error.message : String(error ?? "");
}
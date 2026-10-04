import { NextResponse } from "next/server";
import { configurationProblem, isConfigured } from "@/lib/env";
import { inspectSchema } from "@/lib/health";
import { SCHEMA_MIGRATION } from "@/lib/dbErrors";
import { serverSupabase } from "@/lib/supabase/server";

/**
 * Deployment smoke test.
 *
 * Reports whether this deployment can actually serve traffic, which is three
 * separate questions:
 *
 *   1. Are the Supabase environment variables present and valid?
 *   2. Does the connected project have the schema this build expects?
 *   3. Did the routing/caching layer get far enough to answer at all?
 *
 * It never returns a key, a URL, or any member data, so it is safe to leave
 * public and to poll from a Vercel deployment check.
 */
export async function GET() {
  const problem = configurationProblem();
  if (problem)
    return NextResponse.json(
      {
        status: "misconfigured",
        supabase: "missing",
        schema: "unknown",
        detail: problem,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );

  const db = await serverSupabase();
  const { schema, detail } = await inspectSchema(db);

  // Only a positively-proven missing migration is a hard failure. An
  // inconclusive probe reports 200 with `schema: "unknown"` rather than
  // failing a deployment on a question we could not answer.
  const missing = schema === "missing";

  return NextResponse.json(
    {
      status: missing ? "degraded" : "ok",
      supabase: "configured",
      schema,
      ...(detail ? { detail } : {}),
      ...(schema === "unknown"
        ? {
            detail:
              "Supabase is configured but the schema probe was inconclusive; the public key may not reach the PostgREST API.",
          }
        : {}),
      ...(missing ? { migration: SCHEMA_MIGRATION } : {}),
    },
    {
      status: missing ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
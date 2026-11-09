import type { SupabaseClient } from "@supabase/supabase-js";

type Result<T> = {
  data: T[] | null;
  count: number | null;
  error: { message: string } | null;
};
async function count(
  query: PromiseLike<{
    count: number | null;
    error: { message: string } | null;
  }>,
) {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  if (result.count === null)
    throw new Error("The platform did not return a count. Please refresh.");
  return result.count;
}

// Read every page so the API's row limit cannot silently undercount participation.
export async function readAllPages<T>(
  page: (from: number, to: number) => PromiseLike<Result<T>>,
) {
  const rows: T[] = [];
  for (let from = 0; ; from = rows.length) {
    const result = await page(from, from + 499);
    if (result.error) throw new Error(result.error.message);
    if (result.count === null)
      throw new Error("The platform did not return a complete result count.");
    rows.push(...(result.data ?? []));
    if (rows.length >= result.count) return rows;
    if (!result.data?.length)
      throw new Error(
        "The platform returned incomplete results. Please refresh.",
      );
  }
}

export async function loadAdminMetrics(db: SupabaseClient, now = new Date()) {
  const access = await db.rpc("is_admin");
  if (access.error || access.data !== true)
    throw new Error("Administrator access required");
  const end = now.toISOString();
  const since = new Date(now.getTime() - 7 * 86400000).toISOString();
  const [
    registered,
    recent,
    activities,
    allActivities,
    groups,
    pendingMembers,
    pendingProviders,
    approvedProviders,
    pendingBookings,
    reports,
    contacts,
    logs,
  ] = await Promise.all([
    count(db.from("profiles").select("id", { count: "exact", head: true })),
    count(
      db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since)
        .lte("created_at", end),
    ),
    count(
      db
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .gte("date_time", end),
    ),
    count(db.from("sessions").select("id", { count: "exact", head: true })),
    count(db.from("groups").select("id", { count: "exact", head: true })),
    count(
      db
        .from("verification_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ),
    count(
      db
        .from("providers")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ),
    count(
      db
        .from("providers")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
    ),
    count(
      db
        .from("provider_bookings")
        .select("id", { count: "exact", head: true })
        .eq("confirmed", false)
        .gte("booking_time", end),
    ),
    count(
      db
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("resolved", false),
    ),
    count(
      db.from("contact_requests").select("id", { count: "exact", head: true }),
    ),
    readAllPages<{ user_id: string }>((from, to) =>
      db
        .from("activity_logs")
        .select("user_id", { count: "exact" })
        .gte("created_at", since)
        .lte("created_at", end)
        .order("id")
        .range(from, to),
    ),
  ]);
  return {
    registered,
    recent,
    activities,
    allActivities,
    groups,
    pendingMembers,
    pendingProviders,
    approvedProviders,
    pendingBookings,
    reports,
    contacts,
    active: new Set(logs.map((log) => log.user_id)).size,
    updatedAt: end,
  };
}

export async function loadAdminMembers(
  db: SupabaseClient,
  page: number,
  search: string,
) {
  const access = await db.rpc("is_admin");
  if (access.error || access.data !== true)
    throw new Error("Administrator access required");
  let query = db
    .from("profiles")
    .select("id,name,created_at", { count: "exact" });
  // Literal name search; wildcard characters are not treated as broad filters.
  if (search.trim())
    query = query.ilike(
      "name",
      `%${search.trim().replace(/[\\%_]/g, "\\$&")}%`,
    );
  const result = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range(page * 20, page * 20 + 19);
  if (result.error) throw new Error(result.error.message);
  if (result.count === null) throw new Error("Could not load member count.");
  return {
    rows: result.data as { id: string; name: string; created_at: string }[],
    total: result.count,
  };
}

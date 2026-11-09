import { getSupabase } from "./supabase/client";
async function data<T>(
  request: PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T> {
  const r = await request;
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}
export type MemberProfile = {
  id: string;
  name: string;
  avatar: number;
  bio: string;
  interests: string[];
  availability: string[];
  goal: string;
  created_at: string;
};
export type AdminLog = {
  id: number;
  user_id: string;
  activity_type: string;
  related_id: number;
  created_at: string;
};
export type MemberActivity = {
  id: number;
  title: string;
  date_time: string;
  program_type: string;
};
export async function requireAdmin() {
  const r = await getSupabase().rpc("is_admin");
  if (r.error || r.data !== true)
    throw new Error("Administrator access required");
}
export async function memberDetails(id: string) {
  await requireAdmin();
  const db = getSupabase();
  const [profile, groups, created, joined, logs, suspension] =
    await Promise.all([
      data<MemberProfile>(
        db
          .from("profiles")
          .select("id,name,avatar,bio,interests,availability,goal,created_at")
          .eq("id", id)
          .single(),
      ),
      data<{ group_id: number; groups: { name: string; slug: string } }[]>(
        db
          .from("group_members")
          .select("group_id,groups(name,slug)")
          .eq("user_id", id)
          .limit(100),
      ),
      data<MemberActivity[]>(
        db
          .from("sessions")
          .select("id,title,date_time,program_type")
          .eq("creator", id)
          .order("date_time", { ascending: false })
          .limit(50),
      ),
      data<{ sessions: MemberActivity }[]>(
        db
          .from("session_members")
          .select("session_id,sessions(id,title,date_time,program_type)")
          .eq("user_id", id)
          .limit(50),
      ),
      data<AdminLog[]>(
        db
          .from("activity_logs")
          .select("id,user_id,activity_type,related_id,created_at")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(50),
      ),
      data<{ reason: string; suspended_at: string } | null>(
        db
          .from("account_suspensions")
          .select("reason,suspended_at")
          .eq("user_id", id)
          .maybeSingle(),
      ),
    ]);
  return { profile, groups, created, joined, logs, suspension };
}
export const activityLabels: Record<string, string> = {
  sessionCreated: "Activity created",
  sessionJoined: "Activity joined",
  sessionLeft: "Activity left",
  taskCreated: "Task created",
  taskCompleted: "Task completed",
  providerBooked: "Care requested",
};
export async function adminActivityLog() {
  await requireAdmin();
  const db = getSupabase();
  const logs = await data<AdminLog[]>(
    db
      .from("activity_logs")
      .select("id,user_id,activity_type,related_id,created_at")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(200),
  );
  if (!logs.length) return [];
  const ids = [...new Set(logs.map((l) => l.user_id))];
  const sessionIds = [
    ...new Set(
      logs
        .filter((l) => l.activity_type.startsWith("session"))
        .map((l) => l.related_id),
    ),
  ];
  const taskIds = [
    ...new Set(
      logs
        .filter((l) => l.activity_type.startsWith("task"))
        .map((l) => l.related_id),
    ),
  ];
  const [profiles, sessions, tasks] = await Promise.all([
    data<{ id: string; name: string }[]>(
      db.from("profiles").select("id,name").in("id", ids),
    ),
    sessionIds.length
      ? data<{ id: number; title: string }[]>(
          db.from("sessions").select("id,title").in("id", sessionIds),
        )
      : [],
    taskIds.length
      ? data<{ id: number; title: string }[]>(
          db.from("tasks").select("id,title").in("id", taskIds),
        )
      : [],
  ]);
  return logs.map((l) => ({
    ...l,
    name:
      profiles.find((p) => p.id === l.user_id)?.name || "Profile not completed",
    related: l.activity_type.startsWith("session")
      ? sessions.find((s) => s.id === l.related_id)?.title ||
        `Deleted activity #${l.related_id}`
      : l.activity_type.startsWith("task")
        ? tasks.find((t) => t.id === l.related_id)?.title ||
          `Deleted task #${l.related_id}`
        : `Care request #${l.related_id}`,
  }));
}

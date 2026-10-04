"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGroup, useCommunityAction } from "@/hooks/useCommunity";
import { ConversationFeed } from "@/components/ConversationFeed";
import { GroupIcon } from "@/components/GroupIcon";
import { toast } from "sonner";
import { getCategory } from "@/lib/groupCategories";

export function GroupDetailPage() {
  const { topic } = useParams<{ topic: string }>();
  const group = useGroup(topic);
  const action = useCommunityAction();
  const joined = group.data?.joined ?? false;

  if (group.isPending)
    return (
      <div className="hub-page" role="status">
        Loading group…
      </div>
    );
  if (group.error)
    return (
      <div className="hub-page" role="alert">
        <p>{group.error.message}</p>
        <button onClick={() => group.refetch()}>Retry</button>
      </div>
    );
  if (!group.data)
    return (
      <div className="hub-page">
        <h1>Group not found.</h1>
        <Link href="/groups">Explore all groups</Link>
      </div>
    );

  const current = group.data;
  return (
    <div className="hub-page">
      <Link className="text-action" href={`/groups?category=${current.category}`}>
        ← {getCategory(current.category).name} / All subgroups
      </Link>
      <header className="group-detail-heading">
        <div className="group-detail-icon">
          <GroupIcon topic={current.slug} label={current.name} />
        </div>
        <div>
          <span className="eyebrow">
            {getCategory(current.category).name} · SUBGROUP
          </span>
          <h1>{current.name}</h1>
          <p>{current.description}</p>
          <small>{current.member_count} members</small>
        </div>
        <button
          className={`wellness-button ${joined ? "light" : ""}`}
          disabled={action.isPending}
          onClick={async () => {
            try {
              await action.mutateAsync({
                name: "toggle_group",
                args: { p_group: current.id, p_join: !joined },
              });
              toast.success(
                joined ? "You left the group." : "Welcome to the group!",
              );
            } catch (e) {
              toast.error(
                e instanceof Error ? e.message : "Please try again",
              );
            }
          }}
        >
          {action.isPending
            ? "Saving…"
            : joined
              ? "Leave group"
              : "Join this group"}
        </button>
      </header>
      <ConversationFeed key={current.id} group={current.id} canPost={joined} />
    </div>
  );
}
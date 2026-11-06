"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGroups, useCommunityAction } from "@/hooks/useCommunity";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ConversationFeed } from "@/components/ConversationFeed";
import { GroupIcon } from "@/components/GroupIcon";
import { toast } from "sonner";
import { getCategory } from "@/lib/groupCategories";
export function GroupDetailPage() {
  const { topic } = useParams<{ topic: string }>();
  const groups = useGroups();
  const action = useCommunityAction();
  const { user, login } = useInternetIdentity();
  const group = groups.data?.find((g) => g.slug === topic);
  const joined =
    group?.group_members.some((m) => m.user_id === user?.id) ?? false;
  if (groups.isPending)
    return (
      <div className="hub-page" role="status">
        Loading group…
      </div>
    );
  if (groups.error)
    return (
      <div className="hub-page" role="alert">
        <p>{groups.error.message}</p>
        <button onClick={() => groups.refetch()}>Retry</button>
      </div>
    );
  if (!group)
    return (
      <div className="hub-page">
        <h1>Group not found.</h1>
        <Link href="/groups">Explore all groups</Link>
      </div>
    );
  return (
    <div className="hub-page">
      <Link className="text-action" href={`/groups?category=${group.category}`}>
        ← {getCategory(group.category).name} / All subgroups
      </Link>
      <header className="group-detail-heading">
        <div className="group-detail-icon">
          <GroupIcon topic={group.slug} label={group.name} />
        </div>
        <div>
          <span className="eyebrow">
            {getCategory(group.category).name} · SUBGROUP
          </span>
          <h1>{group.name}</h1>
          <p>{group.description}</p>
          <small>
            {group.member_count ?? group.group_members.length} members
          </small>
        </div>
        <button
          className={`wellness-button ${joined ? "light" : ""}`}
          disabled={action.isPending}
          onClick={async () => {
            if (!user) {
              login();
              return;
            }
            try {
              await action.mutateAsync({
                name: "toggle_group",
                args: { p_group: group.id, p_join: !joined },
              });
              toast.success(
                joined ? "You left the group." : "Welcome to the group!",
              );
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Please try again");
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
      {user ? (
        <ConversationFeed key={group.id} group={group.id} canPost={joined} />
      ) : (
        <section className="empty-state">
          <h2>Find your people. Join the conversation.</h2>
          <p>
            Sign in to join this group and take part. Member conversations stay
            inside the community.
          </p>
          <button className="wellness-button" onClick={login}>
            Sign in to chat
          </button>
        </section>
      )}
    </div>
  );
}

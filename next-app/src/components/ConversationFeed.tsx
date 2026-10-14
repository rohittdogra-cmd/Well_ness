"use client";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Flag,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFeed, useCommunityAction, type Post } from "@/hooks/useCommunity";
import { toast } from "sonner";
import { useCrisisDetection, CrisisOverlay } from "@/components/CrisisOverlay";
export function ConversationFeed({
  group = null,
  canPost = true,
}: {
  group?: number | null;
  canPost?: boolean;
}) {
  const feed = useFeed(group);
  const action = useCommunityAction();
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const { showOverlay, checkText, dismissOverlay } = useCrisisDetection();
  async function publish(e: React.FormEvent) {
    e.preventDefault();
    try {
      await action.mutateAsync({
        name: "publish_post",
        args: { p_body: body, p_group: group, p_anonymous: anonymous },
      });
      setBody("");
      toast.success("Your conversation is posted.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not post. Please try again.",
      );
    }
  }
  return (
    <div className="conversation-feed">
      <CrisisOverlay show={showOverlay} onDismiss={dismissOverlay} />
      {canPost ? (
        <form className="composer" onSubmit={publish}>
          <label htmlFor="new-post">What’s on your mind?</label>
          <textarea
            id="new-post"
            placeholder="Share a small win, ask a question, or start a conversation…"
            value={body}
            onChange={(e) => { setBody(e.target.value); checkText(e.target.value); }}
            maxLength={3000}
            rows={4}
            required
          />
          <div className="composer-actions">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              Use an anonymous alias
            </label>
            <span className="muted">{body.length}/3000</span>
            <button
              className="wellness-button"
              disabled={action.isPending || !body.trim()}
            >
              <Send size={16} />
              {action.isPending ? "Posting…" : "Post"}
            </button>
          </div>
          {anonymous && (
            <p className="privacy-note">
              Your name is hidden from the community. Moderators can trace
              reported content to an account.
            </p>
          )}
        </form>
      ) : (
        <div className="empty-state">
          Join this group to start a conversation or reply.
        </div>
      )}
      <div className="feed-heading">
        <h2>Conversations</h2>
        <button
          className="text-action"
          onClick={() => feed.refresh()}
          disabled={feed.isRefreshing}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
      {feed.isPending ? (
        <div className="empty-state" role="status">
          Loading conversations…
        </div>
      ) : feed.isError ? (
        <div className="empty-state" role="alert">
          <p>{feed.error.message}</p>
          <button className="text-action" onClick={() => feed.refresh()}>
            Try again
          </button>
        </div>
      ) : !feed.data.pages.flat().length ? (
        <div className="empty-state">
          <MessageCircle size={28} />
          <h3>A good conversation starts with you.</h3>
          <p>Share the first thought in this space.</p>
        </div>
      ) : (
        feed.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            group={group}
            canPost={canPost}
            onCrisisCheck={checkText}
          />
        ))
      )}
      {feed.hasNextPage && (
        <button
          className="wellness-button light"
          disabled={feed.isFetchingNextPage}
          onClick={() => feed.fetchNextPage()}
        >
          Load older conversations
        </button>
      )}
      <p className="privacy-note">
        Conversations refresh every 15 seconds while you’re here. Be kind and
        avoid sharing someone else’s private information.
      </p>
    </div>
  );
}
function PostCard({
  post,
  group,
  canPost,
  onCrisisCheck,
}: {
  post: Post;
  group: number | null;
  canPost: boolean;
  onCrisisCheck?: (text: string) => void;
}) {
  const action = useCommunityAction();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [report, setReport] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  async function run(name: string, args: Record<string, unknown>) {
    try {
      await action.mutateAsync({ name, args });
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Please try again.");
      return false;
    }
  }
  return (
    <article className="post-card">
      <header>
        <div className="post-avatar">{post.alias.slice(0, 1)}</div>
        <div>
          <strong>{post.alias}</strong>
          <small>
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
            })}
            {post.anonymous ? " · Anonymous" : ""}
          </small>
        </div>
        <div className="post-tools">
          {post.mine ? (
            <button
              aria-label="Delete post"
              onClick={() => {
                if (window.confirm("Delete this conversation and its replies?"))
                  void run("delete_post", { p_post: post.id });
              }}
              disabled={action.isPending}
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <button aria-label="Report post" onClick={() => setReport(post.id)}>
              <Flag size={16} />
            </button>
          )}
        </div>
      </header>
      <p className="post-body">{post.body}</p>
      <div className="post-actions">
        <button
          aria-pressed={post.liked}
          disabled={action.isPending}
          onClick={() =>
            run("react_post", { p_post: post.id, p_like: !post.liked })
          }
        >
          <Heart size={17} fill={post.liked ? "currentColor" : "none"} />
          {post.likes} <span>appreciations</span>
        </button>
        <button aria-expanded={open} onClick={() => setOpen(!open)}>
          <MessageCircle size={17} />
          {post.replies.length} replies
        </button>
      </div>
      {open && (
        <div className="replies">
          {post.replies.map((r) => (
            <div className="reply" key={r.id}>
              <div className="reply-meta">
                <strong>{r.alias}</strong>
                {r.mine ? (
                  <button
                    aria-label="Delete reply"
                    onClick={() => {
                      if (window.confirm("Delete this reply?"))
                        void run("delete_post", { p_post: r.id });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <button
                    aria-label="Report reply"
                    onClick={() => setReport(r.id)}
                  >
                    <Flag size={14} />
                  </button>
                )}
              </div>
              <p>{r.body}</p>
              <small>
                {formatDistanceToNow(new Date(r.created_at), {
                  addSuffix: true,
                })}
              </small>
            </div>
          ))}
          {canPost && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await run("publish_post", {
                    p_body: reply,
                    p_group: group,
                    p_parent: post.id,
                    p_anonymous: post.anonymous,
                  })
                )
                  setReply("");
              }}
            >
              <label className="field-label" htmlFor={`reply-${post.id}`}>
                Your reply{post.anonymous ? " · anonymous alias" : ""}
              </label>
              <textarea
                id={`reply-${post.id}`}
                maxLength={3000}
                required
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  onCrisisCheck?.(e.target.value);
                }}
                rows={2}
              />
              <button
                className="wellness-button"
                disabled={action.isPending || !reply.trim()}
              >
                Reply
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      )}
      {report !== null && (
        <form
          className="report-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await run("report_post", { p_post: report, p_reason: reason })
            ) {
              setReport(null);
              setReason("");
              toast.success("Report sent to the moderation team.");
            }
          }}
        >
          <label htmlFor={`report-${post.id}`}>
            What should the moderators know?
          </label>
          <textarea
            id={`report-${post.id}`}
            required
            minLength={5}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="composer-actions">
            <button
              type="button"
              className="text-action"
              onClick={() => setReport(null)}
            >
              Cancel
            </button>
            <button className="wellness-button" disabled={action.isPending}>
              Submit report
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

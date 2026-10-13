"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGroup, useCommunityAction } from "@/hooks/useCommunity";
import { ConversationFeed } from "@/components/ConversationFeed";
import { GroupIcon } from "@/components/GroupIcon";
import { toast } from "sonner";
import { getCategory } from "@/lib/groupCategories";
import Image from "next/image";
import { Users, Share2, Check, Sparkles, MessageCircle } from "lucide-react";

export function GroupDetailPage() {
  const { topic } = useParams<{ topic: string }>();
  const group = useGroup(topic);
  const action = useCommunityAction();
  const joined = group.data?.joined ?? false;
  const [copied, setCopied] = useState(false);

  if (group.isPending)
    return (
      <div className="hub-page" role="status" style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--teal-700)", fontWeight: 600 }}>Loading subgroup…</p>
      </div>
    );
  if (group.error)
    return (
      <div className="hub-page" role="alert" style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "#e11d48", fontWeight: 600 }}>{group.error.message}</p>
        <button
          className="wellness-button"
          style={{ marginTop: "16px" }}
          onClick={() => group.refetch()}
        >
          Retry
        </button>
      </div>
    );
  if (!group.data)
    return (
      <div className="hub-page" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Subgroup not found</h1>
        <Link className="wellness-button" href="/groups">
          Explore all groups
        </Link>
      </div>
    );

  const current = group.data;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Subgroup link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="hub-page" style={{ maxWidth: "1080px", margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          className="text-action"
          href={`/groups?category=${current.category}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 650,
            color: "var(--teal-700)",
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: "9999px",
            background: "rgba(15, 118, 110, 0.08)",
          }}
        >
          ← {getCategory(current.category).name} / All subgroups
        </Link>
      </div>

      <header
        className="group-detail-heading"
        style={{
          background: "linear-gradient(145deg, #ffffff 0%, #f7fcfa 100%)",
          border: "1px solid rgba(13, 148, 136, 0.16)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 10px 30px -10px rgba(13, 148, 136, 0.08)",
          marginBottom: "28px",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flex: "1 1 500px" }}>
          <div
            className="group-detail-icon"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(13, 148, 136, 0.15)",
            }}
          >
            <GroupIcon topic={current.slug} label={current.name} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "#0f766e",
                  background: "rgba(15, 118, 110, 0.1)",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                }}
              >
                {getCategory(current.category).name} · CIRCLE
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                <Users size={13} color="#0d9488" /> {current.member_count} members
              </span>
            </div>

            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: "0 0 8px",
                color: "#132e2b",
              }}
            >
              {current.name}
            </h1>

            <p style={{ margin: 0, color: "#475569", fontSize: "15px", lineHeight: 1.55, maxWidth: "600px" }}>
              {current.description}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleShare}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "11px 18px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              fontWeight: 650,
              color: "#334155",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {copied ? <Check size={15} color="#059669" /> : <Share2 size={15} />}
            {copied ? "Link Copied" : "Share"}
          </button>

          <button
            className={`wellness-button shine-btn ${joined ? "light" : ""}`}
            style={{
              padding: "11px 22px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: action.isPending ? "not-allowed" : "pointer",
            }}
            disabled={action.isPending}
            onClick={async () => {
              try {
                await action.mutateAsync({
                  name: "toggle_group",
                  args: { p_group: current.id, p_join: !joined },
                });
                toast.success(
                  joined ? "Enrollment removed from circle." : "Enrolled in circle successfully!",
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
                ? "Remove from circle"
                : "Enroll in circle"}
          </button>
        </div>
      </header>

      {(current as any).image && (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "260px",
            marginBottom: "28px",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Image
            src={(current as any).image}
            alt={current.name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      )}

      <div style={{ marginTop: "12px" }}>
        <ConversationFeed key={current.id} group={current.id} canPost={joined} />
      </div>
    </div>
  );
}
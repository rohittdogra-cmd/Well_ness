"use client";

import Link from "next/link";
import { CommunityLiveBoard } from "@/components/CommunityLiveBoard";
import { MessageCircle, CalendarDays, Heart, Shield } from "lucide-react";

export function CommunityPage() {
  return (
    <div className="hub-page">
      <header className="page-heading" style={{ maxWidth: "1100px", margin: "0 auto 24px" }}>
        <span className="eyebrow" style={{ color: "var(--teal-700, #0f766e)", fontWeight: 700, letterSpacing: "0.06em" }}>
          STRESS UNWIND · COMMUNITY &amp; POST ACTIVITIES
        </span>
        <h1 style={{ fontSize: "2.4rem", margin: "8px 0 12px", letterSpacing: "-0.03em" }}>
          Post thoughts, meet peers, and text directly.
        </h1>
        <p style={{ maxWidth: "680px", color: "var(--sand-800, #475569)", fontSize: "15px", lineHeight: 1.6 }}>
          Post spontaneous activities or thoughts, connect with colleagues and fellow members, and message them directly to talk ahead and unwind together.
        </p>

        <div className="page-links" style={{ marginTop: "16px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <Link href="/book-activities" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
            <CalendarDays size={15} /> Book Group Activities ↗
          </Link>
          <Link href="/groups" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
            <MessageCircle size={15} /> Explore Circles &amp; Groups ↗
          </Link>
          <Link href="/therapy" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
            <Heart size={15} /> Professional Support ↗
          </Link>
        </div>
      </header>

      <CommunityLiveBoard />
    </div>
  );
}

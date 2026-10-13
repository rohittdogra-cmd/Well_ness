"use client";

import Link from "next/link";
import { CommunityLiveBoard } from "@/components/CommunityLiveBoard";
import { CalendarDays, Heart, Sparkles, ShieldCheck, Users, ArrowRight } from "lucide-react";

export function CommunityPage() {
  return (
    <div className="hub-page">
      {/* Streamlined, high-conversion top header for mobile & desktop */}
      <header
        className="page-heading-elevated"
        style={{
          maxWidth: "1100px",
          margin: "0 auto 20px",
          padding: "20px 24px",
          borderRadius: "20px",
          background: "linear-gradient(145deg, #ffffff 0%, #f4fbf9 100%)",
          border: "1px solid rgba(13, 148, 136, 0.16)",
          boxShadow: "0 6px 20px -8px rgba(13, 148, 136, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "9999px",
                background: "rgba(15, 118, 110, 0.1)",
                color: "#0f766e",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              <Sparkles size={13} /> LIVE PEER COMMUNITY &amp; MEETUPS
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 9px",
                borderRadius: "9999px",
                background: "rgba(16, 185, 129, 0.1)",
                color: "#047857",
                fontSize: "11px",
                fontWeight: 650,
              }}
            >
              <ShieldCheck size={13} /> 100% Employer Blind
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              margin: "0 0 6px",
              letterSpacing: "-0.03em",
              lineHeight: 1.22,
              color: "#132e2b",
              fontWeight: 800,
            }}
          >
            Spontaneous Meetups, Peer Circles &amp;{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Direct Talks.
            </span>
          </h1>

          <p
            style={{
              maxWidth: "680px",
              color: "#64748b",
              fontSize: "13.5px",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Find colleagues and peers nearby for spontaneous coffee breaks, weekend sports, or confidential talks.
          </p>
        </div>
      </header>

      {/* Main Interactive Live Board & Posts */}
      <CommunityLiveBoard />

      {/* Bottom Section: Explanatory Info & Additional Conversion Options */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "40px auto 30px",
          padding: "28px 24px",
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px -4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#0d9488",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Explore More Wellbeing Options
          </span>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
            More Ways to Connect and Unwind
          </h2>
          <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
            Looking for structured programs or professional support? Choose an option below.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "14px",
          }}
        >
          <Link
            href="/book-activities"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(13, 148, 136, 0.12)",
                color: "#0d9488",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CalendarDays size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700, color: "#0f766e", marginBottom: "4px" }}>
                Book Group Activities <ArrowRight size={14} />
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.45 }}>
                Join scheduled sports, nature walks, mindfulness workshops, and board game nights.
              </div>
            </div>
          </Link>

          <Link
            href="/groups"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(37, 99, 235, 0.12)",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700, color: "#1e40af", marginBottom: "4px" }}>
                Explore Circles &amp; Groups <ArrowRight size={14} />
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.45 }}>
                Find interest-based communities for tech, startups, parenting, mindfulness, and book clubs.
              </div>
            </div>
          </Link>

          <Link
            href="/therapy"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(225, 29, 72, 0.12)",
                color: "#e11d48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Heart size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700, color: "#be123c", marginBottom: "4px" }}>
                Licensed Therapy Support <ArrowRight size={14} />
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.45 }}>
                1-on-1 confidential sessions with RCI-certified psychologists. Fully employer-blind.
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

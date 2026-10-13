import Link from "next/link";

/**
 * Custom 404 Error Page.
 *
 * Rendered by Next.js server with HTTP 404 status.
 * Provides high-converting discovery links back to badminton bookings,
 * active topic groups, clinical care, and 24/7 mental health emergency helplines.
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        background: "radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08), transparent 70%)",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          width: "100%",
          textAlign: "center",
          background: "var(--surface-soft)",
          border: "1px solid var(--line)",
          borderRadius: "24px",
          padding: "clamp(32px, 5vw, 56px) clamp(20px, 4vw, 48px)",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.12)",
            color: "#10b981",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "20px",
            border: "1px solid rgba(16, 185, 129, 0.25)",
          }}
        >
          🏸 404 · Shuttle Out of Bounds
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "var(--text-strong)",
            margin: "0 0 16px",
          }}
        >
          This court doesn&apos;t seem to exist.
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            lineHeight: 1.6,
            color: "var(--text-muted)",
            maxWidth: "560px",
            margin: "0 auto 36px",
          }}
        >
          The match link may have expired, the venue rotated courts, or the URL was mistyped.
          Don&apos;t sweat it — there are dozens of active games and wellness pods happening right now.
        </p>

        {/* Quick Action Destinations */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            textAlign: "left",
            marginBottom: "36px",
          }}
        >
          <Link
            href="/programs/badminton"
            style={{
              display: "block",
              padding: "18px 20px",
              background: "var(--surface-raised)",
              border: "1px solid var(--line)",
              borderRadius: "16px",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏸</div>
            <strong style={{ display: "block", color: "var(--text-strong)", fontSize: "15px", marginBottom: "4px" }}>
              Book Badminton Turfs
            </strong>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Match with peers across Janakpuri, Cyber Hub, Sec 54 &amp; Noida.
            </span>
          </Link>

          <Link
            href="/groups"
            style={{
              display: "block",
              padding: "18px 20px",
              background: "var(--surface-raised)",
              border: "1px solid var(--line)",
              borderRadius: "16px",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
            <strong style={{ display: "block", color: "var(--text-strong)", fontSize: "15px", marginBottom: "4px" }}>
              Explore 60+ Subgroups
            </strong>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Cricket, weekend treks, Cyber Hub cafes, gaming &amp; wellness circles.
            </span>
          </Link>

          <Link
            href="/therapy"
            style={{
              display: "block",
              padding: "18px 20px",
              background: "var(--surface-raised)",
              border: "1px solid var(--line)",
              borderRadius: "16px",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🩺</div>
            <strong style={{ display: "block", color: "var(--text-strong)", fontSize: "15px", marginBottom: "4px" }}>
              Licensed Psychologists
            </strong>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              100% employer-blind private doctor cabins for burnout &amp; stress.
            </span>
          </Link>

          <Link
            href="/take-a-moment"
            style={{
              display: "block",
              padding: "18px 20px",
              background: "var(--surface-raised)",
              border: "1px solid var(--line)",
              borderRadius: "16px",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🧘</div>
            <strong style={{ display: "block", color: "var(--text-strong)", fontSize: "15px", marginBottom: "4px" }}>
              Take a 2-Minute Pause
            </strong>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Calming guided breathing exercise to reset your nervous system.
            </span>
          </Link>
        </div>

        {/* Primary Navigation Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <Link
            href="/"
            className="wellness-button"
            style={{
              padding: "12px 28px",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Return to Home Hub
          </Link>
          <Link
            href="/contact"
            className="text-action"
            style={{
              padding: "12px 20px",
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            Report Missing Link / Concierge →
          </Link>
        </div>

        {/* 24/7 Crisis Support Bar */}
        <div
          style={{
            padding: "12px 20px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            fontSize: "13px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span>🆘 In distress or need urgent clinical support?</span>
          <span style={{ fontWeight: 600, color: "#ef4444" }}>
            24/7 National Toll-Free: Tele-MANAS (14416) | KIRAN (1800-599-0019)
          </span>
        </div>
      </div>
    </div>
  );
}
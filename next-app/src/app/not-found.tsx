import Link from "next/link";

/**
 * 404 boundary.
 *
 * Unlike the client-side "not found" states inside the app, this is rendered by
 * the server and answers with a real HTTP 404, so crawlers and monitoring treat
 * an unknown URL as an unknown URL rather than as a valid page.
 */
export default function NotFound() {
  return (
    <div className="wellness-shell">
      <div className="auth-loading">
        <div style={{ maxWidth: 560, padding: "0 24px" }}>
          <span className="eyebrow">404</span>
          <h1>That page isn&apos;t here.</h1>
          <p>
            The link may be out of date, or the group, session or program it
            pointed to has been removed.
          </p>
          <div className="composer-actions">
            <Link className="wellness-button" href="/">
              Back to your hub
            </Link>
            <Link className="text-action" href="/groups">
              Browse groups
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
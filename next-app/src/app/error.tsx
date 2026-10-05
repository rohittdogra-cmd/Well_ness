"use client";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * Next.js renders this when a client component below the root layout throws, so
 * a single broken view degrades into a recoverable message instead of the
 * default full-page exception. The boundary is scoped per segment; this one
 * wraps every route in the app.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="wellness-shell">
      <div className="auth-loading" role="alert">
        <div style={{ maxWidth: 560, padding: "0 24px" }}>
          <span className="eyebrow">SOMETHING WENT WRONG</span>
          <h1>That didn&apos;t load.</h1>
          <p>
            The page hit an unexpected error. Your account and data are fine.
          </p>
          {error.digest ? (
            <p>
              <small>Reference: {error.digest}</small>
            </p>
          ) : null}
          <div className="composer-actions">
            <button className="wellness-button" onClick={reset}>
              Try again
            </button>
            <Link className="text-action" href="/">
              Back to your hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
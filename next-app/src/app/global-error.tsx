"use client";

/**
 * Last-resort boundary.
 *
 * This replaces the root layout, so it must render its own `<html>` and
 * `<body>`. It only runs when a failure escapes `app/error.tsx` — for example a
 * crash inside the layout itself — and deliberately hard-reloads rather than
 * calling `reset()`, because the broken tree is still mounted.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#faf9f5",
          color: "#293e33",
        }}
      >
        <main style={{ maxWidth: 520, padding: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>
            The hub could not start.
          </h1>
          <p style={{ lineHeight: 1.6 }}>
            Something failed while rendering the application shell. Reloading
            usually clears it.
          </p>
          {error.digest ? (
            <p style={{ opacity: 0.6, fontSize: 14 }}>Reference: {error.digest}</p>
          ) : null}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 20px",
                borderRadius: 999,
                border: "none",
                background: "#293e33",
                color: "#fff",
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Reload the page
            </button>
            <a href="/signin" style={{ padding: "12px 4px", color: "#293e33" }}>
              Go to sign in
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
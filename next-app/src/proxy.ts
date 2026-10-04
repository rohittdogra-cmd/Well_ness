import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isConfigured, supabaseOrigin, supabaseConfig } from "@/lib/env";
import { isPrivatePath } from "@/lib/routes";

/**
 * Content Security Policy.
 *
 * `unsafe-inline` is required for Next's own bootstrap scripts. `unsafe-eval`
 * is only needed by the dev compiler, so it is dropped from production builds —
 * that is the difference between a policy that documents intent and one that
 * actually blocks injected script.
 *
 * `connect-src` and `img-src` are built from the configured Supabase origin, so
 * the policy always matches the project this deployment points at, including a
 * local endpoint used by the browser tests.
 */
function contentSecurityPolicy() {
  const origin = supabaseOrigin();
  const connect = origin
    ? ["'self'", origin, "wss://*.supabase.co"]
    : ["'self'", "https://*.supabase.co", "wss://*.supabase.co"];
  // `api.dicebear.com` serves the generated avatars used across the UI.
  const images = [
    "'self'",
    "data:",
    "blob:",
    origin || "https://*.supabase.co",
    "https://api.dicebear.com",
  ];
  const production = process.env.NODE_ENV === "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${images.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connect.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    // Production only: this would rewrite a loopback test origin to https.
    ...(production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "X-DNS-Prefetch-Control": "on",
};

/**
 * Refreshes the Supabase session and applies per-route response policy.
 *
 * Cookie refresh has to happen here: it is the only place that can write
 * cookies during a normal page load, and skipping it lets an access token
 * expire mid-session.
 *
 * Caching is deliberately *not* blanket. An earlier version applied
 * `Cache-Control: private, no-store` to every response, which also suppressed
 * caching for the sitemap, robots.txt and the public marketing pages. Only the
 * signed-in routes render per-person data and are therefore uncacheable.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (isConfigured()) {
    const supabase = createServerClient(supabaseConfig.url, supabaseConfig.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          for (const { name, value } of values) request.cookies.set(name, value);
          // Rebuild the response so refreshed cookies are forwarded to the
          // browser rather than only being visible to this render.
          response = NextResponse.next({ request });
          for (const { name, value, options } of values)
            response.cookies.set(name, value, options);
        },
      },
    });

    try {
      // Validates the JWT and triggers the refresh above when it is stale.
      await supabase.auth.getClaims();
    } catch {
      // A malformed or expired token must not take the route down: the client
      // treats it as signed out and redirects to /signin.
    }
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS))
    response.headers.set(key, value);
  response.headers.set("Content-Security-Policy", contentSecurityPolicy());

  if (isPrivatePath(request.nextUrl.pathname))
    response.headers.set("Cache-Control", "private, no-store");

  if (request.nextUrl.pathname.startsWith("/auth/")) {
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: [
    // Static assets and crawler endpoints never need a session refresh.
    "/((?!_next/static|_next/image|favicon.ico|images/|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
};
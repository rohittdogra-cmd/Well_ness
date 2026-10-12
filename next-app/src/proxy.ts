import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isConfigured, supabaseOrigin, supabaseConfig } from "@/lib/env";
import { isPrivatePath } from "@/lib/routes";

/**
 * Content Security Policy.
 *
 * `unsafe-inline` is required for Next's own bootstrap scripts. `unsafe-eval`
 * is only needed by the dev compiler, so it is dropped from production builds.
 *
 * A per-request nonce (`script-src 'nonce-…' 'strict-dynamic'`) is the stronger
 * option and it works in `next dev`, but it does **not** work here: the public
 * pages are statically prerendered, so their HTML is written once at build time
 * and served from the CDN. Next can only stamp a nonce into a document it
 * generates during the request, so a prerendered page arrives with no nonce on
 * its scripts while this header demands one — every script is blocked and the
 * page renders blank. Forcing the pages dynamic would fix it at the cost of a
 * server render per request. So: `unsafe-inline` until the routes are dynamic.
 *
 * Styles need `unsafe-inline` regardless: Tailwind's arbitrary values and the
 * animation styles injected by `motion` are inline `style` attributes.
 *
 * The rest of the policy still holds — no plugins, no framing, no base-tag
 * hijack, forms restricted to this origin, and a self-only default.
 *
 * `connect-src` and `img-src` are built from the configured Supabase origin, so
 * the policy always matches the project this deployment points at, including a
 * local endpoint used by the browser tests.
 */
function contentSecurityPolicy() {
  const origin = supabaseOrigin();
  const production = process.env.NODE_ENV === "production";
  const connect = origin
    ? ["'self'", origin, "wss://*.supabase.co"]
    : ["'self'", "https://*.supabase.co", "wss://*.supabase.co"];
  if (!production) {
    connect.push("ws:", "wss:", "http:", "https:");
  }
  // `api.dicebear.com` serves the generated avatars used across the UI.
  // `images.unsplash.com` serves doctor/specialist and group profile images.
  const images = [
    "'self'",
    "data:",
    "blob:",
    origin || "https://*.supabase.co",
    "https://api.dicebear.com",
    "https://images.unsplash.com",
  ];
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${images.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connect.join(" ")}`,
    production ? "frame-ancestors 'none'" : "frame-ancestors *",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    // Production only: this would rewrite a loopback test origin to https.
    ...(production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  ...(process.env.NODE_ENV === "production" ? { "X-Frame-Options": "DENY" } : {}),
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
/**
 * `/sessions/<id>` can only ever be a bigint, so anything else is a confident
 * "no such page". Answering here rather than in the page matters: once a
 * dynamic render starts streaming the status code is already committed, so
 * `notFound()` inside a page renders the right screen but still returns 200.
 * Well-formed ids that turn out to be missing keep that behaviour.
 */
function impossiblePath(pathname: string): boolean {
  const session = pathname.match(/^\/sessions\/([^/]+)\/?$/);
  return Boolean(session && !/^\d+$/.test(session[1]));
}

export async function proxy(request: NextRequest) {
  if (impossiblePath(request.nextUrl.pathname))
    return new NextResponse("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain" },
    });

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
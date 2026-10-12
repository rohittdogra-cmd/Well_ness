import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isConfigured, supabaseOrigin, supabaseConfig } from "@/lib/env";
import { isPrivatePath } from "@/lib/routes";

/**
 * Content Security Policy.
 *
 * Scripts are allowed by per-request nonce rather than `unsafe-inline`, so a
 * stored-XSS payload injected into the database has no way to become a running
 * script. Next reads the nonce from the `x-nonce` request header and stamps it
 * on the bootstrap scripts it emits, so it has to be set on the *request*
 * before `NextResponse.next` is built. `strict-dynamic` lets the scripts Next
 * inject load their own chunks without every chunk path needing to be listed.
 *
 * `'self'` stays in the list for browsers that predate `strict-dynamic`, which
 * is the same reason the nonces are random per request rather than fixed.
 *
 * Styles still need `unsafe-inline`: Tailwind's arbitrary values and the
 * animation styles injected by `motion` are inline `style` attributes, and
 * there is no equivalent nonce mechanism for them.
 *
 * `connect-src` and `img-src` are built from the configured Supabase origin, so
 * the policy always matches the project this deployment points at, including a
 * local endpoint used by the browser tests.
 */
function contentSecurityPolicy(nonce: string) {
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
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      production ? "" : " 'unsafe-eval'"
    }`,
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

/** A fresh 128-bit nonce, base64 encoded, for one request. */
function createNonce() {
  return btoa(crypto.randomUUID());
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

  const nonce = createNonce();
  // Forwarded on the request so Next can put this nonce on the scripts it
  // injects into the HTML. Set after the 404 early-return so that response
  // stays a plain text body.
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);

  let response = NextResponse.next({ request: { headers } });

  if (isConfigured()) {
    const supabase = createServerClient(supabaseConfig.url, supabaseConfig.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          for (const { name, value } of values) request.cookies.set(name, value);
          // Rebuild the response so refreshed cookies are forwarded to the
          // browser rather than only being visible to this render. The nonce
          // header has to be carried across, or the rebuilt response loses it.
          response = NextResponse.next({ request: { headers } });
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
  response.headers.set("Content-Security-Policy", contentSecurityPolicy(nonce));

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
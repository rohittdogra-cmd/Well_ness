import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { ROBOTS_DISALLOW } from "@/lib/routes";

/**
 * Crawler policy.
 *
 * The public marketing pages are welcome. Everything that renders a signed-in
 * member's data is disallowed, so no group, conversation, appointment, profile
 * or dashboard URL can enter a search index. Both lists come from
 * `lib/routes.ts`, the same source `AuthGate` and the proxy use, so the policy
 * cannot drift from what the app actually enforces.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          ...ROBOTS_DISALLOW,
          // Crawlers have no session, so per-person detail pages are useless
          // to them and must not be indexed.
          "*/sessions/*",
          "/auth/",
          "/admin",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
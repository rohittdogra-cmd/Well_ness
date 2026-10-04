import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { PROGRAM_CONFIGS } from "@/lib/programConfig";
import { PUBLIC_PATHS } from "@/lib/routes";

/**
 * Every indexable URL in one place.
 *
 * The hub is a private community: group slugs, conversation URLs, session ids,
 * member names and check-ins are per-person data, so none of them belong in a
 * public sitemap. They are also excluded in `robots.ts` and marked `noindex` by
 * `pageMetadata`. What is listed here is the public marketing surface plus the
 * category and program browse pages, which are derived from static
 * configuration and therefore always available.
 *
 * If the community is ever opened to anonymous readers, add a read for group
 * slugs and program sessions here rather than removing the exclusions above.
 */
type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const MARKETING: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/membership", priority: 0.8, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/coming-soon", priority: 0.3, changeFrequency: "monthly" },
  { path: "/signin", priority: 0.9, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    ...MARKETING.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    // One landing page per wellness program.
    ...Object.values(PROGRAM_CONFIGS).map((program) => ({
      url: `${base}${program.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // /landing is an alias of the home page; keep it out of the index.
  ];

  // Guard against drift between the access list and the sitemap.
  const listed = new Set(
    staticEntries.map((entry) => entry.url.replace(base, "").replace(/\/$/, "") || "/"),
  );
  for (const path of PUBLIC_PATHS) {
    if (listed.has(path)) continue;
    staticEntries.push({
      url: `${base}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return staticEntries;
}
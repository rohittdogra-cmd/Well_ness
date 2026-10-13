import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { PROGRAM_CONFIGS } from "@/lib/programConfig";
import { PUBLIC_PATHS } from "@/lib/routes";
import { MOCK_GROUPS } from "@/lib/mockGroups";

/**
 * Dynamic comprehensive sitemap with maximum SEO ranking signals.
 *
 * Indexes all public landing pages, badminton and sport arena pages,
 * clinical psychologists, 60+ topic hubs, and legal/trust documentation.
 */
type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const CORE_PAGES: Entry[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/programs/badminton", priority: 0.95, changeFrequency: "daily" },
  { path: "/groups", priority: 0.95, changeFrequency: "daily" },
  { path: "/psychologists", priority: 0.95, changeFrequency: "weekly" },
  { path: "/therapy", priority: 0.95, changeFrequency: "weekly" },
  { path: "/book-activities", priority: 0.90, changeFrequency: "daily" },
  { path: "/membership", priority: 0.85, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.80, changeFrequency: "monthly" },
  { path: "/safety", priority: 0.80, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.80, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.80, changeFrequency: "monthly" },
  { path: "/take-a-moment", priority: 0.80, changeFrequency: "weekly" },
  { path: "/about", priority: 0.80, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.70, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.60, changeFrequency: "monthly" },
  { path: "/coming-soon", priority: 0.40, changeFrequency: "monthly" },
  { path: "/signin", priority: 0.50, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const added = new Set<string>();

  const register = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => {
    const cleanPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
    const url = `${base}${cleanPath}`;
    if (added.has(url)) return;
    added.add(url);
    entries.push({
      url,
      lastModified: now,
      changeFrequency,
      priority,
    });
  };

  // 1. Core high-priority landing routes
  for (const page of CORE_PAGES) {
    register(page.path, page.priority, page.changeFrequency);
  }

  // 2. All wellness and sports programs
  for (const program of Object.values(PROGRAM_CONFIGS)) {
    const isBadminton = program.type === "badminton";
    register(
      program.path,
      isBadminton ? 0.95 : 0.85,
      isBadminton ? "daily" : "weekly",
    );
  }

  // 3. All 60+ specialized community topic groups (Badminton, Cricket, Treks, Cyber Hub, etc.)
  for (const group of MOCK_GROUPS) {
    register(`/groups/${group.slug}`, 0.80, "weekly");
  }

  // 4. Any remaining public routes
  for (const path of PUBLIC_PATHS) {
    if (!added.has(`${base}${path === "/" ? "" : path}`)) {
      register(path, 0.60, "monthly");
    }
  }

  return entries;
}
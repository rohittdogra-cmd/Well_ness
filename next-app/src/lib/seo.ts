import type { Metadata } from "next";
import { siteUrl } from "./env";
import { isPrivatePath, PUBLIC_PATHS } from "./routes";

export const SITE_NAME = "stress-unwind";
export const SITE_TAGLINE = "Corporate stress relief & wellness platform";
export const SITE_DESCRIPTION =
  "A holistic platform for stress relief, mindful meetups, social gatherings, task sharing, and peer support.";

const asArray = (value: string | readonly string[]) =>
  Array.isArray(value) ? value : [value as string];

/**
 * Builds one page's metadata from a single declaration.
 *
 * Every route goes through here, so each page gets a canonical URL, Open Graph
 * and Twitter cards, and a consistent `robots` directive without repeating
 * itself. Private routes are explicitly marked `noindex, nofollow`: they are
 * per-person pages, so they must never be indexed even if a crawler reaches
 * them through an internal link.
 */
export function pageMetadata(
  path: string | readonly string[],
  overrides: Partial<Metadata> = {},
): Metadata {
  const paths = asArray(path);
  const primary = paths[0];
  const url = `${siteUrl()}${primary === "/" ? "" : primary}`;
  const gated = isPrivatePath(primary);
  const rest = paths.slice(1);

  return {
    alternates: { canonical: url },
    robots: gated
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      locale: "en_US",
      ...(rest.length ? { tags: rest } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    ...overrides,
  };
}

/** The canonical paths a crawler should be told about. */
export const INDEXABLE_PATHS: readonly string[] = PUBLIC_PATHS;
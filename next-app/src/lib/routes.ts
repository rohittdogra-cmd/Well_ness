/**
 * Single source of truth for route access.
 *
 * The proxy (server), AuthGate (client), robots.txt and the sitemap all read
 * this list, so "is this page public?" can never drift between them.
 */

/** Signed-out visitors may read these. Everything else needs an account. */
export const PUBLIC_PATHS = [
  "/",
  "/landing",
  "/about",
  "/careers",
  "/membership",
  "/coming-soon",
  "/contact",
  "/signin",
  // Program landing pages render their own "Sign in to Book" affordance.
  "/programs",
  "/meetup-activities",
  "/social-gathering",
  "/task-sharing",
] as const;

/** Auth plumbing that must stay reachable while signed out. */
export const AUTH_PATHS = ["/auth"] as const;

/** Signed-in only. Blocked from crawlers because the content is per-person. */
export const PRIVATE_PATHS = [
  "/account",
  "/apply-provider",
  "/book-activities",
  "/community",
  "/dashboard",
  "/discuss",
  "/groups",
  "/my-sessions",
  "/onboarding",
  "/people",
  "/psychologists",
  "/sessions",
] as const;

const matches = (
  pathname: string,
  paths: readonly string[] | readonly string[],
) =>
  paths.some(
    (path) =>
      pathname === path ||
      // `/groups` must match `/groups/cricket` but not `/groupsteam`.
      (path !== "/" && pathname.startsWith(`${path}/`)),
  );

export function isAuthPath(pathname: string) {
  return matches(pathname, AUTH_PATHS);
}

export function isPublicPath(pathname: string) {
  return isAuthPath(pathname) || matches(pathname, PUBLIC_PATHS);
}

export function isPrivatePath(pathname: string) {
  return !isPublicPath(pathname);
}

/** Paths a crawler must not index, mirroring `PRIVATE_PATHS`. */
export const ROBOTS_DISALLOW = PRIVATE_PATHS.map((path) => path.replace(/\/$/, ""));
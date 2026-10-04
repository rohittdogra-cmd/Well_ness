/**
 * Environment and site configuration.
 *
 * Reading the environment goes through here so a missing or malformed Supabase
 * configuration produces one clear message instead of a crash somewhere deep in
 * the app, and so canonical URLs have a single definition.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const SETUP_MESSAGE =
  "Connect Supabase to enable your hub. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — see DEPLOYMENT.md.";

/**
 * True when both public Supabase values are present and the URL parses.
 *
 * Values are never checked against a deny-list of "placeholder" strings: the
 * browser test fixture runs against a local loopback URL with a test key, and
 * that has to keep working.
 */
export const isConfigured = () => {
  if (!url || !key) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/** Explains precisely what is wrong, for the setup screen. */
export function configurationProblem(): string | null {
  if (!url && !key)
    return "Supabase is not configured: both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are missing.";
  if (!url) return "NEXT_PUBLIC_SUPABASE_URL is missing.";
  if (!key) return "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return `NEXT_PUBLIC_SUPABASE_URL must be an http(s) URL, received "${url}".`;
  } catch {
    return `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${url}".`;
  }
  return null;
}

export const supabaseConfig = {
  url: url ?? "",
  key: key ?? "",
};

/** The configured Supabase origin, or an empty string when unset/invalid. */
export function supabaseOrigin(): string {
  if (!isConfigured()) return "";
  try {
    return new URL(url!).origin;
  } catch {
    return "";
  }
}

/**
 * The canonical origin, used for metadata, canonical URLs, Open Graph images
 * and the sitemap. On Vercel this resolves from the deployment environment so a
 * preview and a production deployment never advertise each other's URLs.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const project = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (project) return `https://${project.replace(/\/+$/, "")}`;
  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}
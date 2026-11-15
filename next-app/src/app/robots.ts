import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/account",
          "/account/*",
          "/api/*",
          "/auth/*",
          "/onboarding",
          "/verify",
          "/appointments/guest",
          "/my-sessions",
        ],
      },
    ],
    sitemap: "https://stress-unwind.com/sitemap.xml",
    host: "https://stress-unwind.com",
  };
}

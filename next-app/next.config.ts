import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Do not advertise the framework version.
  poweredByHeader: false,
  async redirects() {
    return [
      // Legacy entry points that duplicate the home page.
      { source: "/landing/", destination: "/landing", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Allow all local origins in development to prevent HMR and asset blocking
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "localhost:3000",
    "127.0.0.1:3000",
    "0.0.0.0:3000",
  ],
  // Do not advertise the framework version.
  poweredByHeader: false,
  async redirects() {
    return [
      // Legacy entry points that duplicate the home page.
      { source: "/landing/", destination: "/landing", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
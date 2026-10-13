import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
// Tokens first: the token layer must be able to override the legacy sheets.
import "./tokens.css";
import "./globals.css";
import "./wellness.css";
import "./community-design.css";
import "./moment.css";
import "./animations.css";
import { siteUrl } from "@/lib/env";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  DEFAULT_KEYWORDS,
  generateOrganizationSchema,
  generateSportsVenuesSchema,
  generateFaqSchema,
  generateWebSiteSchema,
  generateMedicalBusinessSchema,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const base = siteUrl();

export const metadata: Metadata = {
  // Required so every relative canonical URL and Open Graph URL resolves.
  metadataBase: new URL(base),
  title: {
    default: `${SITE_NAME} · 2-Player Badminton Turf Booking & 100% Employer-Blind Wellness`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: { canonical: `${base}/` },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: base,
    siteName: SITE_NAME,
    title: `${SITE_NAME} · 2-Player Badminton Turf Booking & 100% Employer-Blind Wellness`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: `${base}/images/community-hero.webp`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Delhi-NCR Sports & Corporate Wellness`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · 2-Player Badminton Turf Booking & 100% Employer-Blind Wellness`,
    description: SITE_DESCRIPTION,
    images: [`${base}/images/community-hero.webp`],
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

import { Providers } from "../components/Providers";
import { Layout } from "../components/Layout";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSportsVenuesSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFaqSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateMedicalBusinessSchema()),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

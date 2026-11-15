import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./wellness.css";
import "./community-design.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stress-unwind.com"),
  title: {
    default: "Stress Unwind — Corporate & Community Wellness Platform",
    template: "%s | Stress Unwind",
  },
  description:
    "Stress Unwind is a holistic corporate & community wellness platform. Discover mindful meetups, interest-based peer circles, interactive de-stress exercises, and verified 1-on-1 counseling care.",
  applicationName: "Stress Unwind",
  authors: [{ name: "Stress Unwind Team", url: "https://stress-unwind.com" }],
  generator: "Next.js",
  keywords: [
    "Stress Unwind",
    "stress unwind",
    "stress relief",
    "corporate wellness platform",
    "workplace burnout recovery",
    "peer support circles",
    "mental wellbeing at work",
    "mindful meetups",
    "1-on-1 counseling care",
    "stress management",
    "wellness hub",
    "corporate de-stress",
  ],
  creator: "Stress Unwind",
  publisher: "Stress Unwind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://stress-unwind.com",
  },
  openGraph: {
    title: "Stress Unwind — Corporate & Community Wellness Platform",
    description:
      "A dedicated space to pause, connect, and thrive. Mindful meetups, peer circles, and verified 1-on-1 counseling care.",
    url: "https://stress-unwind.com",
    siteName: "Stress Unwind",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/assets/user-banners/community-hero-wide.webp",
        width: 1800,
        height: 720,
        alt: "Stress Unwind — Corporate & Community Wellness Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stress Unwind — Corporate & Community Wellness Platform",
    description:
      "Find your circle, share your interests, and make room for the moments that matter.",
    images: ["/assets/user-banners/community-hero-wide.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Health & Wellness",
};

import { Providers } from "../components/Providers";
import { Layout } from "../components/Layout";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://stress-unwind.com/#organization",
      name: "Stress Unwind",
      alternateName: ["StressUnwind", "Stress Unwind Hub", "Corporate Wellness Hub"],
      url: "https://stress-unwind.com",
      logo: "https://stress-unwind.com/assets/user-banners/community-hero-wide.webp",
      description:
        "Stress Unwind is a holistic corporate and community wellness platform offering peer support circles, mindful breaks, and confidential care.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://stress-unwind.com/contact",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://stress-unwind.com/#website",
      url: "https://stress-unwind.com",
      name: "Stress Unwind",
      alternateName: "StressUnwind",
      description: "Corporate & Community Wellness Platform",
      publisher: {
        "@id": "https://stress-unwind.com/#organization",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}

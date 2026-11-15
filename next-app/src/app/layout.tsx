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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
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
        "Stress Unwind is the premier corporate and community wellness platform offering peer support circles, mindful breaks, and confidential care.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://stress-unwind.com/contact",
      },
      sameAs: [
        "https://twitter.com/StressUnwind",
        "https://www.linkedin.com/company/stress-unwind",
      ],
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
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://stress-unwind.com/groups?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://stress-unwind.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Stress Unwind Home",
          item: "https://stress-unwind.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Wellness Circles",
          item: "https://stress-unwind.com/groups",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Book Activities",
          item: "https://stress-unwind.com/book-activities",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Psychologists & Care",
          item: "https://stress-unwind.com/psychologists",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://stress-unwind.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Stress Unwind?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Stress Unwind is the premier corporate and community wellness platform designed to alleviate workplace burnout, loneliness, and chronic stress through peer support circles, daily micro-break arcade games, and confidential 1-on-1 counseling with licensed psychologists.",
          },
        },
        {
          "@type": "Question",
          name: "How does Stress Unwind help reduce workplace stress?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Stress Unwind combines community connection and scientific micro-breaks. Whether you take a 5-minute pause with our interactive arcade, join a casual coffee chat circle, play box cricket or pickleball with colleagues, or consult a therapist, the platform offers immediate, judgment-free stress relief.",
          },
        },
        {
          "@type": "Question",
          name: "Are 1-on-1 counseling sessions confidential on Stress Unwind?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, 100%. All therapy and counseling sessions on Stress Unwind are private, encrypted, and conducted strictly between you and verified, licensed mental health professionals.",
          },
        },
        {
          "@type": "Question",
          name: "How do I join a wellness circle on Stress Unwind?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Browse 30+ peer circles across sports, creative arts, and mindfulness. Click into any circle (such as Cricket, Yoga, Book Club, or Chai Pe Charcha) to RSVP for upcoming sessions and connect with peers.",
          },
        },
      ],
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

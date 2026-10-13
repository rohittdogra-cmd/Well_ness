import type { Metadata } from "next";
import { siteUrl } from "./env";
import { isPrivatePath, PUBLIC_PATHS } from "./routes";

export const SITE_NAME = "stress-unwind";
export const SITE_TAGLINE =
  "Delhi-NCR's #1 Employer-Blind Sports Turf Booking & Corporate Wellness Community";
export const SITE_DESCRIPTION =
  "Escape corporate burnout with 100% employer-blind anonymity. Book verified indoor badminton turfs across Janakpuri, Gurgaon, Noida, and Palwal, match with peers using auto-assigned cute handles, and consult licensed clinical psychologists with zero HR data sharing.";

export const DEFAULT_KEYWORDS: string[] = [
  // Badminton & Sports Turfs (Delhi-NCR)
  "badminton turf booking delhi ncr",
  "book badminton court online gurgaon",
  "indoor badminton courts janakpuri",
  "sp arena janakpuri badminton",
  "fitso smash arena cyber hub",
  "sector 54 rapid sports dome gurgaon",
  "noida sector 62 badminton turf",
  "palwal national sports arena",
  "central aerocity racquet club",
  "2 player badminton matchmaking",
  "bwf synthetic court booking delhi",
  "indoor wooden badminton flooring ncr",
  "badminton courts near me delhi ncr",
  "box cricket cyber city gurgaon",
  "turf football booking noida",
  "pickleball courts gurgaon",
  "lawn tennis court booking delhi",
  "sports turf booking app india",
  "weekend badminton matches delhi",
  "badminton racket rental gurgaon",

  // Corporate Wellness & Mental Health
  "corporate wellness platform india",
  "employee burnout recovery delhi ncr",
  "100% employer-blind mental health",
  "anonymous workplace peer support",
  "cute anonymous avatars sports matchmaking",
  "confidential therapy for tech employees",
  "licensed clinical psychologists gurgaon",
  "rci certified therapists delhi",
  "workplace anxiety and depression counseling",
  "executive burnout recovery sessions",
  "private doctor cabins corporate wellness",
  "corporate sports tournaments delhi ncr",
  "stress relief activities for corporate employees",
  "dpdp act 2023 compliant wellness platform",
  "anti-trolling safe community platform",
  "mental health benefits without hr tracking",

  // Localities, Hubs & Helplines
  "dlf cyber city weekend activities",
  "sector 29 gurgaon chai meetups",
  "golf course road runners club",
  "aravali weekend morning treks",
  "west delhi sports clubs janakpuri",
  "noida electronic city wellness circles",
  "aerocity business district sports",
  "tele-manas mental health helpline 14416",
  "kiran helpline 1800-599-0019",
  "vandrevala foundation helpline",
];

const asArray = (value: string | readonly string[]) =>
  Array.isArray(value) ? value : [value as string];

/**
 * Builds one page's metadata from a single declaration with max SEO optimization.
 */
export function pageMetadata(
  path: string | readonly string[],
  overrides: Partial<Metadata> = {},
): Metadata {
  const paths = asArray(path);
  const primary = paths[0];
  const base = siteUrl();
  const url = `${base}${primary === "/" ? "" : primary}`;
  const gated = isPrivatePath(primary);
  const rest = paths.slice(1);

  const titleText =
    typeof overrides.title === "string"
      ? overrides.title
      : `${SITE_NAME} · ${SITE_TAGLINE}`;

  const descriptionText = overrides.description || SITE_DESCRIPTION;

  const combinedKeywords = Array.from(
    new Set([
      ...(Array.isArray(overrides.keywords)
        ? (overrides.keywords as string[])
        : []),
      ...DEFAULT_KEYWORDS,
    ]),
  );

  return {
    title: overrides.title,
    description: descriptionText,
    keywords: combinedKeywords,
    alternates: { canonical: url },
    robots: gated
      ? { index: false, follow: false, nocache: true }
      : {
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
      url,
      siteName: SITE_NAME,
      title: titleText,
      description: descriptionText,
      locale: "en_US",
      images: [
        {
          url: `${base}/images/community-hero.webp`,
          width: 1200,
          height: 630,
          alt: "stress-unwind — 2-Player Badminton Turf Booking & Corporate Wellness",
        },
      ],
      ...(rest.length ? { tags: rest } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descriptionText,
      images: [`${base}/images/community-hero.webp`],
    },
    other: {
      "application-name": SITE_NAME,
      "geo.region": "IN-DL",
      "geo.placename": "Delhi, Gurgaon, Noida, Palwal",
    },
    ...overrides,
  };
}

/** Structured Data Schemas (JSON-LD) for Maximum Google Rich Snippets */

export function generateOrganizationSchema() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: "stress-unwind",
    alternateName: "stress-unwind Technologies",
    url: base,
    logo: `${base}/favicon.ico`,
    image: `${base}/images/community-hero.webp`,
    description: SITE_DESCRIPTION,
    areaServed: [
      { "@type": "City", name: "Delhi" },
      { "@type": "City", name: "Gurgaon" },
      { "@type": "City", name: "Noida" },
      { "@type": "City", name: "Palwal" },
      { "@type": "Country", name: "India" },
    ],
    knowsAbout: [
      "Badminton Court Booking",
      "Corporate Mental Health",
      "Burnout Recovery",
      "Workplace Wellbeing",
      "Sports Matchmaking",
    ],
    sameAs: ["https://github.com/rohittdogra-cmd/Well_ness"],
  };
}

export function generateSportsVenuesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Verified Indoor Badminton Arenas across Delhi-NCR",
    description:
      "Tournament-grade BWF synthetic and teak wooden badminton arenas partnered with stress-unwind.",
    itemListElement: [
      {
        "@type": "SportsActivityLocation",
        position: 1,
        name: "SP Arena Indoor Badminton Hub",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Block B-1, Near District Centre",
          addressLocality: "Janakpuri",
          addressRegion: "Delhi",
          addressCountry: "IN",
        },
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "BWF Synthetic Mat", value: true },
          { "@type": "LocationFeatureSpecification", name: "Air Conditioned", value: true },
          { "@type": "LocationFeatureSpecification", name: "Gear Rentals", value: true },
        ],
        priceRange: "₹450/hr",
      },
      {
        "@type": "SportsActivityLocation",
        position: 2,
        name: "Fitso Smash Arena @ Cyber Hub",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Phase 2, Near DLF Cyber City, Sector 25",
          addressLocality: "Gurgaon",
          addressRegion: "Haryana",
          addressCountry: "IN",
        },
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Teak Wooden Flooring", value: true },
          { "@type": "LocationFeatureSpecification", name: "Locker & Showers", value: true },
        ],
        priceRange: "₹550/hr",
      },
      {
        "@type": "SportsActivityLocation",
        position: 3,
        name: "Sector 54 Rapid Sports Dome",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Golf Course Road, Opp Rapid Metro Sec 54",
          addressLocality: "Gurgaon",
          addressRegion: "Haryana",
          addressCountry: "IN",
        },
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "BWF Synthetic Mat", value: true },
        ],
        priceRange: "₹480/hr",
      },
      {
        "@type": "SportsActivityLocation",
        position: 4,
        name: "Smash & Drop Badminton Center",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Sector 62, Near Electronic City Metro",
          addressLocality: "Noida",
          addressRegion: "Uttar Pradesh",
          addressCountry: "IN",
        },
        priceRange: "₹400/hr",
      },
      {
        "@type": "SportsActivityLocation",
        position: 5,
        name: "Central Aerocity Racquet Club",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Hospitality District, Aerocity",
          addressLocality: "New Delhi",
          addressRegion: "Delhi",
          addressCountry: "IN",
        },
        priceRange: "₹600/hr",
      },
    ],
  };
}

export function generateFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why are member display names auto-assigned and locked?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To eliminate online trolling, inappropriate usernames, and identity bias, display names are auto-assigned as cute, sporty handles (like Junior Ronaldo, Crazy Kohli, Shuttle Queen, and Iron Gymmer) based on selected gender and interests. Manual text entry is locked to ensure a wholesome, safe environment.",
        },
      },
      {
        "@type": "Question",
        name: "How does 2-player badminton matchmaking and turf booking work in Delhi-NCR?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When two members match to play badminton, our proximity engine calculates the commute distance between their localities (Janakpuri, Gurgaon, Noida, Palwal) and recommends central neutral courts like Aerocity. Players choose a 1-hour slot, and our operations desk confirms availability with the venue manager before issuing an official match pass with court number and entry passcode.",
        },
      },
      {
        "@type": "Question",
        name: "Is stress-unwind 100% employer-blind?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. stress-unwind is 100% Employer-Blind. Your registration, anonymous handles, discussion posts, sports bookings, and doctor consultations are completely isolated from corporate HR systems. Zero personal data, transcripts, or consultation logs are ever shared with corporate administrators.",
        },
      },
      {
        "@type": "Question",
        name: "Are the therapists on the platform certified licensed practitioners?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All psychologists and psychiatrists listed in our therapy department hold recognized clinical qualifications (M.Phil., Ph.D., or MD) with verified RCI licenses and 8+ years of clinical experience specializing in workplace burnout, anxiety, and depression.",
        },
      },
    ],
  };
}

export function generateWebSiteSchema() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "stress-unwind",
    alternateName: "stress-unwind Corporate Wellness & Sports Hub",
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/groups?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateMedicalBusinessSchema() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "stress-unwind Clinical Mental Health & Doctor Cabins",
    description:
      "Confidential, 100% employer-blind clinical psychology consultations and private doctor cabins for corporate burnout, anxiety, and stress management.",
    url: `${base}/psychologists`,
    medicalSpecialty: ["Psychiatric", "CommunityHealth"],
    availableService: [
      {
        "@type": "MedicalTherapy",
        name: "Confidential Burnout Recovery Consultation",
        description:
          "Private 50-minute one-on-one session with licensed RCI clinical psychologists.",
      },
      {
        "@type": "MedicalTherapy",
        name: "Workplace Anxiety & Depression Therapy",
        description:
          "Evidence-based cognitive behavioral therapy without employer data disclosure.",
      },
    ],
    areaServed: ["Delhi", "Gurgaon", "Noida", "Palwal"],
  };
}

/** The canonical paths a crawler should be told about. */
export const INDEXABLE_PATHS: readonly string[] = PUBLIC_PATHS;
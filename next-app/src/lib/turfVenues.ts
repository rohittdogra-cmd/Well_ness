/**
 * Badminton Turfs, Proximity Helpers & Slot Booking Store
 * Enables 2-player meetup coordination, nearby court discovery,
 * and team-verified slot booking flow.
 */

export interface TurfVenue {
  id: string;
  name: string;
  area: string;
  cityState: string;
  address: string;
  image: string;
  courtsCount: number;
  courtType: "BWF Synthetic Mat" | "Teak Wooden Flooring" | "Indoor Cushioned";
  pricePerHour: number;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  openHours: string;
  slots: string[];
}

export const TURF_VENUES: TurfVenue[] = [
  {
    id: "turf-janakpuri-sp",
    name: "SP Arena Indoor Badminton Hub",
    area: "Janakpuri",
    cityState: "Janakpuri, Delhi",
    address: "Block B-1, Near District Centre, Janakpuri, New Delhi",
    image: "/images/activities/badminton.jpg",
    courtsCount: 4,
    courtType: "BWF Synthetic Mat",
    pricePerHour: 450,
    rating: 4.8,
    reviewsCount: 142,
    amenities: ["Air Conditioned", "Racket & Yonex Shuttle Rental", "Changing Rooms", "Free Parking", "Drinking Water"],
    openHours: "6:00 AM – 11:00 PM",
    slots: [
      "06:00 AM – 07:00 AM",
      "07:00 AM – 08:00 AM",
      "08:00 AM – 09:00 AM",
      "05:00 PM – 06:00 PM",
      "06:00 PM – 07:00 PM",
      "07:00 PM – 08:00 PM",
      "08:00 PM – 09:00 PM",
      "09:00 PM – 10:00 PM",
    ],
  },
  {
    id: "turf-gurgaon-fitso",
    name: "Fitso Smash Arena @ Cyber Hub",
    area: "Gurgaon",
    cityState: "Gurgaon, Haryana",
    address: "Phase 2, Near DLF Cyber City, Sector 25, Gurgaon",
    image: "/images/activities/badminton.jpg",
    courtsCount: 6,
    courtType: "Teak Wooden Flooring",
    pricePerHour: 550,
    rating: 4.9,
    reviewsCount: 230,
    amenities: ["Pro Coaching Available", "Locker & Showers", "Yonex Gear Rental", "Cafeteria", "Valet Parking"],
    openHours: "5:30 AM – 11:30 PM",
    slots: [
      "06:00 AM – 07:00 AM",
      "07:00 AM – 08:00 AM",
      "08:00 AM – 09:00 AM",
      "05:30 PM – 06:30 PM",
      "06:30 PM – 07:30 PM",
      "07:30 PM – 08:30 PM",
      "08:30 PM – 09:30 PM",
      "09:30 PM – 10:30 PM",
    ],
  },
  {
    id: "turf-gurgaon-sec54",
    name: "Sector 54 Rapid Sports Dome",
    area: "Gurgaon",
    cityState: "Gurgaon, Haryana",
    address: "Golf Course Road, Opp Rapid Metro Sec 54, Gurgaon",
    image: "/images/activities/badminton.jpg",
    courtsCount: 4,
    courtType: "BWF Synthetic Mat",
    pricePerHour: 480,
    rating: 4.7,
    reviewsCount: 98,
    amenities: ["High Ceiling Arena", "Non-Marking Shoes Rental", "Shower Cubicles", "Energy Drinks Bar"],
    openHours: "6:00 AM – 11:00 PM",
    slots: [
      "06:30 AM – 07:30 AM",
      "07:30 AM – 08:30 AM",
      "05:00 PM – 06:00 PM",
      "06:00 PM – 07:00 PM",
      "07:00 PM – 08:00 PM",
      "08:00 PM – 09:00 PM",
    ],
  },
  {
    id: "turf-noida-smash",
    name: "Smash & Drop Badminton Center",
    area: "Noida",
    cityState: "Noida, Uttar Pradesh",
    address: "Sector 62, Near Electronic City Metro, Noida",
    image: "/images/activities/badminton.jpg",
    courtsCount: 5,
    courtType: "BWF Synthetic Mat",
    pricePerHour: 400,
    rating: 4.6,
    reviewsCount: 114,
    amenities: ["Spacious Viewing Gallery", "Tournament Lighting", "Equipment Shop", "Filtered Water"],
    openHours: "6:00 AM – 10:30 PM",
    slots: [
      "06:00 AM – 07:00 AM",
      "07:00 AM – 08:00 AM",
      "05:00 PM – 06:00 PM",
      "06:00 PM – 07:00 PM",
      "07:00 PM – 08:00 PM",
      "08:00 PM – 09:00 PM",
    ],
  },
  {
    id: "turf-palwal-hub",
    name: "Palwal National Sports Arena & Turf",
    area: "Palwal",
    cityState: "Palwal, Haryana",
    address: "Agra Road, Near Mini Secretariat, Palwal, Haryana",
    image: "/images/activities/badminton.jpg",
    courtsCount: 3,
    courtType: "Teak Wooden Flooring",
    pricePerHour: 350,
    rating: 4.8,
    reviewsCount: 62,
    amenities: ["Wooden Courts", "Equipment Available", "Parking", "First Aid on site"],
    openHours: "6:00 AM – 10:00 PM",
    slots: [
      "06:30 AM – 07:30 AM",
      "07:30 AM – 08:30 AM",
      "05:00 PM – 06:00 PM",
      "06:00 PM – 07:00 PM",
      "07:00 PM – 08:00 PM",
    ],
  },
  {
    id: "turf-southdelhi-aerocity",
    name: "Central Aerocity Racquet Club",
    area: "Central / Aerocity",
    cityState: "Aerocity, New Delhi",
    address: "Hospitality District, Aerocity, New Delhi (Midpoint between Gurgaon & West Delhi)",
    image: "/images/activities/badminton.jpg",
    courtsCount: 4,
    courtType: "BWF Synthetic Mat",
    pricePerHour: 600,
    rating: 4.9,
    reviewsCount: 185,
    amenities: ["Centrally Located Midpoint", "Premium Lounge", "Locker Rooms", "Racket Stringing on-site"],
    openHours: "6:00 AM – 11:00 PM",
    slots: [
      "06:00 AM – 07:00 AM",
      "07:00 AM – 08:00 AM",
      "08:00 AM – 09:00 AM",
      "05:00 PM – 06:00 PM",
      "06:00 PM – 07:00 PM",
      "07:00 PM – 08:00 PM",
      "08:00 PM – 09:00 PM",
    ],
  },
];

export interface ProximityResult {
  category: "same_area" | "same_city" | "intercity" | "remote";
  label: string;
  approxDistance: string;
  isViableForMeetup: boolean;
  explanation: string;
  suggestedMidpoints: string[];
}

/**
 * Calculates proximity between two locations (e.g. "Janakpuri, Delhi" vs "Gurgaon, Haryana",
 * or "Delhi" vs "Auckland, New Zealand").
 */
export function calculateProximity(locA?: string, locB?: string): ProximityResult {
  const a = (locA || "").toLowerCase().trim();
  const b = (locB || "").toLowerCase().trim();

  if (!a || !b) {
    return {
      category: "same_city",
      label: "Metro Region (~15 km)",
      approxDistance: "15 km",
      isViableForMeetup: true,
      explanation: "Nearby metro connection. Good for evening turf matches.",
      suggestedMidpoints: ["Cyber Hub", "Aerocity", "Janakpuri"],
    };
  }

  // Detect international / far overseas (e.g. New Zealand, US, UK, Australia, etc.)
  const farKeywords = [
    "new zealand",
    "auckland",
    "wellington",
    "usa",
    "united states",
    "canada",
    "uk",
    "london",
    "germany",
    "australia",
    "sydney",
    "singapore",
    "dubai",
  ];

  const aIsFar = farKeywords.some((k) => a.includes(k));
  const bIsFar = farKeywords.some((k) => b.includes(k));

  if ((aIsFar && !bIsFar) || (!aIsFar && bIsFar) || (aIsFar && bIsFar && a !== b)) {
    return {
      category: "remote",
      label: "Remote / Overseas (~11,000 km)",
      approxDistance: "11,000+ km",
      isViableForMeetup: false,
      explanation:
        "Players are across different countries (e.g. New Zealand vs India). In-person sports meetup is not feasible; enjoy virtual chats & wellness sharing!",
      suggestedMidpoints: [],
    };
  }

  // Same exact locality / area
  if (a === b || (a.includes("janakpuri") && b.includes("janakpuri")) || (a.includes("gurgaon") && b.includes("gurgaon")) || (a.includes("noida") && b.includes("noida")) || (a.includes("palwal") && b.includes("palwal"))) {
    return {
      category: "same_area",
      label: "Same Locality (< 5 km)",
      approxDistance: "3-5 km",
      isViableForMeetup: true,
      explanation: "Right in the same neighborhood! Quick 10-minute commute to courts.",
      suggestedMidpoints: [a.split(",")[0] || "Local Sports Club"],
    };
  }

  // NCR Metro Combinations (Janakpuri <-> Gurgaon, Gurgaon <-> Noida, etc.)
  const ncrZones = ["delhi", "gurgaon", "noida", "janakpuri", "palwal", "faridabad", "ghaziabad", "haryana"];
  const aInNCR = ncrZones.some((z) => a.includes(z));
  const bInNCR = ncrZones.some((z) => b.includes(z));

  if (aInNCR && bInNCR) {
    if ((a.includes("janakpuri") && b.includes("gurgaon")) || (a.includes("gurgaon") && b.includes("janakpuri"))) {
      return {
        category: "same_city",
        label: "NCR Metro (~22 km)",
        approxDistance: "22 km",
        isViableForMeetup: true,
        explanation: "Accessible via Rapid Metro / Ring Road. Aerocity or Dhaula Kuan is the perfect 50-50 midpoint!",
        suggestedMidpoints: ["Central Aerocity Racquet Club", "SP Arena Janakpuri", "Fitso Cyber Hub"],
      };
    }
    if ((a.includes("gurgaon") && b.includes("palwal")) || (a.includes("palwal") && b.includes("gurgaon"))) {
      return {
        category: "same_city",
        label: "NCR South (~35 km)",
        approxDistance: "35 km",
        isViableForMeetup: true,
        explanation: "Accessible via Sohna Elevated Corridor (~35 mins). Great for weekend morning slots.",
        suggestedMidpoints: ["Sector 54 Sports Dome", "Palwal Sports Arena"],
      };
    }
    return {
      category: "same_city",
      label: "Same Metro Region (~18 km)",
      approxDistance: "18 km",
      isViableForMeetup: true,
      explanation: "Within Delhi-NCR metro network. Easily coordinated at a central court.",
      suggestedMidpoints: ["Central Aerocity", "Cyber Hub", "Noida Sec 62"],
    };
  }

  // Intercity inside country
  return {
    category: "intercity",
    label: "Intercity (~280 km)",
    approxDistance: "250-400 km",
    isViableForMeetup: false,
    explanation: "Different cities/states. Requires advance planning for weekend tournaments or trips.",
    suggestedMidpoints: ["Central State Arena"],
  };
}

export interface TurfBookingRequest {
  bookingId: string;
  turfId: string;
  turfName: string;
  courtType: string;
  area: string;
  player1CuteName: string;
  player1Phone: string;
  player2CuteName: string;
  date: string;
  timeSlot: string;
  racketsNeeded: number;
  status: "submitted" | "verifying" | "confirmed";
  courtNumber?: string;
  passcode?: string;
  createdAt: string;
  verifiedAt?: string;
  notes?: string;
}

const STORAGE_KEY = "stress_unwind_turf_bookings_v1";

export function getTurfBookings(): TurfBookingRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTurfBooking(booking: TurfBookingRequest): TurfBookingRequest {
  if (typeof window === "undefined") return booking;
  const existing = getTurfBookings();
  const updated = [booking, ...existing.filter((b) => b.bookingId !== booking.bookingId)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return booking;
}

export function verifyTurfBooking(bookingId: string, courtNumber = "Court 2 (Air Conditioned)"): TurfBookingRequest | null {
  const existing = getTurfBookings();
  const target = existing.find((b) => b.bookingId === bookingId);
  if (!target) return null;

  target.status = "confirmed";
  target.courtNumber = courtNumber;
  target.passcode = `PASS-${Math.floor(1000 + Math.random() * 9000)}`;
  target.verifiedAt = new Date().toISOString();

  saveTurfBooking(target);
  return target;
}

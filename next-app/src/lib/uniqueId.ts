/**
 * Helper to generate and format clean, human-readable Unique IDs
 * for all stress-unwind platform members (e.g. SU-8492-RM).
 */

export interface CommunityMember {
  id: string; // unique ID like SU-8492-RM
  name: string;
  role: string;
  avatarSeed: number;
  initials: string;
  status: string;
  location?: string;
}

export const KNOWN_MEMBERS: Record<string, CommunityMember> = {
  "SU-8492-RM": {
    id: "SU-8492-RM",
    name: "Junior Ronaldo",
    role: "Football & Sports Peer",
    avatarSeed: 1,
    initials: "JR",
    status: "Active 5m ago",
    location: "Gurgaon, Haryana",
  },
  "SU-2910-AS": {
    id: "SU-2910-AS",
    name: "Shuttle Queen",
    role: "Badminton & Weekend Turf",
    avatarSeed: 2,
    initials: "SQ",
    status: "Online now",
    location: "Janakpuri, Delhi",
  },
  "SU-5183-VD": {
    id: "SU-5183-VD",
    name: "Crazy Kohli",
    role: "Cricket & Box Sports",
    avatarSeed: 3,
    initials: "CK",
    status: "Active 12m ago",
    location: "Noida, Uttar Pradesh",
  },
  "SU-4391-PN": {
    id: "SU-4391-PN",
    name: "Iron Gymmer",
    role: "Fitness & Morning Lift",
    avatarSeed: 4,
    initials: "IG",
    status: "Online now",
    location: "Gurgaon, Haryana",
  },
  "SU-6029-SG": {
    id: "SU-6029-SG",
    name: "Messed Messi",
    role: "Turf Football & Free-kicks",
    avatarSeed: 5,
    initials: "MM",
    status: "Active 30m ago",
    location: "Palwal, Haryana",
  },
  "SU-3721-NS": {
    id: "SU-3721-NS",
    name: "Drop Shot Dave",
    role: "Badminton Doubles Partner",
    avatarSeed: 6,
    initials: "DD",
    status: "Active 1h ago",
    location: "Janakpuri, Delhi",
  },
  "SU-7241-SR": {
    id: "SU-7241-SR",
    name: "Zen Zebra",
    role: "Yoga & Mindful Walk",
    avatarSeed: 7,
    initials: "ZZ",
    status: "Active 2h ago",
    location: "South Delhi",
  },
  "SU-9134-MJ": {
    id: "SU-9134-MJ",
    name: "Cold Brew Charlie",
    role: "Coffee & Chai Catchups",
    avatarSeed: 8,
    initials: "CC",
    status: "Online now",
    location: "Auckland, New Zealand",
  },
  "SU-0001-CD": {
    id: "SU-0001-CD",
    name: "Smash Baron",
    role: "Platform Admin & Sports Lead",
    avatarSeed: 0,
    initials: "SB",
    status: "Platform Admin",
    location: "Janakpuri, Delhi",
  },
  "SU-1111-AR": {
    id: "SU-1111-AR",
    name: "Smash Sensation",
    role: "Badminton Enthusiast",
    avatarSeed: 0,
    initials: "SS",
    status: "Online now",
    location: "Janakpuri, Delhi",
  },
};

export function getShortUniqueId(idOrEmail?: string | null): string {
  if (!idOrEmail) return "SU-9900-MB";
  const str = idOrEmail.trim().toLowerCase();

  // Known seeds for consistency
  if (str.includes("chhavi.dogra")) return "SU-0001-CD";
  if (str.includes("chhavi0889")) return "SU-0002-CD";
  if (str.includes("arpitthakur") || str.includes("rupalihomes")) return "SU-4821-AT";
  if (str.includes("alex@company") || str.includes("11111111")) return "SU-1111-AR";
  if (str.includes("rohan")) return "SU-8492-RM";
  if (str.includes("ananya")) return "SU-2910-AS";
  if (str.includes("vikram")) return "SU-5183-VD";
  if (str.includes("priya")) return "SU-4391-PN";
  if (str.includes("samarth")) return "SU-6029-SG";
  if (str.includes("neha")) return "SU-3721-NS";
  if (str.includes("siddharth")) return "SU-7241-SR";
  if (str.includes("meera")) return "SU-9134-MJ";

  // Deterministic 4-digit code + 2 initials
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash % 9000) + 1000;

  // Extract initials
  const namePart = str.split("@")[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
  const initials = (namePart.slice(0, 2) || "MB").padEnd(2, "X");

  return `SU-${num}-${initials}`;
}

export function formatUniqueIdBadge(idOrEmail?: string | null): string {
  return getShortUniqueId(idOrEmail);
}

export function lookupMemberById(uniqueId: string): CommunityMember | null {
  const cleanId = uniqueId.trim().toUpperCase();
  if (KNOWN_MEMBERS[cleanId]) return KNOWN_MEMBERS[cleanId];

  // Try partial match
  const found = Object.values(KNOWN_MEMBERS).find(
    (m) => m.id.toUpperCase() === cleanId || m.name.toLowerCase() === cleanId.toLowerCase(),
  );
  if (found) return found;

  // Synthesize member details if structured as SU-XXXX-XX
  if (/^SU-\d{4}-[A-Z]{2}$/i.test(cleanId)) {
    const initials = cleanId.split("-")[2].toUpperCase();
    return {
      id: cleanId,
      name: `Member ${initials}`,
      role: "stress unwind member",
      avatarSeed: Math.abs(cleanId.charCodeAt(3) || 1) % 9,
      initials,
      status: "Active member",
    };
  }
  return null;
}

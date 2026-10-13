/**
 * Anonymous Cute Name Auto-Generator Engine
 * Auto-assigns playful, culturally resonant, and sporty anonymous handles
 * based on selected Gender and Interests / Sports.
 * Prevents users from entering arbitrary or abusive custom names.
 */

export type GenderType = "male" | "female" | "non-binary";

interface CuteNameBank {
  male: string[];
  female: string[];
  neutral: string[];
}

export const CUTE_NAMES_BY_INTEREST: Record<string, CuteNameBank> = {
  Football: {
    male: [
      "Junior Ronaldo",
      "Messed Messi",
      "Dribble Dynamo",
      "Nutmeg Ninja",
      "Tiki-Taka Toby",
      "Striker Sam",
      "Goal Machine",
      "Golden Boot Leo",
      "Free-Kick Felix",
    ],
    female: [
      "Penalty Pixie",
      "Dribble Diva",
      "Queen Kick",
      "Speedy Marta",
      "Nutmeg Naya",
      "Tiki-Taka Tara",
      "Golden Boot Gemma",
    ],
    neutral: [
      "Golden Boot",
      "Corner Curler",
      "Baller Buddy",
      "Turf Topper",
      "Midfield Maestro",
      "Volley Vortex",
    ],
  },
  Cricket: {
    male: [
      "Crazy Kohli",
      "Helicopter Mahi",
      "Yorker Prince",
      "Googly Guy",
      "Cover Drive Champ",
      "Spin Wizard",
      "Boundary Buster",
      "Sixer Sunny",
    ],
    female: [
      "Yorker Yasmin",
      "Smriti Smasher",
      "Gully Queen",
      "Spin Sorceress",
      "Boundary Bella",
      "Cover Drive Clara",
    ],
    neutral: [
      "Pitch Prodigy",
      "Googly Guru",
      "Boundary Buster",
      "All-Rounder Ace",
      "Stump Stalker",
    ],
  },
  Badminton: {
    male: [
      "Smash Sensation",
      "Drop Shot Dave",
      "Rally Rocket",
      "Smash Baron",
      "Feather Flick",
      "Net Ninja",
      "Deceptive Drop",
    ],
    female: [
      "Shuttle Queen",
      "Smash Siren",
      "Drop Shot Diya",
      "Rally Rose",
      "Feather Fairy",
      "Net Goddess",
    ],
    neutral: [
      "Net Ninja",
      "Shuttle Smasher",
      "Rally Rocket",
      "Badminton Buddy",
      "Court Commander",
      "Feather Glider",
    ],
  },
  Sports: {
    male: [
      "Sprint King",
      "Rally Rocket",
      "Cardio Champ",
      "Turbo Toby",
      "Agile Arrow",
    ],
    female: [
      "Speedy Spark",
      "Queen Athlete",
      "Cardio Cleo",
      "Swift Sierra",
    ],
    neutral: [
      "Sporty Sprite",
      "Agile Ace",
      "Track Titan",
      "Swift Comet",
    ],
  },
  "Gym / Fitness": {
    male: [
      "Iron Gymmer",
      "Bicep Bunny",
      "Protein Pete",
      "Reps Rocket",
      "Flex Falcon",
      "Kettlebell King",
      "Deadlift Dan",
    ],
    female: [
      "Deadlift Diva",
      "Glute Goddess",
      "Cardio Crusader",
      "Bicep Bella",
      "Dumbbell Daisy",
      "Pilates Princess",
    ],
    neutral: [
      "Reps Rocket",
      "Iron Soul",
      "Flex Friend",
      "Kettlebell Kid",
      "Gym Habit Hero",
    ],
  },
  Yoga: {
    male: [
      "Zen Zebra",
      "Calm Chameleon",
      "Prana Pilot",
      "Mindful Monk",
      "Om Ollie",
      "Breathe Brother",
    ],
    female: [
      "Lotus Lily",
      "Serene Maya",
      "Zen Zoe",
      "Prana Pixie",
      "Calm Chloe",
      "Asana Angel",
    ],
    neutral: [
      "Peaceful Panda",
      "Mindful Mochi",
      "Serene Sloth",
      "Zen Buddy",
      "Breathe Breeze",
    ],
  },
  Mindfulness: {
    male: [
      "Calm Chameleon",
      "Tranquil Toby",
      "Mindful Milo",
      "Zen Warrior",
    ],
    female: [
      "Serene Sky",
      "Peaceful Poppy",
      "Mindful Mia",
      "Zen Zephyr",
    ],
    neutral: [
      "Calm Cloud",
      "Mindful Mochi",
      "Peaceful Pebble",
      "Stillness Star",
    ],
  },
  Coffee: {
    male: [
      "Cold Brew Charlie",
      "Chai Chariot",
      "Espresso Enzo",
      "Mocha Milo",
      "Cappuccino Captain",
    ],
    female: [
      "Espresso Ella",
      "Mocha Mallow",
      "Chai Cherry",
      "Latte Luna",
      "Caramel Clara",
    ],
    neutral: [
      "Chai Chariot",
      "Latte Legend",
      "Brew Buddy",
      "Mocha Munchkin",
      "Aroma Spark",
    ],
  },
  Running: {
    male: [
      "Sprint Cheetah",
      "Pacing Puma",
      "Trail Trotter",
      "Mile Marvel",
      "Tempo Tiger",
    ],
    female: [
      "Speedy Gazelle",
      "Trail Tara",
      "Pacing Pippa",
      "Dash Daisy",
      "Tempo Talia",
    ],
    neutral: [
      "Trail Trotter",
      "Mile Marvel",
      "Stride Sprite",
      "Pace Partner",
    ],
  },
  Gaming: {
    male: [
      "Pixel Paladin",
      "Glitch Guru",
      "Turbo Tapper",
      "Respawn Ronin",
    ],
    female: [
      "Pixel Pixie",
      "Glitch Grace",
      "Mana Queen",
      "Cyber Chloe",
    ],
    neutral: [
      "Pixel Paladin",
      "Cyber Sprite",
      "Game On Gizmo",
      "Arcade Ace",
    ],
  },
  Books: {
    male: [
      "Page Turner Pete",
      "Chapter Charlie",
      "Plot Pilot",
    ],
    female: [
      "Bookworm Bella",
      "Story Scout Sophie",
      "Novel Nectar",
    ],
    neutral: [
      "Cozy Reader",
      "Page Turner",
      "Story Spark",
    ],
  },
  Travel: {
    male: [
      "Wanderlust Will",
      "Compass Carl",
      "Nomad Noah",
    ],
    female: [
      "Wanderlust Wendy",
      "Globe Trotter Gigi",
      "Nomad Nova",
    ],
    neutral: [
      "Voyage Vibe",
      "Trail Trekker",
      "Compass Rover",
    ],
  },
  Food: {
    male: [
      "Gourmet Guy",
      "Snack Sam",
      "Flavor Felix",
    ],
    female: [
      "Tasting Tara",
      "Snack Queen Sophie",
      "Flavor Flora",
    ],
    neutral: [
      "Foodie Spark",
      "Snack Scout",
      "Flavor Fanatic",
    ],
  },
};

const DEFAULT_POOL: CuteNameBank = {
  male: ["Curious Charlie", "Sunny Sam", "Breeze Ben", "Wonder Will"],
  female: ["Sunny Sarah", "Bright Bella", "Breeze Chloe", "Wonder Willow"],
  neutral: ["Kind Kiwi", "Sunny Spark", "Curious Comet", "Breeze Buddy"],
};

/**
 * Returns all potential cute names for given gender and interest list.
 */
export function getCandidateCuteNames(
  gender: GenderType = "non-binary",
  interests: string[] = [],
): string[] {
  const genderKey: "male" | "female" | "neutral" =
    gender === "male" ? "male" : gender === "female" ? "female" : "neutral";

  const candidates: string[] = [];

  // Match interests case-insensitively
  for (const userInt of interests) {
    const normalized = userInt.trim().toLowerCase();
    for (const [key, bank] of Object.entries(CUTE_NAMES_BY_INTEREST)) {
      if (
        normalized.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(normalized)
      ) {
        candidates.push(...bank[genderKey]);
        // Also add neutral as options
        if (genderKey !== "neutral") {
          candidates.push(...bank.neutral);
        }
      }
    }
  }

  if (candidates.length === 0) {
    candidates.push(...DEFAULT_POOL[genderKey]);
    candidates.push(...DEFAULT_POOL.neutral);
  }

  // Deduplicate
  return Array.from(new Set(candidates));
}

/**
 * Automatically picks a cute name deterministically or randomly.
 */
export function generateCuteName(options: {
  gender?: GenderType;
  interests?: string[];
  seed?: string | number;
}): string {
  const { gender = "non-binary", interests = [], seed } = options;
  const candidates = getCandidateCuteNames(gender, interests);

  if (candidates.length === 0) return "Sunny Spark";

  if (seed !== undefined) {
    const num =
      typeof seed === "number"
        ? seed
        : seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const index = Math.abs(num) % candidates.length;
    return candidates[index];
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Shuffles and rolls another cute name different from the current name.
 */
export function shuffleCuteName(options: {
  gender?: GenderType;
  interests?: string[];
  currentName?: string;
}): string {
  const candidates = getCandidateCuteNames(options.gender, options.interests);
  const filtered = candidates.filter((n) => n !== options.currentName);
  if (filtered.length === 0) return candidates[0] || "Happy Spark";
  const next = filtered[Math.floor(Math.random() * filtered.length)];
  return next;
}

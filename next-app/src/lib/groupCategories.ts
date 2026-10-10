import {
  Trophy,
  HeartPulse,
  Palette,
  GraduationCap,
  Coffee,
  Mountain,
} from "lucide-react";

export const groupCategories = [
  {
    id: "sports",
    name: "Sports",
    description: "Find your team. Make your next game happen.",
    icon: Trophy,
    color: "mint",
    examples: "Football · Cricket · Badminton",
    image: "/images/categories/sports.jpg", // Generated
  },
  {
    id: "wellbeing",
    name: "Wellbeing",
    description: "Small habits. A healthier, happier you.",
    icon: HeartPulse,
    color: "rose",
    examples: "Yoga · Mindfulness · Fitness",
    image: "/images/categories/wellbeing.jpg", // Generated
  },
  {
    id: "arts",
    name: "Arts & culture",
    description: "A little inspiration goes a long way.",
    icon: Palette,
    color: "lilac",
    examples: "Music · Movies · Photography",
    image: "/images/categories/arts.jpg",
  },
  {
    id: "learning",
    name: "Learning & growth",
    description: "Trade ideas and grow together.",
    icon: GraduationCap,
    color: "sky",
    examples: "Study circles · Tech · Careers",
    image: "/images/categories/learning.jpg",
  },
  {
    id: "social",
    name: "Social & food",
    description: "Good conversations start here.",
    icon: Coffee,
    color: "peach",
    examples: "Coffee · Cooking · Board games",
    image: "/images/categories/social.jpg", // Generated
  },
  {
    id: "outdoors",
    name: "Outdoors",
    description: "Fresh air. New places. Great company.",
    icon: Mountain,
    color: "sand",
    examples: "Hiking · Travel · Cycling",
    image: "/images/categories/outdoors.jpg",
  },
] as const;
export type CategoryId = (typeof groupCategories)[number]["id"];
export function getCategory(id?: string) {
  return groupCategories.find((c) => c.id === id) ?? groupCategories[4];
}

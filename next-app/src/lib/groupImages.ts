export const groupImages: Record<string, string> = {
  // Sports
  cricket: "/images/groups/cricket.webp",
  badminton: "/images/groups/badminton.webp",
  football: "/images/groups/football.webp",
  basketball: "/images/groups/basketball.webp",
  volleyball: "/images/groups/volleyball.webp",
  pickleball: "/images/groups/pickleball.webp",
  tennis: "/images/groups/tennis.webp",
  "table-tennis": "/images/groups/table-tennis.webp",
  sports: "/images/groups/sports.webp",

  // Wellbeing
  "health-wellness": "/images/groups/health-wellness.webp",
  yoga: "/images/groups/yoga.webp",
  mindfulness: "/images/groups/mindfulness.webp",
  fitness: "/images/groups/fitness.webp",

  // Arts & Culture
  music: "/images/groups/music.webp",
  movies: "/images/groups/movies.webp",
  creativity: "/images/groups/creativity.webp",
  photography: "/images/groups/photography.webp",
  dance: "/images/groups/dance.webp",

  // Learning & Growth
  "career-growth": "/images/groups/career-growth.webp",
  technology: "/images/groups/technology.webp",
  books: "/images/groups/books.webp",
  "study-circles": "/images/groups/study-circles.webp",
  languages: "/images/groups/languages.webp",

  // Social & Food
  "food-dining": "/images/groups/food-dining.webp",
  "coffee-chats": "/images/groups/coffee-chats.webp",
  "board-games": "/images/groups/board-games.webp",
  cooking: "/images/groups/cooking.webp",

  // Outdoors
  travel: "/images/groups/travel.webp",
  hiking: "/images/groups/hiking.webp",
  cycling: "/images/groups/cycling.webp",
};

export const categoryImages: Record<string, string> = {
  sports: "/images/groups/category-sports.webp",
  wellbeing: "/images/groups/category-wellbeing.webp",
  arts: "/images/groups/category-arts.webp",
  learning: "/images/groups/category-learning.webp",
  social: "/images/groups/category-social.webp",
  outdoors: "/images/groups/category-outdoors.webp",
};

export function getGroupImage(slug?: string, category?: string): string {
  if (slug && groupImages[slug]) return groupImages[slug];
  if (category && categoryImages[category]) return categoryImages[category];
  return "/images/groups/category-social.webp";
}

export function getCategoryImage(categoryId?: string): string {
  if (categoryId && categoryImages[categoryId]) return categoryImages[categoryId];
  return "/images/groups/category-social.webp";
}


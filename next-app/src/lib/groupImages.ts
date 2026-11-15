export const groupImages: Record<string, string> = {
  // Sports
  cricket: "/images/groups/cricket.jpg",
  badminton: "/images/groups/badminton.jpg",
  football: "/images/groups/football.jpg",
  basketball: "/images/groups/basketball.jpg",
  volleyball: "/images/groups/volleyball.jpg",
  pickleball: "/images/groups/pickleball.jpg",
  tennis: "/images/groups/tennis.jpg",
  "table-tennis": "/images/groups/table-tennis.jpg",
  sports: "/images/groups/sports.jpg",

  // Wellbeing
  "health-wellness": "/images/groups/health-wellness.jpg",
  yoga: "/images/groups/yoga.jpg",
  mindfulness: "/images/groups/mindfulness.jpg",
  fitness: "/images/groups/fitness.jpg",

  // Arts & Culture
  music: "/images/groups/music.jpg",
  movies: "/images/groups/movies.jpg",
  creativity: "/images/groups/creativity.jpg",
  photography: "/images/groups/photography.jpg",
  dance: "/images/groups/dance.jpg",

  // Learning & Growth
  "career-growth": "/images/groups/career-growth.jpg",
  technology: "/images/groups/technology.jpg",
  books: "/images/groups/books.jpg",
  "study-circles": "/images/groups/study-circles.jpg",
  languages: "/images/groups/languages.jpg",

  // Social & Food
  "food-dining": "/images/groups/food-dining.jpg",
  "coffee-chats": "/images/groups/coffee-chats.jpg",
  "board-games": "/images/groups/board-games.jpg",
  cooking: "/images/groups/cooking.jpg",

  // Outdoors
  travel: "/images/groups/travel.jpg",
  hiking: "/images/groups/hiking.jpg",
  cycling: "/images/groups/cycling.jpg",
};

export const categoryImages: Record<string, string> = {
  sports: "/images/groups/category-sports.jpg",
  wellbeing: "/images/groups/category-wellbeing.jpg",
  arts: "/images/groups/category-arts.jpg",
  learning: "/images/groups/category-learning.jpg",
  social: "/images/groups/category-social.jpg",
  outdoors: "/images/groups/category-outdoors.jpg",
};

export function getGroupImage(slug?: string, category?: string): string {
  if (slug && groupImages[slug]) return groupImages[slug];
  if (category && categoryImages[category]) return categoryImages[category];
  return "/images/groups/category-social.jpg";
}

export function getCategoryImage(categoryId?: string): string {
  if (categoryId && categoryImages[categoryId]) return categoryImages[categoryId];
  return "/images/groups/category-social.jpg";
}

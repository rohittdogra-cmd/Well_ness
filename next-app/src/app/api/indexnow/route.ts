import { NextResponse } from "next/server";
import { groupImages } from "@/lib/groupImages";

const KEY = "4a59d871e98c48a7b973ef841cf2560a";
const HOST = "stress-unwind.com";
const BASE_URL = `https://${HOST}`;

const staticPaths = [
  "/",
  "/groups",
  "/book-activities",
  "/psychologists",
  "/community",
  "/discuss",
  "/about",
  "/membership",
  "/meetup-activities",
  "/social-gathering",
  "/task-sharing",
  "/apply-provider",
  "/contact",
  "/careers",
  "/programs/meetup",
  "/programs/exercise",
  "/programs/socialGathering",
  "/programs/taskAllocation",
  "/programs/boxCricket",
  "/programs/pickleball",
  "/programs/badminton",
  "/programs/tennis",
];

export async function POST() {
  const groupPaths = Object.keys(groupImages || {}).map((slug) => `/groups/${slug}`);
  const allUrls = [...staticPaths, ...groupPaths].map((p) => `${BASE_URL}${p}`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `${BASE_URL}/${KEY}.txt`,
    urlList: allUrls,
  };

  const results: Record<string, number> = {};

  for (const endpoint of [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ]) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      results[endpoint] = res.status;
    } catch {
      results[endpoint] = 500;
    }
  }

  return NextResponse.json({
    success: true,
    urlsSubmitted: allUrls.length,
    results,
  });
}

export async function GET() {
  return POST();
}

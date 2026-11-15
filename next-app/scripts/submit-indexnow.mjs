const KEY = "4a59d871e98c48a7b973ef841cf2560a";
const HOST = "stress-unwind.com";
const BASE_URL = `https://${HOST}`;

async function run() {
  console.log("Fetching live sitemap from https://stress-unwind.com/sitemap.xml...");
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  const sitemapText = await sitemapRes.text();

  // Extract all <loc> URLs
  const urls = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(sitemapText)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} URLs in live sitemap.`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `${BASE_URL}/${KEY}.txt`,
    urlList: urls,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      console.log(`[${endpoint}] Response: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error(`[${endpoint}] Error:`, err.message);
    }
  }
}

run();

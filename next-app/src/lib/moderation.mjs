/** Shared dictionary for member-written content. Auth, IDs and URLs are excluded. */
export const OFFENSIVE_WORDS = [
  "fuck",
  "fucks",
  "fucked",
  "fucker",
  "fuckers",
  "fucking",
  "motherfucker",
  "motherfuckers",
  "motherfucking",
  "shit",
  "shits",
  "shitty",
  "bullshit",
  "bitch",
  "bitches",
  "bitching",
  "bastard",
  "bastards",
  "asshole",
  "assholes",
  "arsehole",
  "arseholes",
  "cunt",
  "cunts",
  "dick",
  "dicks",
  "dickhead",
  "dickheads",
  "cock",
  "cocks",
  "pussy",
  "pussies",
  "wanker",
  "wankers",
  "slut",
  "sluts",
  "whore",
  "whores",
  "nigger",
  "niggers",
  "nigga",
  "niggas",
  "faggot",
  "faggots",
  "retard",
  "retards",
  "retarded",
  "idiot",
  "idiots",
  "moron",
  "morons",
  "dumbass",
  "dumbasses",
  "chutiya",
  "chutiye",
  "chutiyapa",
  "madarchod",
  "maderchod",
  "behenchod",
  "bhenchod",
  "bhosdike",
  "bhosdiwale",
  "gaand",
  "gandu",
  "randi",
  "harami",
  "चूतिया",
  "चूतिये",
  "मादरचोद",
  "बहनचोद",
  "भोसड़ीके",
  "गांडू",
  "हरामी",
];
// Whole-word matching avoids false positives in words such as class or Scunthorpe.
// Allow common leetspeak, repeated letters, and separated spellings (f.u.c.k).
const equivalents = {
  a: "[a@4]",
  b: "[b8]",
  e: "[e3]",
  g: "[g69]",
  i: "[i!1]",
  o: "[o0]",
  s: "[s$5]",
  t: "[t7]",
};
export const CONTENT_FIELDS = [
  "name",
  "body",
  "bio",
  "title",
  "description",
  "message",
  "subject",
  "alias",
  "reason",
  "interests",
  "availability",
  "goal",
  "space_name",
  "spaceName",
  "location",
];
const contentKeys = new Set(CONTENT_FIELDS.flatMap((key) => [key, `p_${key}`]));
const escape = (char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const variants = OFFENSIVE_WORDS.slice()
  .sort((a, b) => b.length - a.length)
  .map((word) =>
    Array.from(word)
      .map((char) => `${equivalents[char] || escape(char)}{1,3}`)
      .join("[\\s._*\\-]?"),
  )
  .join("|");
const offensive = new RegExp(
  `(?<![\\p{L}\\p{N}\\p{M}])(?:${variants})(?![\\p{L}\\p{N}\\p{M}])`,
  "giu",
);
/** @param {string} text */
export function maskOffensiveText(text) {
  return text.replace(offensive, (match) =>
    "*".repeat(Array.from(match).length),
  );
}
/** Preserve structural values, identifiers, passwords, emails and links. */
export function maskContent(value, field = "") {
  if (typeof value === "string")
    return contentKeys.has(field) ? maskOffensiveText(value) : value;
  if (Array.isArray(value))
    return value.map((item) => maskContent(item, field));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, maskContent(item, key)]),
    );
  return value;
}
/** All Supabase REST reads and writes share the same content boundary. */
export function createModeratedFetch(fetchImpl = fetch) {
  return async (input, init) => {
    let request = new Request(input, init);
    if (!new URL(request.url).pathname.startsWith("/rest/v1/"))
      return fetchImpl(request);
    if (
      !["GET", "HEAD"].includes(request.method) &&
      request.headers.get("content-type")?.includes("application/json")
    ) {
      const body = await request.clone().text();
      if (body) {
        const headers = new Headers(request.headers);
        headers.delete("content-length");
        request = new Request(request, {
          headers,
          body: JSON.stringify(maskContent(JSON.parse(body))),
        });
      }
    }
    const response = await fetchImpl(request);
    if (
      !response.ok ||
      response.status === 204 ||
      request.method === "HEAD" ||
      !response.headers.get("content-type")?.includes("json")
    )
      return response;
    const data = await response.clone().json();
    const headers = new Headers(response.headers);
    for (const header of ["content-length", "content-encoding", "etag"])
      headers.delete(header);
    return new Response(JSON.stringify(maskContent(data)), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

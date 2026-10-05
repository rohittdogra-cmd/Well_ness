/** UI-only fixture server. Never imported by the application or deployed. */
import { createServer } from "node:http";
const id = "11111111-1111-4111-8111-111111111111";
const user = {
  id,
  aud: "authenticated",
  role: "authenticated",
  email: "alex@example.test",
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: new Date().toISOString(),
};
// Mirrors the group_summaries view: the database resolves member counts and the
// caller's membership, so the client receives rows rather than member id lists.
const groups = [
  {
    id: 1,
    slug: "cricket",
    category: "sports",
    name: "Cricket",
    description: "Find a team. Plan your next match.",
    image: "/images/groups/cricket.jpg",
    member_count: 1,
    joined: true,
  },
  {
    id: 2,
    slug: "music",
    category: "arts",
    name: "Music",
    description: "Share playlists and discover new sounds.",
    image: "/images/groups/music.jpg",
    member_count: 5,
    joined: false,
  },
  {
    id: 3,
    slug: "health-wellness",
    category: "wellbeing",
    name: "Health & wellness",
    description: "Build better habits together.",
    image: "/images/groups/health-wellness.jpg",
    member_count: 12,
    joined: false,
  },
  {
    id: 4,
    slug: "badminton",
    category: "sports",
    name: "Badminton",
    description: "Smash it! Weekly games and tournaments.",
    image: "/images/groups/badminton.jpg",
    member_count: 8,
    joined: false,
  },
  {
    id: 5,
    slug: "table-tennis",
    category: "sports",
    name: "Table Tennis",
    description: "Ping pong enthusiasts gather here.",
    image: "/images/groups/table-tennis.jpg",
    member_count: 15,
    joined: false,
  },
  {
    id: 6,
    slug: "football",
    category: "sports",
    name: "Football",
    description: "Weekend kickabouts and watch parties.",
    image: "/images/groups/football.jpg",
    member_count: 24,
    joined: false,
  },
  {
    id: 7,
    slug: "horse-riding",
    category: "sports",
    name: "Horse Riding",
    description: "Equestrian club for all skill levels.",
    image: "/images/groups/horse-riding.jpg",
    member_count: 4,
    joined: false,
  },
  {
    id: 8,
    slug: "photography",
    category: "arts",
    name: "Photography",
    description: "Capture the moment. Photowalks and tips.",
    image: "/images/groups/photography.jpg",
    member_count: 19,
    joined: false,
  }
];
let nextGroupId = 9;
let posts = [
  {
    id: 1,
    body: "Anyone up for a lunchtime walk this week?",
    created_at: new Date().toISOString(),
    alias: "Maya",
    mine: false,
    anonymous: false,
    likes: 2,
    liked: false,
    replies: [],
  },
];
const member = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Maya",
  avatar: 1,
  bio: "Lunch walks and books.",
  interests: ["Books"],
};
let connections = [];
let messages = [];
const defaultProfile = {
  name: "Alex",
  avatar: 0,
  bio: "Here for good company.",
  interests: ["Music"],
  availability: ["After work"],
  goal: "Meet my people",
};
let profile = { ...defaultProfile };
const session = {
  id: 1,
  creator: id,
  title: "A little lunchtime reset",
  description: "Walk, talk, and get some fresh air.",
  program_type: "meetup",
  date_time: new Date(Date.now() + 86400000).toISOString(),
  created_at: new Date().toISOString(),
  max_participants: 8,
  space_name: "Garden",
  location: "Courtyard",
  participant_count: 1,
  joined: true,
};
function authSession() {
  const enc = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return {
    access_token:
      enc({ alg: "HS256", typ: "JWT" }) +
      "." +
      enc({ sub: id, exp, aud: "authenticated", role: "authenticated" }) +
      ".dGVzdA",
    refresh_token: "test",
    expires_in: 3600,
    expires_at: exp,
    token_type: "bearer",
    user,
  };
}
const reset = () => {
  connections = [];
  messages = [];
  profile = { ...defaultProfile };
  groups.length = 0;
  groups.push(
    {
      id: 1,
      slug: "cricket",
      category: "sports",
      name: "Cricket",
      description: "Find a team. Plan your next match.",
      image: "/images/groups/cricket.jpg",
      member_count: 1,
      joined: true,
    },
    {
      id: 2,
      slug: "music",
      category: "arts",
      name: "Music",
      description: "Share playlists and discover new sounds.",
      member_count: 0,
      joined: false,
    },
    {
      id: 3,
      slug: "health-wellness",
      category: "wellbeing",
      name: "Health & wellness",
      description: "Build better habits together.",
      member_count: 0,
      joined: false,
    },
  );
  nextGroupId = 4;
};
createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const params = url.searchParams;
  // PostgREST encodes operators as `eq.sports`; the fixture compares raw values.
  const eq = (name) => {
    const raw = params.get(name);
    return raw === null || raw.startsWith("eq.") === false
      ? raw
      : raw.slice(3);
  };
  /** maybeSingle() asks for a bare object; a list read asks for an array. */
  const wantsObject = (req.headers.accept ?? "").includes("vnd.pgrst.object");
  let data = [];
  if (path === "/auth/v1/settings") data = { external: { linkedin_oidc: false } };
  else if (path === "/auth/v1/signup") data = { user, session: null };
  else if (path === "/auth/v1/logout") data = {};
  else if (path === "/auth/v1/user") data = user;
  else if (path === "/auth/v1/otp") data = {};
  else if (path === "/auth/v1/verify") {
    if (body.token !== "123456" && body.token_hash !== "valid-test-hash") {
      res.statusCode = 403;
      data = { code: "otp_expired", msg: "Token has expired or is invalid" };
    } else data = authSession();
  } else if (path === "/auth/v1/token") {
    if (params.get("grant_type") === "password") {
      if (body.password === "Correct-password1") data = authSession();
      else {
        res.statusCode = 400;
        data = {
          code: "invalid_credentials",
          msg: "Invalid login credentials",
        };
      }
    } else {
      res.statusCode = 400;
      data = { code: "bad_code_verifier", msg: "Invalid verifier" };
    }
  } else if (path === "/rest/v1/rpc/find_members")
    data = body.p_offset ? [] : [member];
  else if (path === "/rest/v1/rpc/list_connections") data = connections;
  else if (path === "/rest/v1/rpc/request_connection") {
    connections = [
      {
        id: 1,
        requester: id,
        recipient: member.id,
        status: "pending",
        member_id: member.id,
        name: member.name,
        avatar: member.avatar,
      },
    ];
    data = 1;
  } else if (path === "/test/accept-connection") {
    connections[0].status = "accepted";
    data = null;
  } else if (path === "/test/reset") {
    reset();
    data = null;
  } else if (path === "/test/missing-profile") {
    profile = null;
    data = null;
  } else if (path === "/rest/v1/direct_messages") data = [...messages].reverse();
  else if (path === "/rest/v1/rpc/send_direct_message") {
    const m = {
      id: messages.length + 1,
      sender: id,
      body: body.p_body,
      created_at: new Date().toISOString(),
    };
    messages.push(m);
    data = m.id;
  } else if (path === "/rest/v1/profiles") {
    if (req.method === "POST" || req.method === "PATCH") {
      profile = { ...(profile ?? defaultProfile), ...body };
      data = profile;
    } else data = profile;
  }
  // ── Group directory: server-side filtering, search and paging ─────────────
  else if (path === "/rest/v1/rpc/create_group") {
    const group = {
      id: nextGroupId++,
      slug: "new-subgroup",
      name: body.p_name,
      description: body.p_description,
      category: body.p_category,
      member_count: 1,
      joined: true,
    };
    groups.push(group);
    data = group.id;
  } else if (path === "/rest/v1/group_summaries" || path === "/rest/v1/groups") {
    const category = eq("category");
    const joined = eq("joined");
    const slug = eq("slug");
    const or = params.get("or");
    const from = Number(params.get("offset") ?? "0");
    const to = Number(params.get("limit") ?? "50");
    let rows = [...groups];
    if (slug) rows = rows.filter((g) => g.slug === slug);
    if (category) rows = rows.filter((g) => g.category === category);
    if (joined === "true") rows = rows.filter((g) => g.joined);
    if (or) {
      // or=(name.ilike.%music%,description.ilike.%music%)
      const needle = or
        .split(",")[0]
        .split(".ilike.")
        .pop()
        .replace(/%/g, "")
        .toLowerCase();
      rows = needle
        ? rows.filter((g) =>
            `${g.name} ${g.description}`.toLowerCase().includes(needle),
          )
        : rows;
    }
    const sliced = rows.slice(from, from + to);
    data = wantsObject ? (sliced[0] ?? null) : sliced;
  } else if (path === "/rest/v1/rpc/group_category_counts")
    data = groups.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] ?? 0) + 1;
      return acc;
    }, {});
  else if (path === "/rest/v1/rpc/toggle_group") {
    const group = groups.find((g) => g.id === body.p_group);
    if (group) {
      group.joined = Boolean(body.p_join);
      group.member_count = body.p_join ? 1 : 0;
    }
    data = null;
  } else if (path === "/rest/v1/rpc/get_feed") data = posts;
  else if (path === "/rest/v1/rpc/publish_post") {
    const p = {
      id: Date.now(),
      body: body.p_body,
      created_at: new Date().toISOString(),
      alias: body.p_anonymous ? "Quiet a1b2c3" : "Alex",
      mine: true,
      anonymous: body.p_anonymous,
      likes: 0,
      liked: false,
      replies: [],
    };
    posts = [p, ...posts];
    data = p.id;
  } else if (path === "/rest/v1/rpc/is_admin") data = false;
  else if (path === "/rest/v1/check_ins") data = null;
  // ── Activities: session_summaries carries participant_count and joined ─────
  else if (path === "/rest/v1/session_summaries" || path === "/rest/v1/sessions") {
    const type = eq("program_type");
    const wanted = eq("id");
    const matches =
      (!type || type === session.program_type) &&
      (!wanted || String(wanted) === String(session.id));
    data = matches
      ? wantsObject
        ? { ...session }
        : [{ ...session }]
      : wantsObject
        ? null
        : [];
  } else if (path === "/rest/v1/session_members") {
    // My Sessions asks for `select=session_id`; the roster asks for `user_id`.
    data =
      params.get("select") === "session_id" ? [{ session_id: 1 }] : [{ user_id: id }];
  } else if (path === "/rest/v1/tasks") data = [];
  else if (path === "/rest/v1/providers") data = [];
  else if (path === "/rest/v1/provider_bookings") data = [];
  else if (path === "/rest/v1/activity_logs") data = [];
  else if (path === "/rest/v1/notifications") {
    const head = req.method === "HEAD";
    res.statusCode = head ? 200 : 200;
    data = head ? null : [];
  } else if (path === "/rest/v1/contact_requests") data = null;
  else if (path === "/rest/v1/rpc/submit_contact_request") data = 1;
  res.end(JSON.stringify(data));
}).listen(54329, "127.0.0.1", () => console.log("UI fixture server on 54329"));